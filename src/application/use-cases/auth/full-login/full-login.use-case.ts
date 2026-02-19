import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from "@domain/repositories";
import { UserEntity } from "@domain/entities";
import { Secret, TOTP } from '@otp-lib/authenticator';
import { IFullLoginInput, IFullLoginOutput } from '.';

export class FullLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(input: IFullLoginInput): Promise<IFullLoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.isActive) {
      throw new Error('User is not active');
    }
    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const secret = Secret.fromUtf8(input.code);
    const totp = new TOTP({
        account: input.email,
        issuer: "Pallitix",
        secret,
    }); 
    const isValid = totp.verify(input.code);
    if (!isValid) {
      throw new Error('Invalid 2FA code');
    }

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {secret: 'application'} );
    return { user, token };

  }
}