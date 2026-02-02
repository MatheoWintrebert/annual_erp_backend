import { TableEntity } from "@domain/entities/";

export abstract class TableRepository {
    abstract findAll(): Promise<TableEntity[]>;
    abstract findById(id: number): Promise<TableEntity>;
}