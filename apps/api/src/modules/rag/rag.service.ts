import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmbeddingService, splitTextIntoChunks } from './embedding';
import { SearchOptions, IngestDocumentDto } from './dto';

@Injectable()
export class RagService {
    private readonly logger = new Logger(RagService.name);

  constructor(
    private prisma: PrismaService,
    private embeddingService: EmbeddingService,
  ) {}

  async ingestDocument(dto: IngestDocumentDto) {
    this.logger.log(`Ingesting document: "${dto.title}"`);

    // 1. Create document record
    const document = await (this.prisma as any).document.create({
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
        );
      `;
    }

    return {
      documentId: document.id,
      title: document.title,
      totalChunks: chunks.length,
    };
  }

  async hybridSearch(options: SearchOptions) {
    const limit = options.limit || 5;
    const queryVector = await this.embeddingService.embedQuery(options.query);
    const vectorString = `[${queryVector.join(',')}]`;

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
      LIMIT ${limit};
    `;

    return results;
  }
}
