import { createZodDto } from 'nestjs-zod';
import { ingestDocumentSchema } from '@repo/schemas';

export class IngestDocumentDto extends createZodDto(ingestDocumentSchema) {}