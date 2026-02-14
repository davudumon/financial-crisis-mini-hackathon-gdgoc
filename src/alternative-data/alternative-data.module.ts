import { Module } from '@nestjs/common';
import { AlternativeDataService } from './alternative-data.service';
import { AlternativeDataController } from './alternative-data.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AlternativeDataController],
    providers: [AlternativeDataService],
    exports: [AlternativeDataService],
})
export class AlternativeDataModule { }
