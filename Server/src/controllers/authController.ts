/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from "express";
import User, { UserDoc } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/authTokens";
import { comparePassword, hashPassword } from "../utils/password";
import { verifyGoogleIdToken } from "../utils/googleAuth";
import { TokenPayload } from "../utils/authTokens";
import { MatrixUserService } from "../services/matrix/MatrixUserService";
import crypto from "crypto";

const matrixUserService = new MatrixUserService();

const MAX_REFRESH_TOKENS = 5;

function sanitizeUser(user: UserDoc) {
  return {
    id: user._id.toString(),
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    providers: {
      email: Boolean(user.passwordHash),
      google: Boolean(user.googleId),
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    matrix: user.matrix ? {
      userId: user.matrix.userId,
      password: user.matrix.password, // In production, consider sending a short-lived token instead
      deviceId: user.matrix.deviceId,
      isSynced: user.matrix.isSynced,
    } : undefined,
  };
}

async function storeRefreshToken(
  user: UserDoc,
  newToken: string,
  previousToken?: string
): Promise<void> {
  let tokens = user.refreshTokens || [];

  if (previousToken) {
    tokens = tokens.filter((token) => token !== previousToken);
  }

  tokens.push(newToken);

  if (tokens.length > MAX_REFRESH_TOKENS) {
    tokens = tokens.slice(tokens.length - MAX_REFRESH_TOKENS);
  }

  user.refreshTokens = tokens;
  await user.save();
}

function buildTokenPayload(user: UserDoc): TokenPayload {
  return {
    sub: user._id.toString(),
    email: user.email,
  };
}

function issueTokens(user: UserDoc) {
  const payload = buildTokenPayload(user);
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return { accessToken, refreshToken };
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, displayName } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email is already registered",
      });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
    });

    // Create Matrix User
    try {
      // Generate a random password for the Matrix account
      const matrixPassword = crypto.randomBytes(16).toString("hex");
      // Sanitize username for Matrix (lowercase, alphanumeric only)
      const matrixUsername = ((user.email || "user").split("@")[0] || "user").replace(/[^a-z0-9]/g, "") + "_" + crypto.randomBytes(4).toString("hex");

      const matrixUserId = await matrixUserService.createMatrixUser(matrixUsername, matrixPassword);

      if (matrixUserId) {
        user.matrix = {
          userId: matrixUserId,
          password: matrixPassword,
          isSynced: true,
        };
        await user.save();
      }
    } catch (matrixError) {
      console.error("Failed to create Matrix user during registration:", matrixError);
      // We don't fail the whole registration, just log it. 
      // A background job should retry this later.
    }

    const tokens = issueTokens(user);
    await storeRefreshToken(user, tokens.refreshToken);

    return res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      tokens,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const tokens = issueTokens(user);
    await storeRefreshToken(user, tokens.refreshToken);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      tokens,
    });
  } catch (error) {
    return next(error);
  }
}

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleIdToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        error: "Google account does not provide email access",
      });
    }

    let user =
      (await User.findOne({ googleId })) ||
      (await User.findOne({ email: email.toLowerCase() }));

    if (!user) {
      user = await User.create({
        email: email.toLowerCase(),
        googleId,
        displayName: name,
        avatarUrl: picture,
      });

      // Create Matrix User for Google Login
      try {
        const matrixPassword = crypto.randomBytes(16).toString("hex");
        const matrixUsername = (email.split("@")[0] || "user").replace(/[^a-z0-9]/g, "") + "_" + crypto.randomBytes(4).toString("hex");

        const matrixUserId = await matrixUserService.createMatrixUser(matrixUsername, matrixPassword);

        if (matrixUserId) {
          user.matrix = {
            userId: matrixUserId,
            password: matrixPassword,
            isSynced: true,
          };
          await user.save();
        }
      } catch (matrixError) {
        console.error("Failed to create Matrix user during Google registration:", matrixError);
      }
    } else {
      user.googleId = googleId;
      if (!user.displayName && name) {
        user.displayName = name;
      }
      if (picture) {
        user.avatarUrl = picture;
      }
      await user.save();
    }

    const tokens = issueTokens(user);
    await storeRefreshToken(user, tokens.refreshToken);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      tokens,
    });
  } catch (error) {
    return next(error);
  }
}

export async function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { refreshToken } = req.body;

    const payload = await verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }

    if (!user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: "Refresh token has been revoked",
      });
    }

    const tokens = issueTokens(user);
    await storeRefreshToken(user, tokens.refreshToken, refreshToken);

    return res.json({
      success: true,
      user: sanitizeUser(user),
      tokens,
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    const payload = await verifyRefreshToken(refreshToken).catch(() => null);
    if (payload?.sub) {
      const user = await User.findById(payload.sub);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(
          (token: string) => token !== refreshToken
        );
        await user.save();
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
}

export async function me(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }

  return res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
}
