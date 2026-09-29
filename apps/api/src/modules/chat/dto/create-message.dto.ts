import { createZodDto } from 'nestjs-zod';
import { createMessageSchema } from '@repo/schemas';

export class CreateMessageDto extends createZodDto(createMessageSchema) {}