import { RuleType } from "@domain/types/enums";

export interface IRule {
  id: number;
  name: string;
  description: string | null;
  type: RuleType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
