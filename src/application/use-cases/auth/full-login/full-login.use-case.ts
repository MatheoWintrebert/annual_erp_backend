import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepository } from "@domain/repositories";
import { Secret, TOTP } from "@otp-lib/authenticator";
import { IFullLoginInput, IFullLoginOutput } from ".";

export class FullLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: IFullLoginInput): Promise<IFullLoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user?.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const secret = Secret.fromBase32(user.twoFactorSecret ?? "");
    const totp = new TOTP({
      account: input.email,
      issuer: "PMS",
      secret,
    });
    const isValid = await totp.verify(input.code);
    if (!isValid) {
      throw new UnauthorizedException("Invalid 2FA code");
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET ?? "application",
    });
    return { user, token };
  }
}
