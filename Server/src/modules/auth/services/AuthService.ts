import User, { UserDoc } from "../../../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from "../../../utils/authTokens";
import { comparePassword, hashPassword } from "../../../utils/password";
import { verifyGoogleIdToken } from "../../../utils/googleAuth";
import { MatrixUserService } from "../../chat/services/matrix/MatrixUserService";
import crypto from "crypto";
import { AppError } from "../../../middleware/error/AppError";

const MAX_REFRESH_TOKENS = 5;

export class AuthService {
  private matrixUserService: MatrixUserService;

  constructor() {
    this.matrixUserService = new MatrixUserService();
  }

  private sanitizeUser(user: UserDoc) {
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
      matrix: user.matrix
        ? {
            userId: user.matrix.userId,
            password: user.matrix.password,
            deviceId: user.matrix.deviceId,
            isSynced: user.matrix.isSynced,
          }
        : undefined,
    };
  }

  private async storeRefreshToken(
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

  private issueTokens(user: UserDoc) {
    const payload: TokenPayload = {
      sub: user._id.toString(),
      email: user.email,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  public async register(data: any) {
    const { email, password, displayName } = data;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("Email is already registered", 409);
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      displayName,
    });

    // Create Matrix User
    try {
      const matrixPassword = crypto.randomBytes(16).toString("hex");
      const matrixUsername =
        ((user.email || "user").split("@")[0] || "user").replace(
          /[^a-z0-9]/g,
          ""
        ) +
        "_" +
        crypto.randomBytes(4).toString("hex");

      const matrixUserId = await this.matrixUserService.createMatrixUser(
        matrixUsername,
        matrixPassword
      );

      if (matrixUserId) {
        user.matrix = {
          userId: matrixUserId,
          password: matrixPassword,
          isSynced: true,
        };
        await user.save();
      }
    } catch (matrixError) {
      console.error(
        "Failed to create Matrix user during registration:",
        matrixError
      );
    }

    const tokens = this.issueTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async login(data: any) {
    const { email, password } = data;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      throw new AppError("Invalid email or password", 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = this.issueTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async googleLogin(idToken: string) {
    const payload = await verifyGoogleIdToken(idToken);
    const { sub: googleId, email, name, picture } = payload;

    if (!googleId || !email) {
      throw new AppError("Google account does not provide email access", 400);
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
        const matrixUsername =
          (email.split("@")[0] || "user").replace(/[^a-z0-9]/g, "") +
          "_" +
          crypto.randomBytes(4).toString("hex");

        const matrixUserId = await this.matrixUserService.createMatrixUser(
          matrixUsername,
          matrixPassword
        );

        if (matrixUserId) {
          user.matrix = {
            userId: matrixUserId,
            password: matrixPassword,
            isSynced: true,
          };
          await user.save();
        }
      } catch (matrixError) {
        console.error(
          "Failed to create Matrix user during Google registration:",
          matrixError
        );
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

    const tokens = this.issueTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async refreshToken(token: string) {
    const payload = await verifyRefreshToken(token);
    const user = await User.findById(payload.sub);

    if (!user) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (!user.refreshTokens.includes(token)) {
      throw new AppError("Refresh token has been revoked", 401);
    }

    const tokens = this.issueTokens(user);
    await this.storeRefreshToken(user, tokens.refreshToken, token);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  public async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new AppError("Refresh token is required", 400);
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
  }

  public getUserProfile(user: UserDoc) {
    return this.sanitizeUser(user);
  }
}
