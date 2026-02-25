import { Request } from "express";
import { IUserInfo } from "@domain/types";

export interface IAuthRequest extends Request {
  userInfo: IUserInfo;
}
