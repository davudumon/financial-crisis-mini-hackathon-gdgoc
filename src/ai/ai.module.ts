import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { geminiModelProvider } from './gemini.provider';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [geminiModelProvider, AiService],
  exports: [AiService],
})
export class AiModule {}
