import { QueryUseCase } from "@domain/types";
import { Injectable } from "@nestjs/common";
import { UserRepository } from "@domain/repositories";
import { GetAllUsersOutput } from ".";

@Injectable()
export class GetAllUsersUseCase implements QueryUseCase<
  void,
  GetAllUsersOutput
> {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<GetAllUsersOutput> {
    const users = await this.userRepository.findAll();
    return users.map((user) => user.toResponse());
  }
}
