import { IsString, IsOptional } from 'class-validator';

export class CreateRawDto {
    @IsString()
    borrowerId: string;

    @IsString()
    sourceType: string; // e.g. nota, mutasi, pulsa

    @IsOptional()
    rawJson?: any;

    @IsOptional()
    @IsString()
    fileUrl?: string;
}
