const prisma = require("../src/client.js");
const bcrypt = require("bcrypt");

async function main() {
  console.log("Seeding database...");

  // Clear existing data (important for re-runs)
  await prisma.spamReport.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // Create Users:
  const hashedPassword = await bcrypt.hash("password@123", 10);

  const users = await prisma.user.createMany({
    data: [
      {
        name: "Amit Raj",
        phone: "9990000001",
        email: "amit@example.com",
        password: hashedPassword,
      },
      {
        name: "Rahul Sharma",
        phone: "9990000002",
        email: "rahul@example.com",
        password: hashedPassword,
      },
      {
        name: "Neha Singh",
        phone: "9990000003",
        email: "neha@example.com",
        password: hashedPassword,
      },
      {
        name: "Priya Verma",
        phone: "9990000004",
        email: "priya@example.com",
        password: hashedPassword,
      },
    ],
  });

  // Fetch users back (createMany does not return records)
  const allUsers = await prisma.user.findMany();

  // Helper function to find user by phone
  const getUserByPhone = (phone) =>
    allUsers.find((user) => user.phone === phone);

  // Create contacts
  await prisma.contact.createMany({
    data: [
      {
        ownerId: getUserByPhone("9990000001").id,
        name: "Rahul Office",
        phone: "9990000002",
      },
      {
        ownerId: getUserByPhone("9990000001").id,
        name: "Spam Caller",
        phone: "8888888888",
      },
      {
        ownerId: getUserByPhone("9990000002").id,
        name: "Amit Personal",
        phone: "9990000001",
      },
      {
        ownerId: getUserByPhone("9990000003").id,
        name: "Unknown Sales",
        phone: "7777777777",
      },
    ],
  });

  // Create spam reports
  await prisma.spamReport.createMany({
    data: [
      {
        phone: "8888888888",
        reportedBy: getUserByPhone("9990000001").id,
      },
      {
        phone: "8888888888",
        reportedBy: getUserByPhone("9990000002").id,
      },
      {
        phone: "7777777777",
        reportedBy: getUserByPhone("9990000003").id,
      },
    ],
  });

  console.log("✅ Database seeded successfully");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
