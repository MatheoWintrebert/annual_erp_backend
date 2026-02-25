import { PostUserUseCase } from "@application/use-cases";
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
      useFactory: (userRepository: UserRepository) =>
        new PostUserUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
  controllers: [UserController],
} as ModuleMetadata;
