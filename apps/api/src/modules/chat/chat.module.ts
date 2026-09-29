import { Module } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import { ChatController } from './chat.controller.js';
import { AgentModule } from '../agent/agent.module.js';

@Module({
  imports: [AgentModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
