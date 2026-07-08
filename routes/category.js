const express = require("express");
const router = express.Router();

const prisma = require("../helper/prisma");
const authProtect = require("../middleware/auth");
const adminProtect = require("../middleware/authAdmin");

router.post("/create", [authProtect, adminProtect], async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
      select: {
        name: true,
        id: true,
        description: true,
      },
    });
    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/update", [authProtect, adminProtect], async (req, res, next) => {
  try {
    const { sub } = req.body;
    const { name, description, categoryId } = req.body;
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    });
    if (existingCategory) {
      return res.status(404).json({ message: "Category already exists" });
    }
    const updatedCategory = await prisma.category.update({
      where: {
        id: Number(categoryId),
      },
      data: {
        name,
        description,
      },
      select: {
        name: true,
        id: true,
        description: true,
      },
    });
    return res.status(201).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/single/:id", authProtect, async (req, res, next) => {
  try {
    const { id: categoryId } = req.params;
    // const { sub } = req.user;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(categoryId),
      },
      select: {
        name: true,
        id: true,
        description: true,
      },
    });
    return res
      .status(200)
      .json({ message: "category fetched successfully", category: category });
  } catch (error) {
    next(error);
  }
});
router.delete(
  "/admin/delete/:id",
  [authProtect, adminProtect],
  async (req, res, next) => {
    try {
      const { id: categoryId } = req.params;

      const category = await prisma.category.findUnique({
        where: {
          id: Number(categoryId),
        },
        include: {
          books: true,
        },
      });
      if (category.books.length > 0) {
        return res.status(404).json({
          message: "cannot delete category because it contains books",
        });
      }

      const deletedCategory = await prisma.category.delete({
        where: {
          id: Number(categoryId),
        },
        select: {
          name: true,
          id: true,
          description: true,
        },
      });

      return res.status(201).json({
        message: "Category deleted successfully",
        category: deletedCategory,
      });
    } catch (error) {
      next(error);
    }
  },
);
router.get("/fetchAll", [authProtect, adminProtect], async (req, res, next) => {
  try {
    const category = await prisma.category.findMany({
      select: {
        name: true,
        id: true,
        description: true,
      },
    });

    return res.status(200).json({ category });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
