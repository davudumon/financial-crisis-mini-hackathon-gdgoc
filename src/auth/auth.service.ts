import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterBorrowerDto } from './dto/register-borrower.dto';

type RefreshPayload = {
  sub: string;
  email: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function readExpiresIn(name: string, fallback: StringValue): StringValue {
  const value = process.env[name];
  return (value ?? fallback) as StringValue;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async registerBorrower(dto: RegisterBorrowerDto): Promise<AuthTokensDto> {
    const existing = await this.prisma.borrower.findFirst({
      where: {
        OR: [{ email: dto.email }, dto.phoneNumber ? { phoneNumber: dto.phoneNumber } : undefined].filter(Boolean) as any,
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email/phone already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const borrower = await this.prisma.borrower.create({
      data: {
        name: dto.name,
        businessType: dto.businessType,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash,
      },
      select: { id: true, email: true },
    });

    const tokens = await this.issueTokens({
      borrowerId: borrower.id,
      email: borrower.email ?? dto.email,
    });

    await this.setRefreshTokenHash(borrower.id, tokens.refreshToken);
    return tokens;
  }

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const borrower = await this.prisma.borrower.findFirst({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!borrower) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, borrower.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens({
      borrowerId: borrower.id,
      email: borrower.email ?? dto.email,
    });

    await this.setRefreshTokenHash(borrower.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const payload = this.verifyRefreshToken(refreshToken);

    const borrower = await this.prisma.borrower.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, refreshTokenHash: true },
    });

    if (!borrower || !borrower.refreshTokenHash) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    const ok = await bcrypt.compare(refreshToken, borrower.refreshTokenHash);
    if (!ok) throw new UnauthorizedException('Refresh token invalid');

    const tokens = await this.issueTokens({
      borrowerId: borrower.id,
      email: borrower.email ?? payload.email,
    });

    await this.setRefreshTokenHash(borrower.id, tokens.refreshToken);
    return tokens;
  }

  async logout(borrowerId: string) {
    await this.prisma.borrower.update({
      where: { id: borrowerId },
      data: { refreshTokenHash: null },
      select: { id: true },
    });
  }

  private async issueTokens(input: {
    borrowerId: string;
    email: string;
  }): Promise<AuthTokensDto> {
    const accessSecret = requireEnv('JWT_ACCESS_SECRET');
    const refreshSecret = requireEnv('JWT_REFRESH_SECRET');
    const accessExpiresIn = readExpiresIn('JWT_ACCESS_EXPIRES_IN', '15m');
    const refreshExpiresIn = readExpiresIn('JWT_REFRESH_EXPIRES_IN', '7d');

    const payload = { sub: input.borrowerId, email: input.email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwt.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private verifyRefreshToken(token: string): RefreshPayload {
    const refreshSecret = requireEnv('JWT_REFRESH_SECRET');

    try {
      return this.jwt.verify<RefreshPayload>(token, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token invalid');
    }
  }

  private async setRefreshTokenHash(borrowerId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await this.prisma.borrower.update({
      where: { id: borrowerId },
      data: { refreshTokenHash },
      select: { id: true },
    });
  }
}
