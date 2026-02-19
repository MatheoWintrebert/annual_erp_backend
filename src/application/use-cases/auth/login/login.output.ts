import { UserEntity } from "@domain/entities";

export interface ILoginOutput {
  user: UserEntity;
  token: string;
}