import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateUserRequestDto, UserResponseDto } from "@infrastructure/dto";
import {
  DeleteUserUseCase,
  GetAllUsersUseCase,
  PostCreateUserUseCase,
} from "@application/use-cases";
import { AuthUserGuard } from "@infrastructure/guards";

@Controller("user")
@UseGuards(AuthUserGuard)
export class UserController {
  constructor(
    private readonly createUserUseCase: PostCreateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
  ) {}

  @Get("")
  async getUsers(): Promise<UserResponseDto[]> {
    return this.getAllUsersUseCase.execute();
  }

  @Post("")
  async createUser(
    @Body() body: CreateUserRequestDto
  ): Promise<{ password: string }> {
    return this.createUserUseCase.execute({ email: body.email });
  }

  @Delete(":id")
  async deleteUser(@Param("id", ParseIntPipe) id: number): Promise<void> {
    await this.deleteUserUseCase.execute({ userId: id });
  }
}
