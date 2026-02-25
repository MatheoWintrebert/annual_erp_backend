import { CommandUseCase } from "@domain/types";
import { IPostUserInput } from ".";
import { UserRepository } from "@domain/repositories";
import { UserEntity } from "@domain/entities";
import { HOTP, Secret } from "@otp-lib/core";

export class PostUserUseCase implements CommandUseCase<IPostUserInput> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: IPostUserInput): Promise<void> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const secret = Secret.create();
    const codeOTP = new HOTP({ secret });

    const user = new UserEntity({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      isActive: true,
      isTwoFactorEnabled: false,
      twoFactorSecret: secret.toUtf8(),
    });

    const token = await codeOTP.generate();

    //send (by email) the token to the user for verification purpose
    console.log(`Token for ${input.email}: ${token}`);

    await this.userRepository.create(user);
  }
}
