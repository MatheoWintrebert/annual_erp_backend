import { UserEntity } from "@domain/entities/";

export abstract class UserRepository {
  abstract findAll(): Promise<UserEntity[]>;
  abstract findById(id: number): Promise<UserEntity>;
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract create(user: UserEntity): Promise<UserEntity>;
  abstract update(id: number, user: Partial<UserEntity>): Promise<UserEntity>;
  abstract delete(id: number): Promise<void>;
}
