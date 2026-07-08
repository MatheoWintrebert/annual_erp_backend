import {
  DeleteUserUseCase,
  GetAllUsersUseCase,
  GetUserUseCase,
  PostCreateUserUseCase,
} from "@application/use-cases";
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
      provide: PostCreateUserUseCase,
      useFactory: (userRepository: UserRepository): PostCreateUserUseCase =>
        new PostCreateUserUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepository: UserRepository): DeleteUserUseCase =>
        new DeleteUserUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: GetUserUseCase,
      useFactory: (userRepository: UserRepository): GetUserUseCase =>
        new GetUserUseCase(userRepository),
      inject: [UserRepository],
    },
    {
      provide: GetAllUsersUseCase,
      useFactory: (userRepository: UserRepository): GetAllUsersUseCase =>
        new GetAllUsersUseCase(userRepository),
      inject: [UserRepository],
    },
  ],
  controllers: [UserController],
} as ModuleMetadata;
