import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

interface UserJwt {
  id: number;
}

function decodeToken(authHeader: string): Promise<UserJwt> {
  const secret = process.env.JWT_SECRET;

  if (!authHeader) throw new AuthenticationError('No token provided');

  const parts = authHeader.split(' ');
  if (parts.length !== 2) throw new AuthenticationError('Token error');

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) throw new AuthenticationError('Token malformatted');

  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      async (error, decoded: UserJwt) => {
        if (error) return reject(new AuthenticationError('Token invalid'));

        return resolve(decoded);
      },
    );
  });
}

export default decodeToken;
