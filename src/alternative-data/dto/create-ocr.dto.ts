import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateOcrDto {
    @IsString()
    alternativeDataRawId: string;

    @IsString()
    extractedText: string;

    @IsOptional()
    @IsNumber()
    confidence?: number;

    @IsOptional()
    geminiResponseJson?: any;
}
