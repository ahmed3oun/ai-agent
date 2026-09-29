import { Module } from '@nestjs/common';
import { RagService } from './rag.service.js';
import { RagController } from './rag.controller.js';
import { EmbeddingService } from './embedding/index.js';

@Module({
  imports: [],
  controllers: [RagController],
  providers: [RagService, EmbeddingService],
  exports: [RagService, EmbeddingService],
})
export class RagModule {}
