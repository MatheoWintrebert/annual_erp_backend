import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  FullLoginRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  VerifyTwoFactorRequestDto,
  VerifyTwoFactorResponseDto,
} from "@infrastructure/dto";
import {
  LoginUseCase,
  PostCreateUserUseCase,
  PostEditPasswordUseCase,
  RegisterUseCase,
  VerifyTwoFactorUseCase,
} from "@application/use-cases";
import { Auth2FaGuard } from "@infrastructure/guards/auth-2fa.guard";
import { GetUserInfo, Public } from "@infrastructure/decorators";
import { IUserInfo } from "@domain/types";
import { FullLoginUseCase } from "@application/use-cases/auth/full-login";
import { AuthUserGuard } from "@infrastructure/guards";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly fullLoginUseCase: FullLoginUseCase,
    private readonly editPasswordUseCase: PostEditPasswordUseCase,
    private readonly createUserUseCase: PostCreateUserUseCase,
  ) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute(loginDto);
    return {
      token: result.token,
    };
  }

  @Public()
  @Post("full-login")
  async fullLogin(
    @Body() loginDto: FullLoginRequestDto
  ): Promise<LoginResponseDto> {
    const result = await this.fullLoginUseCase.execute(loginDto);
    return {
      token: result.token,
      user: result.user,
    };
  }

  @Public()
  @Post("register")
  async register(
    @Body() registerDto: RegisterRequestDto
  ): Promise<RegisterResponseDto> {
    const result = await this.registerUseCase.execute(registerDto);
    return {
      user: result.user.toResponse(),
      token: result.token,
      qrCode: result.qrCode,
    };
  }

  @Post("2fa/verify")
  @UseGuards(Auth2FaGuard)
  async verifyTwoFactor(
    @GetUserInfo() user: IUserInfo,
    @Body() body: VerifyTwoFactorRequestDto
  ): Promise<VerifyTwoFactorResponseDto> {
    const result = await this.verifyTwoFactorUseCase.execute({
      userId: user.id,
      email: user.email,
      code: body.code,
      secret: user.twoFactorSecret ?? "",
    });
    return result;
  }

  @Post("edit-password")
  @UseGuards(AuthUserGuard)
  async editPassword(
    @GetUserInfo() user: IUserInfo,
    @Body() body: {oldPassword: string, newPassword: string}
  ): Promise<void> {
    const result = await this.editPasswordUseCase.execute({
      userId: user.id,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword
    });
    return;
  }

  @Post("create-user")
  @UseGuards(AuthUserGuard)
  async createUser(
    @GetUserInfo() user: IUserInfo,
    @Body() body: {email: string}
  ): Promise<{password: string}> {
    const result = await this.createUserUseCase.execute({
      email: body.email
    });
    return result;
  }
}
