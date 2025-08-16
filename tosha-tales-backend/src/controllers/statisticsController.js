import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get dashboard statistics
// @route   GET /api/admin/statistics
// @access  Private (Admin only)
export const getDashboardStats = async (req, res, next) => {
  try {
    // Получаем количество всех основных сущностей
    const [storiesCount, charactersCount, categoriesCount, rolesCount, mediaCount] = await Promise.all([
      prisma.story.count(),
      prisma.character.count(),
      prisma.category.count(),
      prisma.role.count(),
      prisma.mediaFile.count()
    ]);

    // Получаем дополнительную статистику
    const [publishedStories, totalLikes, totalRatings] = await Promise.all([
      prisma.story.count({ where: { status: 'PUBLISHED' } }),
      prisma.storyLike.count(),
      prisma.storyRating.count()
    ]);

    // Вычисляем средний рейтинг
    const avgRatingResult = await prisma.storyRating.aggregate({
      _avg: { rating: true }
    });

    const avgRating = avgRatingResult._avg.rating || 0;

    res.status(200).json({
      success: true,
      data: {
        stories: {
          total: storiesCount,
          published: publishedStories,
          draft: storiesCount - publishedStories
        },
        characters: {
          total: charactersCount
        },
        categories: {
          total: categoriesCount
        },
        roles: {
          total: rolesCount
        },
        media: {
          total: mediaCount
        },
        engagement: {
          totalLikes,
          totalRatings,
          averageRating: Math.round(avgRating * 10) / 10
        }
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    next(error);
  }
};

// @desc    Get stories count
// @route   GET /api/admin/statistics/stories
// @access  Private (Admin only)
export const getStoriesCount = async (req, res, next) => {
  try {
    const count = await prisma.story.count();
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get stories count error:', error);
    next(error);
  }
};

// @desc    Get characters count
// @route   GET /api/admin/statistics/characters
// @access  Private (Admin only)
export const getCharactersCount = async (req, res, next) => {
  try {
    const count = await prisma.character.count();
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get characters count error:', error);
    next(error);
  }
};

// @desc    Get categories count
// @route   GET /api/admin/statistics/categories
// @access  Private (Admin only)
export const getCategoriesCount = async (req, res, next) => {
  try {
    const count = await prisma.category.count();
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get categories count error:', error);
    next(error);
  }
};

// @desc    Get roles count
// @route   GET /api/admin/statistics/roles
// @access  Private (Admin only)
export const getRolesCount = async (req, res, next) => {
  try {
    const count = await prisma.role.count();
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get roles count error:', error);
    next(error);
  }
};

// @desc    Get media count
// @route   GET /api/admin/statistics/media
// @access  Private (Admin only)
export const getMediaCount = async (req, res, next) => {
  try {
    const count = await prisma.mediaFile.count();
    
    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    logger.error('Get media count error:', error);
    next(error);
  }
}; 