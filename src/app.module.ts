import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AlternativeDataModule } from './alternative-data/alternative-data.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, AlternativeDataModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
