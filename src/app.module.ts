import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AlternativeDataModule } from './alternative-data/alternative-data.module';

@Module({
  imports: [PrismaModule, AlternativeDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
