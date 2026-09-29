import { Module } from '@nestjs/common';
import { RagModule } from '../rag/rag.module.js';
import { AgentService } from './agent.service.js';

@Module({
    imports: [RagModule],
    providers: [AgentService],
    exports: [AgentService],
})
export class AgentModule {}
