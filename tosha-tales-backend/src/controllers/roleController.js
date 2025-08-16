import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get all roles
// @route   GET /api/roles
// @access  Public
export const getRoles = async (req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            characters: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: roles,
    });
  } catch (error) {
    logger.error('Get roles error:', error);
    next(error);
  }
};

// @desc    Create new role
// @route   POST /api/roles
// @access  Private (Admin)
export const createRole = async (req, res, next) => {
  try {
    const { name, description, type } = req.body;

    const role = await prisma.role.create({
      data: {
        name,
        description,
        type: type || 'protagonist',
      },
    });

    logger.info(`Role created: ${name} (${type}) by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: role,
    });
  } catch (error) {
    logger.error('Create role error:', error);
    next(error);
  }
};

// @desc    Update role
// @route   PUT /api/roles/:id
// @access  Private (Admin)
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, type } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        error: 'Role not found',
      });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        type,
      },
    });

    logger.info(`Role updated: ${name} (${type}) by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedRole,
    });
  } catch (error) {
    logger.error('Update role error:', error);
    next(error);
  }
};

// @desc    Delete role
// @route   DELETE /api/roles/:id
// @access  Private (Admin)
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found',
      });
    }

    // Check if role is used by characters
    const charactersCount = await prisma.character.count({
      where: { roleId: id },
    });

    if (charactersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role that has associated characters',
      });
    }

    await prisma.role.delete({
      where: { id },
    });

    logger.info(`Role deleted: ${role.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    logger.error('Delete role error:', error);
    next(error);
  }
}; 