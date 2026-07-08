import { CommandUseCase } from "@domain/types";
import { DeleteUserInput } from ".";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";

@Injectable()
export class DeleteUserUseCase implements CommandUseCase<DeleteUserInput> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeleteUserInput): Promise<void> {
    await this.userRepository.delete(input.userId);
  }
}
