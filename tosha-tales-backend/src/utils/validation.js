import Joi from 'joi';

// Auth validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// Story validation schemas
export const createStorySchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Title must be at least 3 characters long',
    'string.max': 'Title cannot exceed 200 characters',
    'any.required': 'Title is required',
  }),
  description: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 500 characters',
    'any.required': 'Description is required',
  }),
  content: Joi.string().min(50).required().messages({
    'string.min': 'Content must be at least 50 characters long',
    'any.required': 'Content is required',
  }),
  readTime: Joi.string().required().messages({
    'any.required': 'Read time is required',
  }),
  ageGroup: Joi.string().required().messages({
    'any.required': 'Age group is required',
  }),
  categoryId: Joi.string().required().messages({
    'any.required': 'Category is required',
  }),
  characterIds: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').default('DRAFT'),
  is_new: Joi.boolean().default(false),
  image: Joi.string().optional(),
});

export const updateStorySchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().min(10).max(500).optional(),
  content: Joi.string().min(50).optional(),
  readTime: Joi.string().optional(),
  ageGroup: Joi.string().optional(),
  categoryId: Joi.string().optional(),
  characterIds: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
  is_new: Joi.boolean().optional(),
  image: Joi.string().optional(),
});

// Character validation schemas
export const createCharacterSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),
  description: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'Description must be at least 10 characters long',
    'string.max': 'Description cannot exceed 1000 characters',
    'any.required': 'Description is required',
  }),
  roleId: Joi.string().required().messages({
    'any.required': 'Role is required',
  }),
  image: Joi.string().optional(),
});

export const updateCharacterSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  description: Joi.string().min(10).max(1000).optional(),
  roleId: Joi.string().optional(),
  image: Joi.string().optional(),
});

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  description: Joi.string().max(200).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #FF0000)',
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #FF0000)',
  }),
});

// Role validation schemas
export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required',
  }),
  description: Joi.string().max(200).optional(),
  type: Joi.string().valid('protagonist', 'antagonist', 'supporting', 'mentor', 'helper').default('protagonist').messages({
    'string.valid': 'Type must be one of: protagonist, antagonist, supporting, mentor, helper',
  }),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(200).optional(),
  type: Joi.string().valid('protagonist', 'antagonist', 'supporting', 'mentor', 'helper').optional().messages({
    'string.valid': 'Type must be one of: protagonist, antagonist, supporting, mentor, helper',
  }),
});

// Rating validation schema
export const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.integer': 'Rating must be an integer',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating cannot exceed 5',
    'any.required': 'Rating is required',
  }),
});

// Search validation schema
export const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required().messages({
    'string.min': 'Search query must be at least 1 character long',
    'string.max': 'Search query cannot exceed 100 characters',
    'any.required': 'Search query is required',
  }),
  type: Joi.string().valid('stories', 'characters', 'all').default('all'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
});

// Pagination validation schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sortBy: Joi.string().valid('createdAt', 'title', 'name', 'rating', 'likes').default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
});

// Filter validation schema
export const filterSchema = Joi.object({
  category: Joi.string().optional(),
  ageGroup: Joi.string().optional(),
  status: Joi.string().valid('DRAFT', 'PUBLISHED', 'ARCHIVED').optional(),
  role: Joi.string().optional(),
});

// Illustration validation schemas
export const createIllustrationSchema = Joi.object({
  imageUrl: Joi.string().uri().required().messages({
    'string.uri': 'Image URL must be a valid URL',
    'any.required': 'Image URL is required',
  }),
  position_vertical: Joi.string().valid('top', 'bottom').default('top').messages({
    'string.valid': 'Vertical position must be top or bottom',
  }),
  position_horizontal: Joi.string().valid('left', 'right').default('left').messages({
    'string.valid': 'Horizontal position must be left or right',
  }),
  caption: Joi.string().max(200).optional().allow('', null).messages({
    'string.max': 'Caption cannot exceed 200 characters',
  }),
  order: Joi.number().integer().min(1).optional().default(1),
});

export const updateIllustrationSchema = Joi.object({
  imageUrl: Joi.string().uri().optional().messages({
    'string.uri': 'Image URL must be a valid URL',
  }),
  position_vertical: Joi.string().valid('top', 'bottom').optional().messages({
    'string.valid': 'Vertical position must be top or bottom',
  }),
  position_horizontal: Joi.string().valid('left', 'right').optional().messages({
    'string.valid': 'Horizontal position must be left or right',
  }),
  caption: Joi.string().max(200).optional().messages({
    'string.max': 'Caption cannot exceed 200 characters',
  }),
  order: Joi.number().integer().min(1).optional(),
});

export const reorderIllustrationsSchema = Joi.object({
  illustrationIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one illustration ID is required',
    'any.required': 'Illustration IDs are required',
  }),
}); 