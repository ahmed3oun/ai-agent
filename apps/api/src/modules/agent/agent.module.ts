import { Module } from '@nestjs/common';
import { RagModule } from 'src/modules/rag/rag.module';
import { AgentService } from './agent.service';

@Module({
    imports: [RagModule],
    providers: [AgentService],
    exports: [AgentService],
})
export class AgentModule {}
