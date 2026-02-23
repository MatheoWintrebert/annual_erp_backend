import { ApiProperty } from "@nestjs/swagger";
import type { RegisterConflictResolutionOutput } from "@application/use-cases";
import { RegisterPaletteResponseDto } from "./register-palette.response.dto";

export class RegisterConflictResolutionResponseDto {
  @ApiProperty({
    type: [RegisterPaletteResponseDto],
    description: "Created palettes (one per conflict group)",
  })
  palettes!: RegisterPaletteResponseDto[];

  static fromOutput(
    output: RegisterConflictResolutionOutput
  ): RegisterConflictResolutionResponseDto {
    const dto = new RegisterConflictResolutionResponseDto();
    dto.palettes = output.palettes.map((p) => {
      const paletteDto = new RegisterPaletteResponseDto();
      paletteDto.paletteId = p.palette.id;
      paletteDto.palettierId = p.palette.palettierId;
      paletteDto.palettierName = p.palettierName;
      paletteDto.positionX = p.palette.positionX;
      paletteDto.positionY = p.palette.positionY;
      paletteDto.positionZ = p.palette.positionZ;
      paletteDto.createdAt = p.palette.createdAt;
      paletteDto.items = p.items.map((item) => ({
        lotId: item.lot.id,
        lotReference: item.lot.reference,
        productId: item.lot.productId,
        productName: item.productName,
        quantity: item.paletteLot.quantity,
        expiryDate: item.lot.expirationDate,
      }));
      return paletteDto;
    });
    return dto;
  }
}
