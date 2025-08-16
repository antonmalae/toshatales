import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Hash password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Compare password
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Send token response
export const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user.id);

  // Устанавливаем токен в cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
    ),
    httpOnly: false, // Изменяем на false, чтобы фронтенд мог читать токен
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // Устанавливаем cookie
  res.cookie('authToken', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token, // Оставляем токен в JSON для совместимости
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    },
  });
}; 