import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AlternativeDataModule } from './alternative-data/alternative-data.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [PrismaModule, AuthModule, AlternativeDataModule, AiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
