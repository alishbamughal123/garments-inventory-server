const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { BrevoClient } = require("@getbrevo/brevo");
const prisma = require("../../config/db");
const env = require("../../config/env");
const { logActivity } = require("../activity/activity.service");

let etherealTransporter = null;

const getEtherealTransporter = async () => {
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`✉️ Automatic Ethereal SMTP initialized for test user: ${testAccount.user}`);
    } catch (err) {
      console.error("Failed to create Ethereal test account:", err.message);
    }
  }
  return etherealTransporter;
};

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
  if (!process.env.BREVO_API_KEY || !env.emailFromAddress) {
    throw new Error("Brevo configuration is missing");
  }

  return new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });
};

const mapRecipients = (recipients) =>
  String(recipients || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

const assertEntityExists = async (model, id, errorMessage) => {
  if (!id) return null;
  const entity = await prisma[model].findUnique({ where: { id } });
  if (!entity) throw new Error(errorMessage);
  return entity;
};

const enrichHtmlBody = (bodyHtml, bodyText, trackingToken) => {
  const baseHtml =
    bodyHtml ||
    `<div>${(bodyText || "")
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
    const existingConversation = await tx.emailConversation.findUnique({
      where: { id: conversationId },
    });
    if (!existingConversation) throw new Error("Email conversation not found");
    return existingConversation;
  }

  await assertEntityExists(
    "customer",
    customerId,
    "Selected customer does not exist"
  );
  await assertEntityExists("lead", leadId, "Selected lead does not exist");

  return tx.emailConversation.create({
    data: {
      subject,
      threadKey: `THREAD-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`,
      customerId: customerId || null,
      leadId: leadId || null,
      createdById,
    },
  });
};

const updateConversationLastMessage = async (tx, conversationId, timestamp) =>
  tx.emailConversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: timestamp },
  });

const sendEmail = async (payload, createdById) => {
  if (!payload.toEmail) {
    throw new Error("Recipient email address is required");
  }
  if (!payload.subject) {
    throw new Error("Email subject is required");
  }
  if (!payload.bodyText && !payload.bodyHtml) {
    throw new Error("Email body content is required");
  }

  const trackingToken = crypto.randomBytes(16).toString("hex");
  const bodyHtml = enrichHtmlBody(
    payload.bodyHtml,
    payload.bodyText,
    trackingToken
  );

  const initialRecord = await prisma.$transaction(async (tx) => {
    const conversation = await ensureConversation({
      tx,
      conversationId: payload.conversationId,
      customerId: payload.customerId,
      leadId: payload.leadId,
      subject: payload.subject,
      createdById,
    });

    const emailMessage = await tx.emailMessage.create({
      data: {
        conversationId: conversation.id,
        customerId: payload.customerId || null,
        leadId: payload.leadId || null,
        createdById,
        direction: "OUTBOUND",
        status: "PENDING",
        fromName: env.emailFromName || "Nordic Prowear",
        fromEmail: env.emailFromAddress || "support@nordicprowear.com",
        toEmail: payload.toEmail,
        cc: payload.cc || null,
        bcc: payload.bcc || null,
        subject: payload.subject,
        bodyHtml,
        bodyText: payload.bodyText || "",
        trackingToken,
      },
    });

    await updateConversationLastMessage(tx, conversation.id, new Date());

    return {
      conversationId: conversation.id,
      emailMessage,
    };
  });

  try {
    let providerMessageId = null;

    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      try {
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Nordic Prowear Inventory <onboarding@resend.dev>",
            to: [payload.toEmail],
            subject: payload.subject,
            html: bodyHtml,
          }),
        });

        const resData = await resendRes.json();
        if (resendRes.ok && resData.id) {
          providerMessageId = resData.id;
          console.log(`🚀 Real Email Sent via Resend API to ${payload.toEmail} (ID: ${providerMessageId})`);
        } else {
          console.warn("Resend API notice:", resData);
          providerMessageId = `RESEND-${Date.now()}`;
        }
      } catch (resendErr) {
        console.error("Resend API error:", resendErr.message);
        providerMessageId = `RESEND-ERR-${Date.now()}`;
      }
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${env.emailFromName || "Nordic Prowear"}" <${process.env.SMTP_USER}>`,
        to: payload.toEmail,
        cc: payload.cc || undefined,
        bcc: payload.bcc || undefined,
        subject: payload.subject,
        text: payload.bodyText,
        html: bodyHtml,
      });
      providerMessageId = info.messageId;
      console.log(`✉️ Live SMTP email sent to ${payload.toEmail} (ID: ${providerMessageId})`);
    } else {
      providerMessageId = `SIMULATED-${Date.now()}`;
      console.log(`✉️ [Email Dispatched] To: ${payload.toEmail} | Subject: ${payload.subject}`);
    }

    const updatedMessage = await prisma.emailMessage.update({
      where: {
        id: initialRecord.emailMessage.id,
      },
      data: {
        status: "SENT",
        sentAt: new Date(),
        providerMessageId,
      },
    });

    await logActivity({
      type: "EMAIL",
      subject: payload.subject,
      description: payload.bodyText,
      customerId: payload.customerId,
      leadId: payload.leadId,
      emailMessageId: updatedMessage.id,
      createdById,
      metadata: {
        direction: "OUTBOUND",
        toEmail: payload.toEmail,
        trackingToken,
      },
    });

    return updatedMessage;
  } catch (error) {
    console.error("Email dispatch failed:", error.message);
    await prisma.emailMessage.update({
      where: {
        id: initialRecord.emailMessage.id,
      },
      data: {
        status: "FAILED",
      },
    });

    // Don't throw error in simulation mode if credentials absent
    if (!process.env.SMTP_PASS && !process.env.BREVO_API_KEY) {
      return initialRecord.emailMessage;
    }
    throw error;
  }
};

module.exports = {
  sendEmail,
};
