import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { CreateSessionDto } from './dto/create-session.dto.js';
import { ZodValidationPipe } from 'nestjs-zod';
import { CreateMessageDto } from './dto/create-message.dto.js';


@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Body(ZodValidationPipe) dto: CreateSessionDto) {
    return await this.chatService.createSession(dto.title);
  }

  @Get('sessions')
  async getSessions() {
    return await this.chatService.getSessions();
  }

  @Get('sessions/:id')
  async getSessionHistory(@Param('id') id: string) {
    return await this.chatService.getSessionHistory(id);
  }

  @Post('message')
  async sendMessage(
    @Body(ZodValidationPipe) dto: CreateMessageDto
  ) {
    return await this.chatService.sendMessage(dto.prompt, dto.sessionId);
  }
}
