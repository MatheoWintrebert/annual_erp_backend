import { QueryUseCase } from "@domain/types";

export class GetTableUseCase implements QueryUseCase<IGetTableInput, IGetTableOutput> {
  constructor(
    private readonly behaviorQuantService: BehaviorService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(params: IDeleteInteractionInput): Promise<void> {
    const user: UserEntity = await this.userRepository.getById(params.userId);
    if (!user.behaviorToken) {
      throw new Error('User behavior unknown');
    }
    await this.behaviorQuantService.deleteInteraction(user.behaviorToken, params.interactionToken);
  }
}