const prisma = require("../../client.js");
const { calculateSpamLikelihood } = require("../../utils/utils.js");

exports.searchByName = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    if (query.length < 2) {
      return res
        .status(400)
        .json({ message: "Search query must be at least 2 characters" });
    }

    // Searching contacts by name :
    const contacts = await prisma.contact.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        phone: true,
      },
    });

    // Searching users by name :
    const users = await prisma.user.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    // Combine phone lists from users and contacts :
    const allPhones = [
      ...users.map((u) => u.phone),
      ...contacts.map((c) => c.phone),
    ];

    const uniquePhones = [...new Set(allPhones)];

    const spamCounts = await prisma.spamReport.groupBy({
      by: ["phone"],
      where: {
        phone: {
          in: uniquePhones,
        },
      },
      _count: {
        phone: true,
      },
    });

    const spamCountMap = {};
    spamCounts.forEach((item) => {
      spamCountMap[item.phone] = item._count.phone;
    });

    let results = [];

    users.forEach((user) => {
      results.push({
        name: user.name,
        phone: user.phone,
        email: user.email,
        type: "user",
        userId: user.id,
        spamLikelihood: calculateSpamLikelihood(spamCountMap[user.phone] || 0),
      });
    });

    contacts.forEach((contact) => {
      results.push({
        name: contact.name,
        phone: contact.phone,
        type: "contact",
        spamLikelihood: calculateSpamLikelihood(
          spamCountMap[contact.phone] || 0,
        ),
      });
    });

    const startsWith = [];
    const contains = [];

    results.forEach((result) => {
      if (result.name.toLowerCase().startsWith(query.toLowerCase())) {
        startsWith.push(result);
      } else {
        contains.push(result);
      }
    });

    const sortedResults = [...startsWith, ...contains];

    return res.json({
      success: true,
      query: query,
      count: sortedResults.length,
      results: sortedResults,
    });
  } catch (err) {
    return res.status(500).json({ message: "An error occurred during search" });
  }
};

exports.searchByPhone = async (req, res) => {
  try {
    const phone = req.query.q;
    const currentUserId = req.user.userId;

    if (!phone || phone.trim().length === 0) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Find if the phone belongs to a registered User :
    const user = await prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
      },
    });

    // Count spam reports for this phone :
    const spamCount = await prisma.spamReport.count({
      where: { phone },
    });

    // Find spamLikelihood :
    const spamLikelihood = calculateSpamLikelihood(spamCount);

    // If phone belongs to a registered User :
    if (user) {
      // Check if the current user has this number in it's contacts :
      const contact = await prisma.contact.findFirst({
        where: {
          ownerId: currentUserId,
          phone: phone,
        },
      });

      return res.json({
        success: true,
        results: [
          {
            name: user.name,
            phone: user.phone,
            email: contact ? user.email : null, // privacy rule
            type: "user",
            spamLikelihood: spamLikelihood,
          },
        ],
      });
    }
    // If phone does not belong to registered User :
    const contacts = await prisma.contact.findMany({
      where: { phone },
      select: {
        name: true,
        phone: true,
      },
    });

    // If found in contacts :
    if (contacts.length > 0) {
      const results = contacts.map((contact) => ({
        name: contact.name,
        phone: contact.phone,
        type: "contact",
        spamLikelihood: spamLikelihood,
      }));

      return res.json({
        success: true,
        results,
      });
    }

    // Phone not found anywhere :
    return res.json({
      success: true,
      results: [
        {
          name: null,
          phone,
          type: "unknown",
          spamLikelihood: spamLikelihood,
        },
      ],
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred during phone search",
    });
  }
};
