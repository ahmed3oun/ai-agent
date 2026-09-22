import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { RagService } from './rag.service';
import { IngestDocumentDto, SearchOptions } from './dto';
import { ZodValidationPipe } from 'nestjs-zod';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  async ingest(@Body() dto: IngestDocumentDto) {
    return await this.ragService.ingestDocument(dto);
  }

  @Get('search')
  async search(@Query(ZodValidationPipe) searchOptions: SearchOptions) {
    return await this.ragService.hybridSearch({
      query: searchOptions.query,
      limit: searchOptions.limit ?? 5,
    });
  }
}
