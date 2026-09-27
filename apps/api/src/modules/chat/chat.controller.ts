import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  async createSession(@Body('title') title?: string) {
    return await this.chatService.createSession(title);
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
    @Body('sessionId') sessionId: string,
    @Body('prompt') prompt: string,
  ) {
    return await this.chatService.sendMessage(sessionId, prompt);
  }
}
