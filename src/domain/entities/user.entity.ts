import { IUser } from "@domain/types";

export class UserEntity {
    public id!: number;
    public lastName!: string;
    public firstName!: string;
    public email!: string;
    public password!: string;
    public isActive!: boolean;
    public twoFactorSecret?: string | null;
    public isTwoFactorEnabled!: boolean;
    public backupCodes?: string[] | null;
    public createdAt!: Date;
    public updatedAt!: Date;

    constructor(params: Partial<IUser>) {
        this.id = params.id!;
        this.lastName = params.lastName!;
        this.firstName = params.firstName!;
        this.email = params.email!;
        this.password = params.password!;
        this.isActive = params.isActive ?? true;
        this.twoFactorSecret = params.twoFactorSecret || null;
        this.isTwoFactorEnabled = params.isTwoFactorEnabled ?? false;
        this.backupCodes = params.backupCodes || null;
        this.createdAt = params.createdAt!;
        this.updatedAt = params.updatedAt!;
    }

    public toResponse() {
        return {
            id: this.id,
            lastName: this.lastName,
            firstName: this.firstName,
            email: this.email,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}
