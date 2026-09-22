import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey && apiKey !== 'your_google_gemini_api_key_here') {
      // Initialize the Google Gemini Embeddings model
      //  model is used to generate vector embeddings for text data, which can be used for various applications such as semantic search, clustering, and recommendation systems. The embeddings capture the semantic meaning of the text, allowing for more effective comparisons and retrieval of similar content.
      this.embeddingsModel = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: 'text-embedding-004',
      }); // Use the appropriate model name for Google Gemini Embeddings 
      this.logger.log('Google Gemini Embeddings model initialized successfully.');
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is missing or unconfigured. Vector embeddings will require a valid API key.',
      );
    }
  }

  async embedQuery(text: string): Promise<number[]> {
    if (!this.embeddingsModel) {
      throw new Error(
        'Embedding model is not initialized. Please set a valid GEMINI_API_KEY in .env',
      );
    }
    return await this.embeddingsModel.embedQuery(text);
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!this.embeddingsModel) {
      throw new Error(
        'Embedding model is not initialized. Please set a valid GEMINI_API_KEY in .env',
      );
    }
    return await this.embeddingsModel.embedDocuments(texts);
  }
}
