import { QueryUseCase } from "@domain/types";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";
import { Secret, TOTP } from "@otp-lib/authenticator";
import { GenerateTwoFactorInput, GenerateTwoFactorOutput } from ".";

@Injectable()
export class GenerateTwoFactorUseCase implements QueryUseCase<
  GenerateTwoFactorInput, GenerateTwoFactorOutput
> {
    constructor(private readonly userRepository: UserRepository,) {}

    async execute(input: GenerateTwoFactorInput): Promise<GenerateTwoFactorOutput> {
        const user = await this.userRepository.findById(input.userId);

        if (user.isTwoFactorEnabled) {
            throw new Error("Two-factor authentication is already enabled for this user.");
        }
        const secret = Secret.create();

        await this.userRepository.update(input.userId, {
            twoFactorSecret: secret.toBase32(),
            isTwoFactorEnabled: false,
        });

        const totp = new TOTP({
            account: input.email,
            issuer: "PMS",
            secret,
        });

        return { secret: secret.toBase32(), qrCode: totp.toURI() };
    }
}
