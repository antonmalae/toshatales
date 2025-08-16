import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get all characters
// @route   GET /api/characters
// @access  Public
export const getCharacters = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { roleId: role }),
    };

    const [characters, total] = await Promise.all([
      prisma.character.findMany({
        where,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              stories: true,
              likes: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.character.count({ where }),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: characters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get characters error:', error);
    next(error);
  }
};

// @desc    Get single character
// @route   GET /api/characters/:id
// @access  Public
export const getCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const character = await prisma.character.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        stories: {
          include: {
            story: {
              select: {
                id: true,
                title: true,
                description: true,
                readTime: true,
                ageGroup: true,
                status: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            stories: true,
            likes: true,
          },
        },
      },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Check if user liked the character
    let userLiked = false;
    if (req.user) {
      const like = await prisma.characterLike.findUnique({
        where: {
          characterId_userId: {
            characterId: id,
            userId: req.user.id,
          },
        },
      });
      userLiked = !!like;
    }

    const characterWithStats = {
      ...character,
      userLiked,
    };

    res.status(200).json({
      success: true,
      data: characterWithStats,
    });
  } catch (error) {
    logger.error('Get character error:', error);
    next(error);
  }
};

// @desc    Create new character
// @route   POST /api/characters
// @access  Private (Admin)
export const createCharacter = async (req, res, next) => {
  try {
    const { name, description, image, roleId } = req.body;

    const character = await prisma.character.create({
      data: {
        name,
        description,
        image,
        roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    logger.info(`Character created: ${name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: character,
    });
  } catch (error) {
    logger.error('Create character error:', error);
    next(error);
  }
};

// @desc    Update character
// @route   PUT /api/characters/:id
// @access  Private (Admin)
export const updateCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, roleId } = req.body;

    // Check if character exists
    const existingCharacter = await prisma.character.findUnique({
      where: { id },
    });

    if (!existingCharacter) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    const updatedCharacter = await prisma.character.update({
      where: { id },
      data: {
        name,
        description,
        image,
        roleId,
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    logger.info(`Character updated: ${name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedCharacter,
    });
  } catch (error) {
    logger.error('Update character error:', error);
    next(error);
  }
};

// @desc    Delete character
// @route   DELETE /api/characters/:id
// @access  Private (Admin)
export const deleteCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if character exists
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Check if character is used in stories
    const storiesCount = await prisma.storyCharacter.count({
      where: { characterId: id },
    });

    if (storiesCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete character that has associated stories',
      });
    }

    await prisma.character.delete({
      where: { id },
    });

    logger.info(`Character deleted: ${character.name} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Character deleted successfully',
    });
  } catch (error) {
    logger.error('Delete character error:', error);
    next(error);
  }
};

// @desc    Like/Unlike character
// @route   POST /api/characters/:id/like
// @access  Private
export const toggleCharacterLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if character exists
    const character = await prisma.character.findUnique({
      where: { id },
    });

    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      });
    }

    // Check if user already liked the character
    const existingLike = await prisma.characterLike.findUnique({
      where: {
        characterId_userId: {
          characterId: id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.characterLike.delete({
        where: {
          characterId_userId: {
            characterId: id,
            userId: req.user.id,
          },
        },
      });

      logger.info(`Character unliked: ${character.name} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Character unliked successfully',
        liked: false,
      });
    } else {
      // Like
      await prisma.characterLike.create({
        data: {
          characterId: id,
          userId: req.user.id,
        },
      });

      logger.info(`Character liked: ${character.name} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Character liked successfully',
        liked: true,
      });
    }
  } catch (error) {
    logger.error('Toggle character like error:', error);
    next(error);
  }
};

// @desc    Get all characters for admin (without pagination)
// @route   GET /api/characters/all
// @access  Private (Admin)
export const getAllCharacters = async (req, res, next) => {
  try {
    const characters = await prisma.character.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            stories: true,
            likes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: characters,
    });
  } catch (error) {
    logger.error('Get all characters error:', error);
    next(error);
  }
}; 