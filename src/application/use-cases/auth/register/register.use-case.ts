import { Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "@domain/repositories";
import { UserEntity } from "@domain/entities";
import { IRegisterInput } from "./register.input";
import { IRegisterOutput } from "./register.output";
import { HOTP, Secret } from "@otp-lib/core";
import { hash } from "crypto";
import { hashPassword } from "@libs/helpers";
import { TOTP } from "@otp-lib/authenticator";

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: IRegisterInput): Promise<IRegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const secret = Secret.fromUtf8(existingUser.twoFactorSecret!);

    const codeOTP = new HOTP({ secret: secret });

    const verify = await codeOTP.verifyDelta(input.code);

    if (verify === null) {
      throw new Error("Invalid code");
    }

    const newSecret = Secret.create();
    const user = new UserEntity({
      password: await hashPassword(input.password),
      isTwoFactorEnabled: true,
      twoFactorSecret: newSecret.toUtf8(),
    });

    const updatedUser = await this.userRepository.update(existingUser.id, user);

    const payload = { email: updatedUser.email, sub: updatedUser.id };
    const token = this.jwtService.sign(payload, { secret: "to2FA" });

    const totp = new TOTP({
      account: existingUser.email,
      issuer: "Pallitix",
      secret: newSecret,
    });

    return { user: updatedUser, token, qrCode: totp.toURI() };
  }
}
