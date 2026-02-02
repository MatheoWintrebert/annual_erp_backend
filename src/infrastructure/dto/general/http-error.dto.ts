import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '@domain/types';

export class HttpErrorDto {
  @ApiProperty({
    type: String,
    description: 'The cause of the error',
    example: 'Error message',
  })
  message: string;

  @ApiProperty({
    nullable: true,
    enum: ErrorCode,
    example: null,
    description: 'The code of the error',
  })
  code: ErrorCode | null;

  @ApiProperty({
    nullable: true,
    type: Object,
    example: null,
    description: 'The details of the error',
  })
  details: Record<string, any>;
}