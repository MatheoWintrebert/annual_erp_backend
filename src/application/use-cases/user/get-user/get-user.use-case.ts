import { QueryUseCase } from "@domain/types";
import { IGetUserInput, IGetUserOutput } from "@application/use-cases";
import { UserRepository } from "@domain/repositories";

export class GetUserUseCase implements QueryUseCase<
  IGetUserInput,
  IGetUserOutput
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: IGetUserInput): Promise<IGetUserOutput> {
    const user = await this.userRepository.findById(input.userId);

    return user as IGetUserOutput;
  }
}
