import jwt, {
  JwtPayload,
  VerifyErrors,
  SignOptions,
  Secret,
} from "jsonwebtoken";
import config from "../config/config";

export interface TokenPayload extends JwtPayload {
  sub: string;
  email?: string;
  tokenVersion?: number;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtAccessExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwtAccessSecret as Secret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.jwtRefreshSecret as Secret, options);
}

export function verifyAccessToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.jwtAccessSecret as Secret,
      (err: VerifyErrors | null, decoded) => {
        if (err || !decoded) {
          return reject(err);
        }
        resolve(decoded as TokenPayload);
      }
    );
  });
}

export function verifyRefreshToken(token: string): Promise<TokenPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.jwtRefreshSecret as Secret,
      (err: VerifyErrors | null, decoded) => {
        if (err || !decoded) {
          return reject(err);
        }
        resolve(decoded as TokenPayload);
      }
    );
  });
}
