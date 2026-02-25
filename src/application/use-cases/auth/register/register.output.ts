import { UserEntity } from "@domain/entities";

export interface IRegisterOutput {
  user: UserEntity;
  token: string;
  qrCode: string;
}
