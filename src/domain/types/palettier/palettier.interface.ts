export interface IPalettier {
  id: number;
  palettierTypeId: number | null;
  name: string;
  width: number;
  depth: number;
  height: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
