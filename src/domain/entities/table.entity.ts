import { ITable } from "@domain/types";

export class TableEntity {
  public id: number | null;
  public name: string | null;

  constructor(params: ITable) {
    this.id = params.id;
    this.name = params.name;
  }
}
