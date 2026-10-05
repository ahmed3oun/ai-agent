import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { EmbeddingService, splitTextIntoChunks } from './embedding/index.js';
import { SearchOptions, IngestDocumentDto } from './dto/index.js';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async ingestDocument(dto: IngestDocumentDto) {
    try {
      this.logger.log(`Ingesting document: "${dto.title}"`);

      // 1. Create document record
      const document = await this.prisma.document.create({
        data: {
          title: dto.title,
          filename: dto.filename,
          fileType: dto.fileType || 'txt',
          metadata: dto.metadata || {},
        },
      });

      // 2. Split text into chunks
      const chunks = splitTextIntoChunks(dto.content);
      this.logger.log(`Generated ${chunks.length} chunks for document ID: ${document.id}`);

      // 3. Generate embeddings
      const embeddings = await this.embeddingService.embedDocuments(chunks);

      // 4. Save chunks with vector embeddings using Prisma Raw SQL for pgvector
      for (let i = 0; i < chunks.length; i++) {
        const chunkText = chunks[i];
        const vector = embeddings[i];
        if (!vector || vector.length === 0) {
          throw new Error(`Failed to generate valid vector embedding for chunk ${i}`);
        }
        const vectorString = `[${vector.join(',')}]`;

        await (this.prisma as any).$executeRaw`
          INSERT INTO "document_chunks" ("id", "documentId", "chunkIndex", "content", "embedding", "metadata", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${document.id},
            ${i},
            ${chunkText},
            ${vectorString}::vector,
            ${JSON.stringify(dto.metadata || {})}::jsonb,
            NOW()
          )
        `;
      }

      this.logger.log(`Successfully ingested ${chunks.length} chunks for document ID: ${document.id}`);

      return {
        documentId: document.id,
        title: document.title,
        totalChunks: chunks.length,
      };
    } catch (error: any) {
      this.logger.error(`Error occurred while ingesting document: ${error.message}`);
      throw error;
    }
  }

  async hybridSearch(options: SearchOptions) {
    try {
      const limit = options.limit || '5';
      const queryVector = await this.embeddingService.embedQuery(options.query);
      this.logger.debug(`query vector embedding: "${queryVector}"`);
      if (!queryVector || queryVector.length === 0) {
        throw new Error(`Failed to generate valid vector embedding for query: "${options.query}"`);
      }
      const vectorString = `[${queryVector.join(',')}]`;
      this.logger.debug(`query vector string: "${vectorString}"`);

      // Perform vector cosine similarity search with pgvector `<->` operator
      const results: Array<{
        id: string;
        documentId: string;
        content: string;
        chunkIndex: number;
        metadata: any;
        similarity: number;
      }> = await (this.prisma as any).$queryRaw`
        SELECT 
          id, 
          "documentId", 
          content, 
          "chunkIndex", 
          metadata, 
          1 - (embedding <=> ${vectorString}::vector) AS similarity
        FROM "document_chunks"
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT ${+limit};
      `;
      this.logger.log(`Hybrid search returned ${results.length} results for query: "${options.query}"`);

      return results;
    } catch (error: any) {
      this.logger.error(`Error occurred while performing hybrid search: ${error.message}`);
      throw error;
    }
  }
}
