const prisma = require("../../client.js");
const { calculateSpamLikelihood } = require("../../utils/utils.js");

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

    // Add a new spam report record to the database, storing the phone and who reported it :
    try {
      await prisma.spamReport.create({
        data: {
          phone,
          reportedBy: userId,
        },
      });
    } catch (err) {
      // Prisma unique constraint violation
      if (err.code === "P2002") {
        return res.status(400).json({
          message: "You have already marked this number as spam!",
        });
      }
      return res.json(err.message);
    }

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

    if (!phone) {
      return res.status(400).json({ message: "Phone number is required!" });
    }

    const result = await prisma.spamReport.deleteMany({
      where: {
        phone,
        reportedBy: userId,
      },
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ message: "You haven't marked this number as spam!" });
    }

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

exports.findSpamLikelihood = async (req, res) => {
  try {
    const phone = req.params.phone;

    // Counts number of times this phone number has been reported in total:
    const reportCount = await prisma.spamReport.count({
      where: { phone },
    });

    // Calls the helper function calculateSpamLikelihood to get the spam likelihood details :
    const spamLikelihood = calculateSpamLikelihood(reportCount);

    return res.status(200).json({
      success: true,
      phone: phone,
      reportCount: reportCount,
      spamLikelihood: spamLikelihood,
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while fetching spam information",
    });
  }
};
