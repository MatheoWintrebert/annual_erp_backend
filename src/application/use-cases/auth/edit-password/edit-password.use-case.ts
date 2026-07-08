import { CommandUseCase } from "@domain/types";
import { Injectable } from "@nestjs/common/decorators";
import { EditPasswordInput } from ".";
import { UserRepository } from "@domain/repositories/user.repository";
import * as bcrypt from "bcrypt";
import { hashPassword } from "@libs/helpers";

@Injectable()
export class PostEditPasswordUseCase implements CommandUseCase<
  EditPasswordInput
> {
    constructor(private readonly userRepository: UserRepository,) {}

    async execute(input: EditPasswordInput): Promise<void> {
        const user = await this.userRepository.findById(input.userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (!user.isActive) {
            throw new Error("User is not active");
        }
        const isPasswordValid = await bcrypt.compare(input.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid password");
        } 

        const pass = { password: await hashPassword(input.newPassword) };

        await this.userRepository.update(input.userId, pass);


    }
}