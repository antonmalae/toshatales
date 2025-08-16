import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Get illustrations for a story
// @route   GET /api/stories/:storyId/illustrations
// @access  Public
export const getStoryIllustrations = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    const illustrations = await prisma.storyIllustration.findMany({
      where: { storyId },
      orderBy: [
        { position_vertical: 'asc' },
        { position_horizontal: 'asc' },
        { order: 'asc' }
      ],
    });

    res.status(200).json({
      success: true,
      data: illustrations,
    });
  } catch (error) {
    logger.error('Get story illustrations error:', error);
    next(error);
  }
};

// @desc    Add illustration to story
// @route   POST /api/stories/:storyId/illustrations
// @access  Private (Admin)
export const addStoryIllustration = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { 
      imageUrl, 
      position_horizontal = 'left', 
      position_vertical = 'top', 
      caption, 
      order 
    } = req.body;

    // Валидация позиционирования
    if (!['left', 'right'].includes(position_horizontal)) {
      return res.status(400).json({
        success: false,
        error: 'position_horizontal must be either "left" or "right"',
      });
    }

    if (!['top', 'bottom'].includes(position_vertical)) {
      return res.status(400).json({
        success: false,
        error: 'position_vertical must be either "top" or "bottom"',
      });
    }

    // Логируем входящие данные для отладки
    logger.info(`Adding illustration to story ${storyId}:`, {
      imageUrl,
      position_horizontal,
      position_vertical,
      caption,
      order,
      userId: req.user.email
    });

    // Check if story exists
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    });

    if (!story) {
      return res.status(404).json({
        success: false,
        error: 'Story not found',
      });
    }

    // Проверяем лимит иллюстраций (максимум 5)
    const currentIllustrationsCount = await prisma.storyIllustration.count({
      where: { storyId },
    });

    if (currentIllustrationsCount >= 5) {
      return res.status(400).json({
        success: false,
        error: 'Можно добавить не более 5 иллюстраций к одной сказке',
      });
    }

    // Get current max order для конкретной зоны позиционирования
    const maxOrder = await prisma.storyIllustration.aggregate({
      where: { 
        storyId,
        position_vertical,
        position_horizontal
      },
      _max: { order: true },
    });

    const newOrder = order || (maxOrder._max.order || 0) + 1;

    // Подготавливаем данные, исключая undefined значения
    const illustrationData = {
      imageUrl,
      position_horizontal,
      position_vertical,
      order: newOrder,
      storyId,
    };
    
    // Добавляем caption только если он не undefined и не пустая строка
    if (caption !== undefined && caption !== null && caption.trim() !== '') {
      illustrationData.caption = caption.trim();
    }

    logger.info(`Creating illustration with data:`, illustrationData);

    const illustration = await prisma.storyIllustration.create({
      data: illustrationData,
    });

    logger.info(`Illustration added to story: ${storyId} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: illustration,
    });
  } catch (error) {
    logger.error('Add story illustration error:', error);
    
    // Возвращаем более подробную информацию об ошибке
    res.status(400).json({
      success: false,
      error: 'Failed to add illustration',
      details: error.message,
    });
  }
};

// @desc    Update illustration
// @route   PUT /api/stories/:storyId/illustrations/:id
// @access  Private (Admin)
export const updateStoryIllustration = async (req, res, next) => {
  try {
    const { storyId, id } = req.params;
    const { 
      imageUrl, 
      position_horizontal, 
      position_vertical, 
      caption, 
      order 
    } = req.body;

    // Валидация позиционирования
    if (position_horizontal && !['left', 'right'].includes(position_horizontal)) {
      return res.status(400).json({
        success: false,
        error: 'position_horizontal must be either "left" or "right"',
      });
    }

    if (position_vertical && !['top', 'bottom'].includes(position_vertical)) {
      return res.status(400).json({
        success: false,
        error: 'position_vertical must be either "top" or "bottom"',
      });
    }

    // Check if illustration exists
    const existingIllustration = await prisma.storyIllustration.findFirst({
      where: { id, storyId },
    });

    if (!existingIllustration) {
      return res.status(404).json({
        success: false,
        error: 'Illustration not found',
      });
    }

    // Подготавливаем данные для обновления, исключая undefined значения
    const updateData = {};
    
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (position_horizontal !== undefined) updateData.position_horizontal = position_horizontal;
    if (position_vertical !== undefined) updateData.position_vertical = position_vertical;
    if (order !== undefined) updateData.order = order;
    
    // Обрабатываем caption отдельно, так как он может быть null
    if (caption !== undefined && caption !== null && caption.trim() !== '') {
      updateData.caption = caption.trim();
    } else if (caption !== undefined) {
      // Если caption передан как undefined или пустая строка, устанавливаем null
      updateData.caption = null;
    }

    const updatedIllustration = await prisma.storyIllustration.update({
      where: { id },
      data: updateData,
    });

    logger.info(`Illustration updated: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      data: updatedIllustration,
    });
  } catch (error) {
    logger.error('Update story illustration error:', error);
    next(error);
  }
};

// @desc    Delete illustration
// @route   DELETE /api/stories/:storyId/illustrations/:id
// @access  Private (Admin)
export const deleteStoryIllustration = async (req, res, next) => {
  try {
    const { storyId, id } = req.params;

    // Check if illustration exists
    const illustration = await prisma.storyIllustration.findFirst({
      where: { id, storyId },
    });

    if (!illustration) {
      return res.status(404).json({
        success: false,
        error: 'Illustration not found',
      });
    }

    await prisma.storyIllustration.delete({
      where: { id },
    });

    logger.info(`Illustration deleted: ${id} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Illustration deleted successfully',
    });
  } catch (error) {
    logger.error('Delete story illustration error:', error);
    next(error);
  }
};

// @desc    Reorder illustrations
// @route   PUT /api/stories/:storyId/illustrations/reorder
// @access  Private (Admin)
export const reorderStoryIllustrations = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const { illustrationIds } = req.body; // Array of IDs in new order

    // Update order for each illustration
    const updatePromises = illustrationIds.map((id, index) =>
      prisma.storyIllustration.update({
        where: { id },
        data: { order: index + 1 },
      })
    );

    await Promise.all(updatePromises);

    logger.info(`Illustrations reordered for story: ${storyId} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Illustrations reordered successfully',
    });
  } catch (error) {
    logger.error('Reorder story illustrations error:', error);
    next(error);
  }
}; 