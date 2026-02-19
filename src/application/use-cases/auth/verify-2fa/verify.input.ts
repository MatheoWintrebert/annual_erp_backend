import { IGetUserInput } from "@application/use-cases";

export interface IVerifyTwoFactorInput extends IGetUserInput {
  code: string;
  secret: string;
  email: string;
}