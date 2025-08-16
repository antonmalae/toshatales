import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Search stories and characters
// @route   GET /api/search
// @access  Public
export const search = async (req, res, next) => {
  try {
    const { q: query, type = 'all', page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
      });
    }

    const searchQuery = query.trim();
    const results = {};

    // Search stories
    if (type === 'all' || type === 'stories') {
      const stories = await prisma.story.findMany({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
          status: 'PUBLISHED',
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
          _count: {
            select: {
              likes: true,
              ratings: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      });

      // Calculate average ratings for stories
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

      results.stories = storiesWithRatings;
    }

    // Search characters
    if (type === 'all' || type === 'characters') {
      const characters = await prisma.character.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
        },
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
      });

      results.characters = characters;
    }

    // Get total counts for pagination
    const totalCounts = {};
    
    if (type === 'all' || type === 'stories') {
      totalCounts.stories = await prisma.story.count({
        where: {
          OR: [
            {
              title: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
          status: 'PUBLISHED',
        },
      });
    }

    if (type === 'all' || type === 'characters') {
      totalCounts.characters = await prisma.character.count({
        where: {
          OR: [
            {
              name: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          ],
        },
      });
    }

    const totalPages = Math.ceil(Math.max(...Object.values(totalCounts)) / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        query: searchQuery,
        type,
        results,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalCounts,
          totalPages,
        },
      },
    });
  } catch (error) {
    logger.error('Search error:', error);
    next(error);
  }
}; 