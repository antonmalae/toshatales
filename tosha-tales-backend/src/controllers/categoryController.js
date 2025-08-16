import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
      },
    });

    logger.info(`Category created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    logger.error('Create category error:', error);
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        description,
        color,
      },
    });

    logger.info(`Category updated: ${name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedCategory,
    });
  } catch (error) {
    logger.error('Update category error:', error);
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found',
      });
    }

    // Check if category is used in stories
    const storiesCount = await prisma.story.count({
      where: { categoryId: id },
    });

    if (storiesCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category that has associated stories',
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    logger.info(`Category deleted: ${category.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    next(error);
  }
}; 