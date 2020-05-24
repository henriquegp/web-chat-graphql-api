import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createToken(id: any) {
  const expiresIn = '1h';
  const secret = process.env.JWT_SECRET;

  return jwt.sign({ id }, secret, { expiresIn });
}

export default createToken;
