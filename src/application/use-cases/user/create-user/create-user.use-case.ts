import { QueryUseCase } from "@domain/types";
import { CreateUserInput, CreateUserOutput } from ".";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";
import { UserEntity } from "@domain/entities";

@Injectable()
export class PostCreateUserUseCase implements QueryUseCase<
  CreateUserInput,
  CreateUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (user) {
      throw new Error("User Already exists");
    }
    const password = Math.random().toString(36);
    const newUser = new UserEntity({
      email: input.email,
      password: password,
      isActive: true,
      isTwoFactorEnabled: false,
    });

    await this.userRepository.create(newUser);
    return { password };
  }
}
