// One-off cleanup: removes an email that was written into the DB by the old seedCRMTestCases.js.
//
//   node prisma/cleanupPersonalEmail.js <email>                      -> dry run (only reports)
//   node prisma/cleanupPersonalEmail.js <email> --apply              -> customers: email cleared
//   node prisma/cleanupPersonalEmail.js <email> --apply --user-email=<new>  -> users: email replaced
const prisma = require("../src/config/db");

const target = (process.argv[2] || "").trim().toLowerCase();
const apply = process.argv.includes("--apply");
const userEmailArg = process.argv.find((a) => a.startsWith("--user-email="));
const newUserEmail = userEmailArg ? userEmailArg.split("=")[1].trim().toLowerCase() : null;

async function main() {
  if (!target || target.startsWith("--")) {
    console.error("Usage: node prisma/cleanupPersonalEmail.js <email> [--apply] [--user-email=<new>]");
    return;
  }

  const insensitive = { equals: target, mode: "insensitive" };
  const customers = await prisma.customer.findMany({
    where: { email: insensitive },
    select: { id: true, fullName: true, companyName: true, customerCode: true },
  });
  const users = await prisma.user.findMany({
    where: { email: insensitive },
    select: { id: true, name: true, role: true },
  });
  const reminders = await prisma.reminder.count({ where: { recipientEmail: insensitive } });

  console.log(`Customers with this email: ${customers.length}`);
  customers.forEach((c) => console.log(`  - ${c.customerCode || c.id}  ${c.companyName || ""} (${c.fullName})`));
  console.log(`Users with this email: ${users.length}`);
  users.forEach((u) => console.log(`  - ${u.id}  ${u.name} [${u.role}]`));
  console.log(`Reminders addressed to it: ${reminders}`);

  if (!apply) {
    console.log("\nDry run only. Re-run with --apply to change the data.");
    return;
  }

  if (customers.length) {
    await prisma.customer.updateMany({ where: { email: insensitive }, data: { email: null } });
    console.log(`Cleared email on ${customers.length} customer(s).`);
  }

  if (users.length) {
    if (!newUserEmail) {
      console.log("Users NOT changed: pass --user-email=<new email> to replace their login email.");
    } else {
      await prisma.user.updateMany({ where: { email: insensitive }, data: { email: newUserEmail } });
      console.log(`Replaced email on ${users.length} user(s) with ${newUserEmail}.`);
    }
  }

  if (reminders) {
    await prisma.reminder.updateMany({ where: { recipientEmail: insensitive }, data: { recipientEmail: null } });
    console.log(`Cleared recipientEmail on ${reminders} reminder(s).`);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
