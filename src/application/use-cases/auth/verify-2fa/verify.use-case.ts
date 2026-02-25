import { Inject } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";
import { IVerifyTwoFactorInput, IVerifyTwoFactorOutput } from ".";
import { Secret, TOTP } from "@otp-lib/authenticator";
import { JwtService } from "@nestjs/jwt";

export class VerifyTwoFactorUseCase {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(input: IVerifyTwoFactorInput): Promise<IVerifyTwoFactorOutput> {
    const secret = Secret.fromUtf8(input.secret);
    const totp = new TOTP({
      account: input.email,
      issuer: "Pallitix",
      secret,
    });
    const isValid = totp.verify(input.code);
    if (!isValid) {
      throw new Error("Invalid 2FA code");
    }

    const payload = { email: input.email, sub: input.userId };
    const token = this.jwtService.sign(payload, { secret: "application" });

    return { token };
  }
}
