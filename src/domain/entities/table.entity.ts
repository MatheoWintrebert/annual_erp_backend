import { ITable } from "@domain/types";

export class TableEntity {
    public id!: number;
    public name!: string;
    public lastname?: string;

    constructor(params: Partial<ITable>) {
        this.id = params.id!;
        this.name = params.name!;
        this.lastname = params?.lastname || null;
    }
}