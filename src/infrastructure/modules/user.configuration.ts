import { GetUserUseCase, PostUserUseCase } from "@application/use-cases";
import { UserRepository } from "@domain/repositories";
import { UserController } from "@infrastructure/controllers";
import { UserMysqlRepository } from "@infrastructure/repositories";
import { ModuleMetadata } from "@nestjs/common";

export default {
  providers: [
    {
      provide: UserRepository,
      useClass: UserMysqlRepository,
    },
    {
      provide: PostUserUseCase,
      useFactory: (userRepository: UserRepository): PostUserUseCase =>
        new PostUserUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: GetUserUseCase,
      useFactory: (userRepository: UserRepository): GetUserUseCase =>
        new GetUserUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
  controllers: [UserController],
} as ModuleMetadata;
