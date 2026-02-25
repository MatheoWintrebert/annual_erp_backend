import { LoginUseCase, RegisterUseCase } from "@application/use-cases";
import { FullLoginUseCase } from "@application/use-cases/auth/full-login";
import { UserRepository } from "@domain/repositories";
import { AuthController } from "@infrastructure/controllers";
import { UserMysqlRepository } from "@infrastructure/repositories";
import { ModuleMetadata } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export default {
  providers: [
    {
      provide: LoginUseCase,
      useFactory: (userRepository: UserRepository, jwtService: JwtService) =>
        new LoginUseCase(userRepository, jwtService),
      inject: [UserRepository, JwtService],
    },
    {
      provide: FullLoginUseCase,
      useFactory: (userRepository: UserRepository, jwtService: JwtService) =>
        new FullLoginUseCase(userRepository, jwtService),
      inject: [UserRepository, JwtService],
    },
    {
      provide: RegisterUseCase,
      useFactory: (userRepository: UserRepository, jwtService: JwtService) =>
        new RegisterUseCase(userRepository, jwtService),
      inject: [UserRepository, JwtService],
    },
  ],
  controllers: [AuthController],
} as ModuleMetadata;
