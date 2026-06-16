const crypto = require("crypto");
const {
  BrevoClient,
} = require("@getbrevo/brevo");
const prisma = require("../../config/db");
const env = require("../../config/env");
const {
  logActivity,
} = require("../activity/activity.service");

const conversationInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  customer: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
      email: true,
    },
  },
  lead: {
    select: {
      id: true,
      fullName: true,
      companyName: true,
      email: true,
      status: true,
    },
  },
  messages: {
    orderBy: {
      createdAt: "desc",
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  },
};

const createPixelBuffer = () =>
  Buffer.from(
    "R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    "base64"
  );

const getBrevoClient = () => {
  if (
    !process.env.BREVO_API_KEY ||
    !env.emailFromAddress
  ) {
    throw new Error(
      "Brevo configuration is missing"
    );
  }

  return new BrevoClient({
    apiKey:
      process.env.BREVO_API_KEY,
  });
};

const mapRecipients = (
  recipients
) =>
  String(recipients || "")
    .split(",")
    .map((email) =>
      email.trim()
    )
    .filter(Boolean)
    .map((email) => ({ email }));

const assertEntityExists = async (
  model,
  id,
  errorMessage
) => {
  if (!id) {
    return null;
  }

  const entity =
    await prisma[model].findUnique({
      where: { id },
    });

  if (!entity) {
    throw new Error(
      errorMessage
    );
  }

  return entity;
};

const enrichHtmlBody = (
  bodyHtml,
  bodyText,
  trackingToken
) => {
  const baseHtml =
    bodyHtml ||
    `<div>${bodyText
      .split("\n")
      .map((line) => `<p>${line}</p>`)
      .join("")}</div>`;

  const pixelUrl = `${env.apiBaseUrl}/api/v1/emails/track/open/${trackingToken}`;

  return `${baseHtml}<img src="${pixelUrl}" alt="" width="1" height="1" style="display:none;" />`;
};

const ensureConversation = async ({
  tx,
  conversationId,
  customerId,
  leadId,
  subject,
  createdById,
}) => {
  if (conversationId) {
    const existingConversation =
      await tx.emailConversation.findUnique(
        {
          where: {
            id: conversationId,
          },
        }
      );

    if (!existingConversation) {
      throw new Error(
        "Email conversation not found"
      );
    }

    return existingConversation;
  }

  return tx.emailConversation.create({
    data: {
      subject,
      threadKey:
        crypto.randomUUID(),
      customerId:
        customerId || null,
      leadId:
        leadId || null,
      createdById,
    },
  });
};

const updateConversationLastMessage =
  (tx, conversationId, timestamp) =>
    tx.emailConversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: timestamp,
      },
    });

const sendEmail = async (
  payload,
  createdById
) => {
  await Promise.all([
    assertEntityExists(
      "customer",
      payload.customerId,
      "Customer not found"
    ),
    assertEntityExists(
      "lead",
      payload.leadId,
      "Lead not found"
    ),
  ]);

  const trackingToken =
    crypto.randomUUID();
  const bodyHtml =
    enrichHtmlBody(
      payload.bodyHtml,
      payload.bodyText,
      trackingToken
    );

  const initialRecord =
    await prisma.$transaction(
      async (tx) => {
        const conversation =
          await ensureConversation({
            tx,
            conversationId:
              payload.conversationId,
            customerId:
              payload.customerId,
            leadId:
              payload.leadId,
            subject:
              payload.subject,
            createdById,
          });

        const emailMessage =
          await tx.emailMessage.create(
            {
              data: {
                conversationId:
                  conversation.id,
                customerId:
                  payload.customerId ||
                  null,
                leadId:
                  payload.leadId ||
                  null,
                createdById,
                direction:
                  "OUTBOUND",
                status: "PENDING",
                fromName:
                  env.emailFromName,
                fromEmail:
                  env.emailFromAddress,
                toEmail:
                  payload.toEmail,
                cc:
                  payload.cc || null,
                bcc:
                  payload.bcc || null,
                subject:
                  payload.subject,
                bodyHtml,
                bodyText:
                  payload.bodyText,
                trackingToken,
              },
            }
          );

        await updateConversationLastMessage(
          tx,
          conversation.id,
          new Date()
        );

        return {
          conversationId:
            conversation.id,
          emailMessage,
        };
      }
    );

  try {
    const brevoClient =
      getBrevoClient();

    const result =
      await brevoClient.transactionalEmails.sendTransacEmail(
        {
          sender: {
            email:
              env.emailFromAddress,
            name:
              env.emailFromName,
          },
          to: mapRecipients(
            payload.toEmail
          ),
          ...(payload.cc
            ? {
                cc: mapRecipients(
                  payload.cc
                ),
              }
            : {}),
          ...(payload.bcc
            ? {
                bcc: mapRecipients(
                  payload.bcc
                ),
              }
            : {}),
          subject:
            payload.subject,
          htmlContent:
            bodyHtml,
        }
      );

    const updatedMessage =
      await prisma.emailMessage.update(
        {
          where: {
            id: initialRecord
              .emailMessage.id,
          },
          data: {
            status: "SENT",
            sentAt: new Date(),
            providerMessageId:
              result?.messageId ||
              result?.body
                ?.messageId ||
              result?.id ||
              null,
          },
        }
      );

    await logActivity({
      type: "EMAIL",
      subject:
        payload.subject,
      description:
        payload.bodyText,
      customerId:
        payload.customerId,
      leadId: payload.leadId,
      emailMessageId:
        updatedMessage.id,
      createdById,
      metadata: {
        direction:
          "OUTBOUND",
        toEmail:
          payload.toEmail,
      },
    });

    return prisma.emailConversation.findUnique(
      {
        where: {
          id: initialRecord.conversationId,
        },
        include:
          conversationInclude,
      }
    );
  } catch (error) {
    await prisma.emailMessage.update({
      where: {
        id: initialRecord
          .emailMessage.id,
      },
      data: {
        status: "FAILED",
        metadata: {
          failureReason:
            error.message,
        },
      },
    });

    throw error;
  }
};

const receiveInboundEmail = async (
  payload
) => {
  await Promise.all([
    assertEntityExists(
      "customer",
      payload.customerId,
      "Customer not found"
    ),
    assertEntityExists(
      "lead",
      payload.leadId,
      "Lead not found"
    ),
  ]);

  const conversation =
    await prisma.$transaction(
      async (tx) => {
        const fallbackUser =
          await tx.user.findFirst({
            where: {
              isActive: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          });

        if (!fallbackUser) {
          throw new Error(
            "No active CRM user available for inbound email logging"
          );
        }

        let emailConversation =
          null;

        if (payload.conversationId) {
          emailConversation =
            await tx.emailConversation.findUnique(
              {
                where: {
                  id: payload.conversationId,
                },
              }
            );
        } else if (
          payload.threadKey
        ) {
          emailConversation =
            await tx.emailConversation.findUnique(
              {
                where: {
                  threadKey:
                    payload.threadKey,
                },
              }
            );
        }

        if (!emailConversation) {
          emailConversation =
            await tx.emailConversation.create(
              {
                data: {
                  subject:
                    payload.subject,
                  threadKey:
                    payload.threadKey ||
                    crypto.randomUUID(),
                  customerId:
                    payload.customerId ||
                    null,
                  leadId:
                    payload.leadId ||
                    null,
                  createdById:
                    fallbackUser.id,
                },
              }
            );
        }

        const fallbackCreator =
          emailConversation.createdById ||
          fallbackUser.id;

        const emailMessage =
          await tx.emailMessage.create({
            data: {
              conversationId:
                emailConversation.id,
              customerId:
                payload.customerId ||
                emailConversation.customerId ||
                null,
              leadId:
                payload.leadId ||
                emailConversation.leadId ||
                null,
              createdById:
                fallbackCreator,
              direction:
                "INBOUND",
              status:
                "RECEIVED",
              fromName:
                payload.fromName ||
                null,
              fromEmail:
                payload.fromEmail,
              toEmail:
                payload.toEmail,
              subject:
                payload.subject,
              bodyText:
                payload.bodyText,
              bodyHtml:
                payload.bodyHtml ||
                null,
              providerMessageId:
                payload.providerMessageId ||
                null,
              receivedAt:
                new Date(),
            },
          });

        await tx.emailMessage.updateMany(
          {
            where: {
              conversationId:
                emailConversation.id,
              direction:
                "OUTBOUND",
              repliedAt: null,
            },
            data: {
              repliedAt:
                new Date(),
              status: "REPLIED",
            },
          }
        );

        await updateConversationLastMessage(
          tx,
          emailConversation.id,
          new Date()
        );

        await logActivity({
          tx,
          type: "EMAIL",
          subject:
            payload.subject,
          description:
            payload.bodyText,
          customerId:
            payload.customerId ||
            emailConversation.customerId,
          leadId:
            payload.leadId ||
            emailConversation.leadId,
          emailMessageId:
            emailMessage.id,
          createdById:
            fallbackCreator,
          metadata: {
            direction:
              "INBOUND",
            fromEmail:
              payload.fromEmail,
          },
        });

        return emailConversation.id;
      }
    );

  return prisma.emailConversation.findUnique(
    {
      where: { id: conversation },
      include: conversationInclude,
    }
  );
};

const getEmailConversations =
  async (filters = {}) => {
    const where = {
      ...(filters.customerId
        ? {
            customerId:
              filters.customerId,
          }
        : {}),
      ...(filters.leadId
        ? {
            leadId:
              filters.leadId,
          }
        : {}),
      ...(filters.conversationId
        ? {
            id: filters.conversationId,
          }
        : {}),
    };

    return prisma.emailConversation.findMany({
      where,
      include: conversationInclude,
      orderBy: {
        lastMessageAt: "desc",
      },
    });
  };

const trackEmailOpen = async (
  trackingToken
) => {
  const emailMessage =
    await prisma.emailMessage.findUnique(
      {
        where: {
          trackingToken,
        },
      }
    );

  if (!emailMessage) {
    return createPixelBuffer();
  }

  if (!emailMessage.openedAt) {
    await prisma.emailMessage.update({
      where: {
        id: emailMessage.id,
      },
      data: {
        openedAt: new Date(),
        status:
          emailMessage.status ===
            "REPLIED"
            ? "REPLIED"
            : "OPENED",
      },
    });
  }

  return createPixelBuffer();
};

module.exports = {
  sendEmail,
  receiveInboundEmail,
  getEmailConversations,
  trackEmailOpen,
};
