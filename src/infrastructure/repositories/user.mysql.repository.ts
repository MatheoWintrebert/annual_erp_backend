import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { UserRepository } from "../../domain/repositories/user.repository";
import { UserEntity } from "@domain/entities";
import { UserTypeormEntity } from "../entities/user.typeorm.entity";

@Injectable()
export class UserMysqlRepository implements UserRepository {
  private readonly logger: Logger = new Logger(UserMysqlRepository.name);

  constructor(
    @InjectRepository(UserTypeormEntity)
    private readonly userRepository: Repository<UserTypeormEntity>
  ) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userRepository.find();
    return users.map((user) => new UserEntity(user));
  }

  async findById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error("User not found");
    }
    return new UserEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ? new UserEntity(user) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = this.userRepository.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: hashedPassword,
      isActive: user.isActive,
      twoFactorSecret: user.twoFactorSecret,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      backupCodes: user.backupCodes,
    });
    const savedUser = await this.userRepository.save(newUser);
    return new UserEntity(savedUser);
  }

  async update(id: number, userData: Partial<UserEntity>): Promise<UserEntity> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new Error("User not found");
    }
    return new UserEntity(updatedUser);
  }

  async delete(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
