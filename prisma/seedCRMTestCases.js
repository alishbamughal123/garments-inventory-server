const prisma = require("../src/config/db");

const TEST_EMAIL = "alishbaramzanmughal@gmail.com";

async function seedCRM() {
  console.log(`🚀 Starting CRM Test Data Seeding for ${TEST_EMAIL}...`);

  // 1. Get Admin User
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.error("No user found in DB. Please run seed script first!");
    return;
  }

  // Update Admin user email to new testing email
  await prisma.user.update({
    where: { id: adminUser.id },
    data: { email: TEST_EMAIL },
  });
  console.log("✅ Admin user email updated to:", TEST_EMAIL);

  // 2. Create / Sync Customers
  let customer1 = await prisma.customer.findFirst({ where: { phoneNumber: "+47 22 12 34 56" } });
  if (!customer1) {
    customer1 = await prisma.customer.create({
      data: {
        fullName: "Dr. Astrid Lindgren",
        companyName: "Oslo Medical & Health Center",
        designation: "Procurement Director",
        phoneNumber: "+47 22 12 34 56",
        email: "orders@oslohealth.no",
        address: "Karl Johans gate 15",
        city: "Oslo",
        customerType: "WHOLESALE",
        status: "ACTIVE",
        totalOrders: 12,
        totalSpent: 450000.0,
        notes: "VIP Wholesale Customer for Healthcare Scrubs & Trousers.",
      },
    });
  }

  let customer2 = await prisma.customer.findFirst({ where: { phoneNumber: "+47 55 98 76 54" } });
  if (!customer2) {
    customer2 = await prisma.customer.create({
      data: {
        fullName: "Lars Olsen",
        companyName: "Nordic Hotel & Restaurant Group",
        designation: "Operations Manager",
        phoneNumber: "+47 55 98 76 54",
        email: TEST_EMAIL,
        address: "Bryggen 8",
        city: "Bergen",
        customerType: "VIP",
        status: "ACTIVE",
        totalOrders: 25,
        totalSpent: 1250000.0,
        notes: "Corporate Client for Chef Jackets, Aprons, and Service Polo Shirts.",
      },
    });
  } else {
    customer2 = await prisma.customer.update({
      where: { id: customer2.id },
      data: { email: TEST_EMAIL },
    });
  }

  console.log("✅ Customers created/synced:", customer1.fullName, customer2.fullName);

  // 3. Create Leads
  const lead1 = await prisma.lead.create({
    data: {
      fullName: "Alexander Rybak",
      companyName: "Scandi Workwear Supplies",
      designation: "Purchase Manager",
      email: TEST_EMAIL,
      phoneNumber: `+47 91 23 ${Math.floor(1000 + Math.random() * 9000)}`,
      city: "Stavanger",
      source: "WEBSITE",
      status: "PROPOSAL_SENT",
      expectedDealValue: 650000.0,
      notes: "Requested quote for 500 Sandefjord T-Shirts & Tønsberg Polos.",
      createdById: adminUser.id,
      assignedToId: adminUser.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      fullName: "Freja Lindqvist",
      companyName: "Stockholm Culinary Academy",
      designation: "Head Chef Instructor",
      email: "freja.test@stockholmculinary.se",
      phoneNumber: `+46 81 23 ${Math.floor(1000 + Math.random() * 9000)}`,
      city: "Stockholm",
      source: "REFERRAL",
      status: "QUALIFIED",
      expectedDealValue: 320000.0,
      notes: "Interested in Odense Men's Chef Trousers & København Aprons.",
      createdById: adminUser.id,
      assignedToId: adminUser.id,
    },
  });

  console.log("✅ Leads created:", lead1.fullName, lead2.fullName);

  // 4. Create Tasks
  const dueDate1 = new Date();
  dueDate1.setDate(dueDate1.getDate() + 2);

  const dueDate2 = new Date();
  dueDate2.setDate(dueDate2.getDate() + 5);

  const task1 = await prisma.task.create({
    data: {
      title: "Follow up on Scandi Workwear Proposal",
      description: "Call Alexander regarding the 500 T-Shirt quotation & sample dispatch.",
      priority: "URGENT",
      status: "PENDING",
      dueDate: dueDate1,
      leadId: lead1.id,
      createdById: adminUser.id,
      assignedUserId: adminUser.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Dispatch Chef Apron Samples to Nordic Hotels",
      description: "Send sample swatches of Light Grey & Black København Aprons.",
      priority: "HIGH",
      status: "PENDING",
      dueDate: dueDate2,
      customerId: customer2.id,
      createdById: adminUser.id,
      assignedUserId: adminUser.id,
    },
  });

  console.log("✅ Tasks created:", task1.title, task2.title);

  // 5. Create Email Reminders for Tasks
  const remDate = new Date();
  const scheduledTime = new Date();

  const reminder1 = await prisma.reminder.create({
    data: {
      taskId: task1.id,
      createdById: adminUser.id,
      reminderDate: remDate,
      reminderTime: "10:00 AM",
      scheduledFor: scheduledTime,
      channel: "EMAIL",
      recipientType: "ASSIGNED_USER",
      recipientEmail: TEST_EMAIL,
      recipientPhone: "+923001234567",
      note: "Urgent: Proposal follow-up call with Alexander Rybak",
      deliveryStatus: "PENDING",
    },
  });

  const reminder2 = await prisma.reminder.create({
    data: {
      taskId: task2.id,
      createdById: adminUser.id,
      reminderDate: remDate,
      reminderTime: "02:30 PM",
      scheduledFor: new Date(),
      channel: "EMAIL",
      recipientType: "CUSTOMER",
      recipientEmail: TEST_EMAIL,
      note: "Sample Tracking Dispatch Notification sent to Lars Olsen",
      deliveryStatus: "PENDING",
    },
  });

  console.log("✅ Reminders created (Target Email:", TEST_EMAIL, "):", reminder1.id, reminder2.id);

  // 6. Create Email Conversations & Thread Messages
  const conversation = await prisma.emailConversation.create({
    data: {
      subject: "Bulk Order Inquiry: Lillehammer Scrubs NS3361",
      threadKey: `THREAD-${Date.now()}`,
      customerId: customer2.id,
      createdById: adminUser.id,
      messages: {
        create: [
          {
            fromEmail: TEST_EMAIL,
            toEmail: "support@nordicprowear.com",
            subject: "Bulk Order Inquiry: Lillehammer Scrubs NS3361",
            bodyText: "Hi Team, We require 200 sets of Lillehammer Navy Scrubs for our new wing. Please provide delivery timeline.",
            direction: "INBOUND",
            status: "RECEIVED",
            createdById: adminUser.id,
          },
          {
            fromEmail: "support@nordicprowear.com",
            toEmail: TEST_EMAIL,
            subject: "Re: Bulk Order Inquiry: Lillehammer Scrubs NS3361",
            bodyText: "Hello Lars, Thank you for your email. We have 200 units in stock and can dispatch within 24 hours.",
            direction: "OUTBOUND",
            status: "SENT",
            createdById: adminUser.id,
          },
        ],
      },
    },
  });

  console.log("✅ Email Thread created for:", TEST_EMAIL, "Subject:", conversation.subject);

  // 7. Create Support Tickets
  const ticket1 = await prisma.supportTicket.create({
    data: {
      ticketNumber: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: "Custom Embroidery Request for Chef Jackets",
      description: "Customer wants logo embroidered on left chest for Stockholm Chef Jackets.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Customization",
      customerId: customer2.id,
      createdById: adminUser.id,
      assignedToId: adminUser.id,
    },
  });

  console.log("✅ Support Ticket created:", ticket1.ticketNumber);

  // 8. Create Customer Interactions & Activities
  await prisma.customerInteraction.create({
    data: {
      customerId: customer2.id,
      type: "CALL",
      subject: "Annual Contract Discussion",
      description: "Discussed quarterly scrub deliveries for 2026.",
    },
  });

  await prisma.activity.create({
    data: {
      type: "CALL",
      subject: "Phone Call with Lars Olsen",
      description: "Discussed wholesale chef apparel pricing and delivery schedule.",
      customerId: customer2.id,
      taskId: task1.id,
      createdById: adminUser.id,
    },
  });

  console.log("🎉 SUCCESS: CRM Data successfully seeded for:", TEST_EMAIL);
}

seedCRM()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
