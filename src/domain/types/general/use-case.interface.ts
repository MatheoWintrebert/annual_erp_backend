interface UseCase<Input, Output> {
  execute(params: Input): Output | Promise<Output>;
}

export type QueryUseCase<Input, Output> = UseCase<Input, Output>;

export type CommandUseCase<Input> = UseCase<Input, void>;
