import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRawDto } from './dto/create-raw.dto';
import { CreateOcrDto } from './dto/create-ocr.dto';

@Injectable()
export class AlternativeDataService {
    constructor(private prisma: PrismaService) { }

    async createRaw(createRawDto: CreateRawDto) {
        const { borrowerId, sourceType, rawJson, fileUrl } = createRawDto;

        // Ensure borrower exists (will throw if not found)
        const borrower = await this.prisma.borrower.findUnique({ where: { id: borrowerId } });
        if (!borrower) throw new NotFoundException('Borrower not found');

        return this.prisma.alternativeDataRaw.create({
            data: {
                borrowerId,
                sourceType,
                rawJson: rawJson ?? {},
                fileUrl,
            },
        });
    }

    async createOcr(createOcrDto: CreateOcrDto) {
        const { alternativeDataRawId, extractedText, confidence, geminiResponseJson } = createOcrDto;

        const raw = await this.prisma.alternativeDataRaw.findUnique({ where: { id: alternativeDataRawId } });
        if (!raw) throw new NotFoundException('AlternativeDataRaw not found');

        return this.prisma.ocrExtraction.create({
            data: {
                alternativeDataRawId,
                extractedText,
                confidence: confidence ?? undefined,
                geminiResponseJson: geminiResponseJson ?? {},
            },
        });
    }

    async getForAi(borrowerId: string) {
        // Return raw alternative data and OCR results for AI module
        const raws = await this.prisma.alternativeDataRaw.findMany({
            where: { borrowerId },
            orderBy: { createdAt: 'desc' },
        });

        const rawIds = raws.map((r) => r.id);
        const ocrs = rawIds.length
            ? await this.prisma.ocrExtraction.findMany({
                where: { alternativeDataRawId: { in: rawIds } },
                orderBy: { createdAt: 'desc' },
            })
            : [];

        // attach OCRs to their raw records
        const rawMap = raws.map((r) => ({
            ...r,
            ocrs: ocrs.filter((o) => o.alternativeDataRawId === r.id),
        }));

        return { borrowerId, alternativeDataRaw: rawMap };
    }

    async getRawById(id: string) {
        return this.prisma.alternativeDataRaw.findUnique({ where: { id }, include: { ocrExtractions: true } });
    }
}
