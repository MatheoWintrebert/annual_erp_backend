import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PostUserResquestDto, } from '@infrastructure/dto';
import { PostUserUseCase } from '@application/use-cases';
import { AuthUserGuard } from '@infrastructure/guards';

@Controller('auth')
@UseGuards(AuthUserGuard)
export class UserController {
  constructor(
    private readonly postUserUseCase: PostUserUseCase,
  ) {}

  @Post('')
  async createUser(@Body() registerDto: PostUserResquestDto): Promise<void> {
    const result = await this.postUserUseCase.execute(registerDto);

  }
}