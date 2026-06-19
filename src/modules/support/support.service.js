const prisma = require("../../config/db");

const generateTicketNumber = async () => {
  const count = await prisma.supportTicket.count();
  const serial = String(count + 1).padStart(4, "0");
  return `TKT-${serial}`;
};

const createTicket = async (data, createdById) => {
  const ticketNumber = await generateTicketNumber();
  
  return prisma.supportTicket.create({
    data: {
      ...data,
      ticketNumber,
      createdById,
    },
    include: {
      customer: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const getTickets = async (filters = {}) => {
  const { status, priority, customerId, assignedToId, search } = filters;
  
  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (customerId) where.customerId = customerId;
  if (assignedToId) where.assignedToId = assignedToId;
  if (search) {
    where.OR = [
      { ticketNumber: { contains: search, mode: "insensitive" } },
      { subject: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.supportTicket.findMany({
    where,
    include: {
      customer: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getTicketById = async (id) => {
  return prisma.supportTicket.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const updateTicket = async (id, data) => {
  // If status is changed to RESOLVED or CLOSED, set resolvedAt if not already set
  const updateData = { ...data };
  if ((data.status === "RESOLVED" || data.status === "CLOSED") && !data.resolvedAt) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
  }

  return prisma.supportTicket.update({
    where: { id },
    data: updateData,
    include: {
      customer: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
    },
  });
};

const deleteTicket = async (id) => {
  return prisma.supportTicket.delete({
    where: { id },
  });
};

module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  deleteTicket,
};
