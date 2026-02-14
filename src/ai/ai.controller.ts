import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { ScoreRequestDto } from './dto/score-request.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  // Score the currently authenticated borrower.
  @UseGuards(JwtAuthGuard)
  @Post('score')
  async score(@Req() req: Request, @Body() dto: ScoreRequestDto) {
    const user = req.user as { sub: string; email: string };
    return this.ai.scoreBorrower({
      borrowerId: user.sub,
      temperature: dto.temperature,
      maxRetries: dto.maxRetries,
    });
  }
}
