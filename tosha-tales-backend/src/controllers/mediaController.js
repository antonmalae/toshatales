import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

// @desc    Upload file
// @route   POST /api/media/upload
// @access  Private (Admin)
export const uploadFile = async (req, res, next) => {
  try {
    console.log('uploadFile: Запрос получен');
    console.log('uploadFile: req.file:', req.file);
    console.log('uploadFile: req.user:', req.user);
    
    if (!req.file) {
      console.log('uploadFile: Файл не найден в запросе');
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    console.log('uploadFile: Создаем запись в БД');
    // Create media record in database
    const media = await prisma.mediaFile.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        url: `http://localhost:3001/images/${req.file.filename}`,
        uploadedById: req.user.id,
      },
    });

    console.log('uploadFile: Запись создана:', media);
    logger.info(`File uploaded: ${req.file.originalname} by ${req.user.email}`);

    const response = {
      success: true,
      data: {
        id: media.id,
        filename: media.filename,
        originalName: media.originalName,
        url: `http://localhost:3001/images/${media.filename}`,
        size: media.size,
        mimeType: media.mimeType,
      },
    };
    
    console.log('uploadFile: Отправляем ответ:', response);
    res.status(200).json(response);
  } catch (error) {
    console.error('uploadFile: Ошибка:', error);
    logger.error('Upload file error:', error);
    next(error);
  }
};

// @desc    Get all media files
// @route   GET /api/media
// @access  Private (Admin)
export const getMediaFiles = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [files, total] = await Promise.all([
      prisma.mediaFile.findMany({
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.mediaFile.count(),
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    // Add URL to each file
    const filesWithUrls = files.map(file => ({
      ...file,
      url: `http://localhost:3001/images/${file.filename}`,
    }));

    res.status(200).json({
      success: true,
      data: filesWithUrls,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Get media files error:', error);
    next(error);
  }
};

// @desc    Delete media file
// @route   DELETE /api/media/:id
// @access  Private (Admin)
export const deleteMediaFile = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if file exists
    const file = await prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    // Check if file is used in stories or characters
    const [storiesCount, charactersCount] = await Promise.all([
      prisma.storyIllustration.count({
        where: { imageUrl: { contains: file.filename } },
      }),
      prisma.character.count({
        where: { image: { contains: file.filename } },
      }),
    ]);

    if (storiesCount > 0 || charactersCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete file that is being used by stories or characters',
      });
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id },
    });

    // Note: In a real application, you would also delete the physical file
    // This would require file system operations

    logger.info(`Media file deleted: ${file.originalName} by ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    logger.error('Delete media file error:', error);
    next(error);
  }
}; 