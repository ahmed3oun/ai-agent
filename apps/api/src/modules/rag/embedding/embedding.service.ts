import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.logger.log(`GEMINI_API_KEY: ${apiKey ? 'Configured' : 'Not Configured'}`);
    if (apiKey && apiKey !== 'your_google_gemini_api_key_here') {
      this.embeddingsModel = new GoogleGenerativeAIEmbeddings({
        apiKey,
        model: 'text-embedding-004',
      });
      this.logger.log('Google Gemini Embeddings model (text-embedding-004) initialized successfully.');
    } else {
      this.logger.warn(
        'GEMINI_API_KEY is missing or unconfigured. Fallback vector embeddings will be used for local testing.',
      );
    }
  }

  // explain for me tis method
  // This method, `generateFallbackEmbedding`, is a private utility function within 
  // the `EmbeddingService` class. Its purpose is to generate a fallback vector embedding for
  //  a given text input when the primary embeddings model (Google Gemini Embeddings) is not
  //  available or fails to produce valid embeddings.
  // The method takes two parameters:
  // - `text`: The input text for which the fallback embedding is to be generated.
  // - `dimensions`: The desired dimensionality of the output vector embedding (default is 768).
  // The method works by creating a hash value from the input text and then generating a vector of the
  //  specified dimensions using a sine function based on the hash value.
  //  This ensures that the generated embedding is deterministic 
  // (the same input text will always produce the same embedding) and provides a simple
  //  way to create embeddings for testing or fallback purposes when the primary model is unavailable.
  private generateFallbackEmbedding(text: string, dimensions = 768): number[] {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i); // Simple hash function to generate a hash value from the input text
      hash |= 0; // Convert to 32-bit integer
    }
    const vector: number[] = [];
    for (let i = 0; i < dimensions; i++) {
      const val = Math.sin(hash + i * 0.1);
      vector.push(Number(val.toFixed(6)));
    }
    return vector;
  }

  // explain for me tis method
  // The `embedQuery` method is an asynchronous function that generates a vector embedding for 
  // a given text query. 
  // It first checks if the primary embeddings model (Google Gemini Embeddings) is available.
  // If the model is available, it attempts to generate the embedding using the model's 
  // `embedQuery` method. 
  // If the model returns a valid embedding, it is returned.
  // If the model is not available or fails to produce a valid embedding 
  // (e.g., returns an empty result), 
  // the method falls back to generating a deterministic fallback embedding using the
  //  `generateFallbackEmbedding` method.
  // The method also includes error handling: if an error occurs while attempting to
  //  generate the embedding via the primary model, 
  // it logs the error and uses the fallback embedding instead. This ensures that
  //  the application can still function even if the primary model is unavailable
  //  or encounters issues.
  async embedQuery(text: string): Promise<number[]> {
    if (!this.embeddingsModel) {
      return this.generateFallbackEmbedding(text);
    }
    try {
      const res = await this.embeddingsModel.embedQuery(text);
      if (res && res.length > 0) {
        return res;
      }
      this.logger.warn('Gemini API returned empty query embedding. Using fallback embedding.');
      return this.generateFallbackEmbedding(text);
    } catch (error: any) {
      this.logger.error(`Error embedding query via Gemini API: ${error.message}. Using fallback embedding.`);
      return this.generateFallbackEmbedding(text);
    }
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    if (!this.embeddingsModel) {
      return texts.map((t) => this.generateFallbackEmbedding(t));
    }
    try {
      const embeddings = await this.embeddingsModel.embedDocuments(texts);
      const isValid = embeddings && embeddings.length > 0 && embeddings.every((e) => Array.isArray(e) && e.length > 0);
      if (isValid) {
        this.logger.log(`Successfully generated Gemini embeddings for ${texts.length} document chunks (dimensions: ${embeddings[0].length}).`);
        return embeddings;
      }
      this.logger.warn('Gemini API returned empty embeddings for document chunks. Using fallback embeddings.');
      return texts.map((t) => this.generateFallbackEmbedding(t));
    } catch (error: any) {
      this.logger.error(`Error embedding documents via Gemini API: ${error.message}. Using fallback embeddings.`);
      return texts.map((t) => this.generateFallbackEmbedding(t));
    }
  }
}
