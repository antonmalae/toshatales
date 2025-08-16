import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get all stories
// @route   GET /api/stories
// @access  Public
export const getStories = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      ageGroup,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      ...(status && status !== 'ALL' && { status }),
      ...(category && { categoryId: category }),
      ...(ageGroup && { ageGroup }),
    };

    // Get total count for pagination
    const total = await prisma.story.count({ where });

    // Get stories with pagination and proper sorting for novelties
    const stories = await prisma.story.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        characters: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        illustrations: {
          orderBy: { order: 'asc' },
        },
        audio: true,
        _count: {
          select: {
            likes: true,
            ratings: true,
          },
        },
      },
      orderBy: [
        { is_new: 'desc' }, // Новинки сначала
        { [sortBy]: sortOrder }, // Затем по указанному полю
      ],
      skip,
      take: parseInt(limit),
    });

    // Calculate average ratings
    const storiesWithRatings = await Promise.all(
      stories.map(async (story) => {
        const avgRating = await prisma.storyRating.aggregate({
          where: { storyId: story.id },
          _avg: { rating: true },
        });

        return {
          ...story,
          averageRating: avgRating._avg.rating || 0,
          totalRatings: story._count.ratings,
          totalLikes: story._count.likes,
        };
      })
    );

    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      success: true,
      data: storiesWithRatings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get stories error:', error);
    next(error);
  }
};

// @desc    Get single story
// @route   GET /api/stories/:id
// @access  Public
export const getStory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const story = await prisma.story.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        characters: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
                description: true,
                image: true,
                role: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        illustrations: {
          orderBy: { order: 'asc' },
        },
        audio: true,
        _count: {
          select: {
            likes: true,
            ratings: true,
          },
        },
      },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Get average rating
    const avgRating = await prisma.storyRating.aggregate({
      where: { storyId: id },
      _avg: { rating: true },
    });

    // Check if user liked the story
    let userLiked = false;
    let userRating = null;

    if (req.user) {
      const [like, rating] = await Promise.all([
        prisma.storyLike.findUnique({
          where: {
            storyId_userId: {
              storyId: id,
              userId: req.user.id,
            },
          },
        }),
        prisma.storyRating.findUnique({
          where: {
            storyId_userId: {
              storyId: id,
              userId: req.user.id,
            },
          },
        }),
      ]);

      userLiked = !!like;
      userRating = rating?.rating || null;
    }

    const storyWithStats = {
      ...story,
      averageRating: avgRating._avg.rating || 0,
      totalRatings: story._count.ratings,
      totalLikes: story._count.likes,
      userLiked,
      userRating,
    };

    res.status(200).json({
      success: true,
      data: storyWithStats,
    });
  } catch (error) {
    logger.error('Get story error:', error);
    next(error);
  }
};

// @desc    Create new story
// @route   POST /api/stories
// @access  Private (Admin)
export const createStory = async (req, res, next) => {
  try {
    const {
      title,
      description,
      content,
      readTime,
      ageGroup,
      categoryId,
      characterIds = [],
      status = 'DRAFT',
      is_new = false,
      image,
    } = req.body;

    const story = await prisma.story.create({
      data: {
        title,
        description,
        content,
        readTime,
        ageGroup,
        categoryId,
        authorId: req.user.id,
        status,
        is_new,
        image,
        characters: {
          create: characterIds.map((characterId) => ({
            characterId,
          })),
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        characters: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Story created: ${title} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: story,
    });
  } catch (error) {
    logger.error('Create story error:', error);
    next(error);
  }
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private (Admin)
export const updateStory = async (req, res, next) => {
  try {
    console.log('updateStory: Запрос получен');
    console.log('updateStory: ID:', req.params.id);
    console.log('updateStory: Body:', req.body);
    
    const { id } = req.params;
    const {
      title,
      description,
      content,
      readTime,
      ageGroup,
      categoryId,
      characterIds,
      status,
      is_new,
      image, // Добавляем поле image
    } = req.body;

    // Check if story exists
    const existingStory = await prisma.story.findUnique({
      where: { id },
    });

    if (!existingStory) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Update story
    const updatedStory = await prisma.story.update({
      where: { id },
      data: {
        title,
        description,
        content,
        readTime,
        ageGroup,
        categoryId,
        status,
        is_new,
        image,
        ...(characterIds && {
          characters: {
            deleteMany: {},
            create: characterIds.map((characterId) => ({
              characterId,
            })),
          },
        }),
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        characters: {
          include: {
            character: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    logger.info(`Story updated: ${title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedStory,
    });
  } catch (error) {
    logger.error('Update story error:', error);
    next(error);
  }
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private (Admin)
export const deleteStory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Delete story (cascade will handle related records)
    await prisma.story.delete({
      where: { id },
    });

    logger.info(`Story deleted: ${story.title} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Story deleted successfully',
    });
  } catch (error) {
    logger.error('Delete story error:', error);
    next(error);
  }
};

// @desc    Rate story
// @route   POST /api/stories/:id/rate
// @access  Private
export const rateStory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Upsert rating
    const storyRating = await prisma.storyRating.upsert({
      where: {
        storyId_userId: {
          storyId: id,
          userId: req.user.id,
        },
      },
      update: {
        rating,
      },
      create: {
        storyId: id,
        userId: req.user.id,
        rating,
      },
    });

    logger.info(`Story rated: ${story.title} by ${req.user.email} with rating ${rating}`);

    res.status(200).json({
      success: true,
      data: storyRating,
    });
  } catch (error) {
    logger.error('Rate story error:', error);
    next(error);
  }
};

// @desc    Like/Unlike story
// @route   POST /api/stories/:id/like
// @access  Private
export const toggleStoryLike = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Check if user already liked the story
    const existingLike = await prisma.storyLike.findUnique({
      where: {
        storyId_userId: {
          storyId: id,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.storyLike.delete({
        where: {
          storyId_userId: {
            storyId: id,
            userId: req.user.id,
          },
        },
      });

      logger.info(`Story unliked: ${story.title} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Story unliked successfully',
        liked: false,
      });
    } else {
      // Like
      await prisma.storyLike.create({
        data: {
          storyId: id,
          userId: req.user.id,
        },
      });

      logger.info(`Story liked: ${story.title} by ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Story liked successfully',
        liked: true,
      });
    }
  } catch (error) {
    logger.error('Toggle story like error:', error);
    next(error);
  }
}; 