import { IShortUser } from ".";

export interface IUser extends IShortUser {
    password: string;
    twoFactorSecret?: string | null;
    isTwoFactorEnabled: boolean;
    backupCodes?: string[] | null;
}