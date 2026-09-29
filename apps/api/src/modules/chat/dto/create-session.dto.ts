import { createZodDto } from 'nestjs-zod';
import { createSessionSchema } from '@repo/schemas';

export class CreateSessionDto extends createZodDto(createSessionSchema) {}