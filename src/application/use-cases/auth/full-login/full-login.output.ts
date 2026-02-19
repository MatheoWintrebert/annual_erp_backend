import { UserEntity } from "@domain/entities";

export interface IFullLoginOutput {
  user: UserEntity;
  token: string;
}