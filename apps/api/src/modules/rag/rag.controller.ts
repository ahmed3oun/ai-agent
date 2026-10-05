import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { RagService } from './rag.service.js';
import { IngestDocumentDto, SearchOptions } from './dto/index.js';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('rag')
export class RagController {
  private readonly logger = new Logger(RagController.name);
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  async ingest(@Body(ZodValidationPipe) dto: IngestDocumentDto) {
    this.logger.log(`Received ingest request for document: "${dto.title}"`);
    return await this.ragService.ingestDocument(dto);
  }

  @Get('search')
  // async search(@Query(ZodValidationPipe) searchOptions: SearchOptions) {
  async search(@Query('query') query: string, @Query('limit') limit?: number) {
    this.logger.log(`Received search request with query: "${query}" and limit: ${limit ?? '5'}`);
    return await this.ragService.hybridSearch({ query, limit: limit ?? 5 });
  }
}
