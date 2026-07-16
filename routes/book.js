const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const authProtect = require("../middleware/auth");
const adminProtect = require("../middleware/authAdmin");
const allowedRole = require("../middleware/authAllowed");

router.post("/create", authProtect, async (req, res, next) => {
  try {
    const { title, description, price, author, categoryId } = req.body;
    const { sub } = req.user;

    const allowedStatus = await prisma.user.findUnique({
      where: { id: Number(sub) },

      select: {
        isAllowed: true,
      },
    });

    if (!allowedStatus.isAllowed) {
      return res.status(403).json({
        message: "You are not allowed to perform this action",
      });
    }

    const book = await prisma.book.create({
      data: {
        title,
        userId: Number(sub),
        description,
        price,
        author,
        categoryId: Number(categoryId),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Book created successfully", book: book });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/admin/create/:id",
  [authProtect, allowedRole, adminProtect],
  async (req, res, next) => {
    try {
      const { title, description, price, author, categoryId } = req.body;
      const { id } = req.params;
      const book = await prisma.book.create({
        data: {
          title,
          userId: Number(id),
          description,
          price,
          author,
          categoryId: Number(categoryId),
        },
        select: {
          title: true,
          id: true,
          description: true,
          price: true,
          author: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      return res
        .status(201)
        .json({ message: "Book created successfully", book: book });
    } catch (error) {
      next(error);
    }
  },
);

router.put("/update", authProtect, async (req, res, next) => {
  try {
    const { title, description, price, author, categoryId, bookId } = req.body;
    const { sub } = req.user;
    const book = await prisma.book.update({
      where: {
        id: Number(bookId),
        userId: Number(sub),
      },
      data: {
        title,
        description,
        price,
        author,
        categoryId: Number(categoryId),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Book updated successfully", book: book });
  } catch (error) {
    next(error);
  }
});

router.put(
  "/admin/update/:id",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      const { title, description, price, author, categoryId, bookId } =
        req.body;
      const { id } = req.params;

      const book = await prisma.book.update({
        where: {
          id: Number(bookId),
          userId: Number(id),
        },
        data: {
          title,
          description,
          price,
          author,
          categoryId: Number(categoryId),
        },
        select: {
          title: true,
          id: true,
          description: true,
          price: true,
          author: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      return res
        .status(201)
        .json({ message: "Book updated successfully", book: book });
    } catch (error) {
      next(error);
    }
  },
);
router.get("/single/:id", authProtect, async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const { sub } = req.user;

    const existingBook = await prisma.book.findUnique({
      where: {
        id: Number(bookId),
      },
    });
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const book = await prisma.book.findUnique({
      where: {
        id: Number(bookId),
        userId: Number(sub),
      },

      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(200)
      .json({ message: "Books fetched successfully", books: book });
  } catch (error) {
    next(error);
  }
});

router.delete("/delete/:id", authProtect, async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    const { sub } = req.user;

    const existingBook = await prisma.book.findUnique({
      where: {
        id: Number(bookId),
      },
    });
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    const deletedBook = await prisma.book.delete({
      where: {
        id: Number(bookId),
        userId: Number(sub),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Book deleted successfully", book: deletedBook });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/delete/:id", authProtect, async (req, res, next) => {
  try {
    const { id: bookId } = req.params;
    // const { sub } = req.user;

    const existingBook = await prisma.book.findUnique({
      where: {
        id: Number(bookId),
      },
    });
    if (!existingBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    const deletedBook = await prisma.book.delete({
      where: {
        id: Number(bookId),
        // userId: Number(sub),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "Book deleted successfully", book: deletedBook });
  } catch (error) {
    next(error);
  }
});
router.delete("/delete", authProtect, async (req, res, next) => {
  try {
    const { sub } = req.user;

    const deletedBook = await prisma.book.deleteMany({
      where: {
        userId: Number(sub),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return res
      .status(201)
      .json({ message: "All Books deleted successfully", book: deletedBook });
  } catch (error) {
    next(error);
  }
});

router.get("/fetchevery", authProtect, async (req, res, next) => {
  try {
    // const { sub } = req.user;
    const book = await prisma.book.findMany({
     
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res
      .status(200)
      .json({ message: "All existing books fetched successfully", books: book });
  } catch (error) {
    next(error);
  }
});
router.get("/fetchall", authProtect, async (req, res, next) => {
  try {
    const { sub } = req.user;
    const book = await prisma.book.findMany({
      where: {
        userId: Number(sub),
      },
      select: {
        title: true,
        id: true,
        description: true,
        price: true,
        author: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return res
      .status(200)
      .json({ message: "Books fetched successfully", books: book });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/fetchallAdmin",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      const book = await prisma.book.findMany({
        select: {
          title: true,
          id: true,
          description: true,
          price: true,
          author: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });
      return res
        .status(200)
        .json({ message: "Books fetched successfully", books: book });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
