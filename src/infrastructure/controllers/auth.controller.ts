import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  EnableTwoFactorResponseDto,
  FullLoginRequestDto,
  LoginRequestDto,
  LoginResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  VerifyTwoFactorRequestDto,
  VerifyTwoFactorResponseDto,
} from "@infrastructure/dto";
import {
  GenerateTwoFactorUseCase,
  LoginUseCase,
  PostEditPasswordUseCase,
  RegisterUseCase,
  VerifyTwoFactorUseCase,
} from "@application/use-cases";
import { Auth2FaGuard } from "@infrastructure/guards/auth-2fa.guard";
import { GetUserInfo, Public, TwoFactor } from "@infrastructure/decorators";
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
    private readonly generateTwoFactorUseCase: GenerateTwoFactorUseCase
  ) {}

  @Public()
  @Post("login")
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute(loginDto);
    return {
      token: result.token,
      user: result.user,
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
  @TwoFactor()
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
    @Body() body: { oldPassword: string; newPassword: string }
  ): Promise<void> {
    await this.editPasswordUseCase.execute({
      userId: user.id,
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    });
    return;
  }

  @Post("2fa/generate")
  @TwoFactor()
  @UseGuards(Auth2FaGuard)
  async generateTwoFactor(
    @GetUserInfo() user: IUserInfo
  ): Promise<EnableTwoFactorResponseDto> {
    const result = await this.generateTwoFactorUseCase.execute({
      userId: user.id,
      email: user.email,
    });
    return {
      secret: result.secret,
      qrCodeUrl: result.qrCode,
    };
  }
}
