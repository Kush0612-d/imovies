import jwt from 'jsonwebtoken';

export const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'imovies_super_secure_jwt_secret_key_2026_academic_project',
    { expiresIn: '30d' }
  );
};

