import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { UserRepository } from "@domain/repositories";
import { ILoginInput, ILoginOutput } from ".";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: ILoginInput): Promise<ILoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_2FA_SECRET ?? "to2FA",
    });
    return { user, token };
  }
}
