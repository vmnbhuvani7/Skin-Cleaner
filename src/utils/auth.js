import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'vmn_skin_care_secret_2026';

export const createToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
