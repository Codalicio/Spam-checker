const prisma = require("../../client.js");

exports.createContact = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const userId = req.user.userId;

    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required!" });
    }

    // To prevent duplicate contacts with the same phone number for the same user
    const existingContact = await prisma.contact.findFirst({
      where: {
        ownerId: userId,
        phone: phone,
      },
    });

    if (existingContact) {
      return res.status(400).json({
        message: "You already have this number in your contacts",
      });
    }

    const contact = await prisma.contact.create({
      data: { name, phone, ownerId: userId },
    });
    return res.status(201).json({
      success: true,
      message: "Contact added successfully",
      contact: {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        ownerId: req.user.userId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      success: true,
      count: contacts.length,
      contacts: contacts,
    });
  } catch (err) {
    return res.json({ message: "An error occurred while fetching contacts" });
  }
};
