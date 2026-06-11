import { QueryUseCase } from "@domain/types";
import { IGetUserInput, IGetUserOutput } from "@application/use-cases";
import { UserRepository } from "@domain/repositories";

export class GetUserUseCase implements QueryUseCase<
  IGetUserInput,
  IGetUserOutput | null
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: IGetUserInput): Promise<IGetUserOutput | null> {
    return this.userRepository.findById(
      input.userId
    ) as Promise<IGetUserOutput | null>;
  }
}
