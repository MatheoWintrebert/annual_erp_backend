import { ApiProperty } from "@nestjs/swagger";
import { CancelPickingListResult } from "@domain/types";

export class CancelPickingListResponseDto {
  @ApiProperty({ example: 1 })
  pickingListId!: number;

  @ApiProperty({ example: "cancelled" })
  status!: string;

  static fromDomain(result: CancelPickingListResult): CancelPickingListResponseDto {
    const dto = new CancelPickingListResponseDto();
    dto.pickingListId = result.pickingListId;
    dto.status = result.status;
    return dto;
  }
}
