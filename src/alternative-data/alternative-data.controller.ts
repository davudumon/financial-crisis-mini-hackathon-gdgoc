import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AlternativeDataService } from './alternative-data.service';
import { CreateRawDto } from './dto/create-raw.dto';
import { CreateOcrDto } from './dto/create-ocr.dto';

@Controller('alternative-data')
export class AlternativeDataController {
    constructor(private readonly service: AlternativeDataService) { }

    @Post('raw')
    async createRaw(@Body() dto: CreateRawDto) {
        return this.service.createRaw(dto);
    }

    @Post('raw/:rawId/ocr')
    async createOcr(@Param('rawId') rawId: string, @Body() dto: CreateOcrDto) {
        // ensure the path param wins
        const payload = { ...dto, alternativeDataRawId: rawId };
        return this.service.createOcr(payload as CreateOcrDto);
    }

    @Get('for-ai/:borrowerId')
    async getForAi(@Param('borrowerId') borrowerId: string) {
        return this.service.getForAi(borrowerId);
    }

    @Get('raw/:id')
    async getRaw(@Param('id') id: string) {
        return this.service.getRawById(id);
    }
}
