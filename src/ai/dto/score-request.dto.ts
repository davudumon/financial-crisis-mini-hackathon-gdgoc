import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ScoreRequestDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  maxRetries?: number;
}
