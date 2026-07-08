import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";
import { ILoginInput, ILoginOutput } from ".";
import { comparePassword, hashPassword } from "@libs/helpers";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: ILoginInput): Promise<ILoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user?.isActive) {
      throw new UnauthorizedException("Invalid credentials");
    }
    console.log("User password:", user.password);
    console.log("Input password:", await hashPassword(input.password));
    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials password");
    }
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_2FA_SECRET ?? "to2FA",
    });
    return { user, token };
  }
}
