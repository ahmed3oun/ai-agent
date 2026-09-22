import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { EmbeddingService } from './embedding';

@Module({
  imports: [EmbeddingService],
  controllers: [RagController],
  providers: [RagService, EmbeddingService],
})
export class RagModule {}
