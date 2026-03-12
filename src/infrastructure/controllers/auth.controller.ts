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
  RegisterUseCase,
  VerifyTwoFactorUseCase,
} from "@application/use-cases";
import { Auth2FaGuard } from "@infrastructure/guards/auth-2fa.guard";
import { GetUserInfo } from "@infrastructure/decorators";
import { IUserInfo } from "@domain/types";
import { FullLoginUseCase } from "@application/use-cases/auth/full-login";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyTwoFactorUseCase: VerifyTwoFactorUseCase,
    private readonly fullLoginUseCase: FullLoginUseCase,
  ) {}

  @Post("login")
  async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const result = await this.loginUseCase.execute(loginDto);
    return {
      token: result.token,
    };
  }

  @Post("full-login")
  async fullLogin(
    @Body() loginDto: FullLoginRequestDto
  ): Promise<LoginResponseDto> {
    const result = await this.fullLoginUseCase.execute(loginDto);
    return {
      token: result.token,
    };
  }

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
}
