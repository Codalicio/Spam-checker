const prisma = require("../../client.js");

exports.markNumberAsSpam = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    // Check if the phone belongs to the current user(that is logged in) :
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true },
    });

    if (user && user.phone === phone) {
      return res
        .status(400)
        .json({ message: "You cannot mark your own number as spam!" });
    }

    const alreadyReported = await prisma.spamReport.findFirst({
      where: {
        phone,
        reportedBy: userId,
      },
    });

    if (alreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already marked this number as spam" });
    }

    // Add a new spam report record to the database, storing the phone and who reported it :
    await prisma.spamReport.create({
      data: {
        phone,
        reportedBy: userId,
      },
    });

    // Counts how many total spam reports exist for the phone number across all users :
    const totalReports = await prisma.spamReport.count({
      where: { phone },
    });

    res.status(201).json({
      success: true,
      message: "Number marked as spam",
      totalReports: totalReports,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "An error occurred while reporting spam" });
  }
};

exports.removeNumberAsSpam = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.user.userId;

    // Finds the spam report record for the given phone number and user :
    const spamReport = await prisma.spamReport.findFirst({
      where: {
        phone,
        reportedBy: userId,
      },
    });

    if (!spamReport) {
      return res
        .status(404)
        .json({ message: "You haven't marked this number as spam" });
    }

    // Delete a specific spam report by its id :
    await prisma.spamReport.delete({
      where: {
        id: spamReport.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Spam report removed",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while removing spam report",
    });
  }
};
