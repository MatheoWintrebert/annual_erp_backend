import { Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserRepository } from "@domain/repositories";
import { UserEntity } from "@domain/entities";
import { ILoginInput, ILoginOutput } from ".";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: ILoginInput): Promise<ILoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isActive) {
      throw new Error("User is not active");
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }
    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, { secret: "to2FA" });
    return { user, token };
  }
}
