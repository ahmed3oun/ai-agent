import { z } from 'zod';

// 1. Define the shared Zod Schema
export const ingestDocumentSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  filename: z.string().min(2, "Filename is too short"),
  fileType: z.string().optional(),
  content: z.string().min(10, "Content is too short"),
  metadata: z.record(z.any()).optional(),
});

export const searchOptionsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  limit: z.number().optional(),
  metadataFilter: z.record(z.any()).optional(),
});

// Define the Zod schemas for CreateSessionDto and CreateMessageDto
export const createSessionSchema = z.object({
  title: z.string().min(2, "Title is too short").optional(),
});

export const createMessageSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID").optional(),
  prompt: z.string().min(1, "Prompt is required"),
});

// 2. Infer and export the TypeScript Type from the schema
export type IngestDocumentDto = z.infer<typeof ingestDocumentSchema>;
export type SearchOptions = z.infer<typeof searchOptionsSchema>;
export type CreateSessionDto = z.infer<typeof createSessionSchema>;
export type CreateMessageDto = z.infer<typeof createMessageSchema>;
