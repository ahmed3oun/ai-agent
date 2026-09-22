import { searchOptionsSchema } from "@repo/schemas";
import { createZodDto } from "nestjs-zod";

export class SearchOptions extends createZodDto(searchOptionsSchema) {}