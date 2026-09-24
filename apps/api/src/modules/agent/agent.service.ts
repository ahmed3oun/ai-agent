import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { Injectable, Logger } from "@nestjs/common";
import { RagService } from "../rag/rag.service";
import { ConfigService } from "@nestjs/config";
import { BaseMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';


// Define LangGraph State Annotation
// explain for it is used : This defines the structure of the state that will be passed between nodes in the LangGraph workflow
// It includes messages, context, toolExecuted, and needCorrection, each with their own reducer and default value
// The messages annotation is an array of BaseMessage objects, with a reducer that concatenates new messages to the existing array
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
  context: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  toolExecuted: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
  needCorrection: Annotation<boolean>({
    reducer: (x, y) => y ?? x,
    default: () => false,
  }),
});

@Injectable()
export class AgentService {

    private readonly logger = new Logger(AgentService.name);
    private model: ChatGoogleGenerativeAI | null = null;

    constructor(
        private configService: ConfigService,
        private ragService: RagService,
    ) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            this.logger.warn('GEMINI_API_KEY is not set in the environment variables.');
            // throw new Error('GEMINI_API_KEY is not set in the environment variables.');
        } else {
            this.model = new ChatGoogleGenerativeAI({
                apiKey,
                model: 'gemini-1.5-flash', // or 'gemini-1.5-turbo' based on your preference
                temperature: 0.2, // Adjust temperature as needed
            })
        }
    }

    async runAgent(userPrompt: string, history: BaseMessage[] = []) {
        if (!this.model) {
            throw new Error('Model is not initialized. Please check the GEMINI_API_KEY.');
        }

        this.logger.log(`Executing LangGraph workflow for prompt: "${userPrompt}"`);

        // Build LangGraph State Graph
        const graphBuilder = new StateGraph(AgentState)
        .addNode('retrieve', async (state) => { 
            // This node is responsible for retrieving relevant documents based on the user's last
            //  message or prompt. It uses the RagService to perform a hybrid search and fetches
            //  the top 3 relevant documents. The retrieved documents are then formatted into a context
            //  string that will be used in the next node for generating a response.

            this.logger.log('--- LangGraph Node: RAG Retrieval ---');
            const lastMessage = state.messages[state.messages.length - 1]?.content.toString() || userPrompt;
            try {
            const docs = await this.ragService.hybridSearch({ query: lastMessage, limit: 3 });
            const context = docs.map((d) => `[Doc Chunk]: ${d.content}`).join('\n\n');
            return { context };
            } catch (e: any) {
            this.logger.warn(`Retrieval fallback: ${e.message}`);
            return { context: '' };
            }
        })
        .addNode('generate', async (state) => {
            // This node is responsible for generating a response based on the retrieved context and
            //  the user's messages. It constructs a system prompt that instructs the model to answer
            //  the user's inquiry accurately based on the provided context. The model is then invoked
            //  with the system prompt and the user's messages to generate a response.
            this.logger.log('--- LangGraph Node: Response Generator ---');
            const systemPrompt = new SystemMessage(
            `You are an Enterprise AI Knowledge Assistant.
                Answer the user's inquiry accurately based on the provided context if available.
                Context retrieved:
                ${state.context || 'No specific document context found.'}

                Be concise, structured, and helpful.`,
            );

            // Invoke the model with the system prompt and the user's messages to generate a response
            const response = await this.model!.invoke([systemPrompt, ...state.messages]);
            return { messages: [response] };
        });

        graphBuilder.addEdge(START, 'retrieve');
        graphBuilder.addEdge('retrieve', 'generate');
        graphBuilder.addEdge('generate', END);

        // Compile the graph and execute it with the initial messages (user prompt and history)
        const compiledGraph = graphBuilder.compile();

        const initialMessages = [...history, new HumanMessage(userPrompt)];
        // Execute the compiled graph with the initial messages and retrieve the final state
        const resultState = await compiledGraph.invoke({ messages: initialMessages });

        const finalAIMessage = resultState.messages[resultState.messages.length - 1];

        return {
        response: finalAIMessage.content,
        context: resultState.context,
        };
    }
}