import { QueryUseCase } from '@domain/types';
import { IGetUserInput, IGetUserOutput } from '@application/use-cases';
import { UserRepository } from '@domain/repositories';
import { NotFoundError } from '@domain/errors';

export class GetUserUseCase implements QueryUseCase<IGetUserInput, IGetUserOutput> {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: IGetUserInput): Promise<IGetUserOutput> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user as IGetUserOutput;
  }
}
