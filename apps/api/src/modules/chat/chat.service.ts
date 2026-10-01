import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentService } from '../agent/agent.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';

@Injectable()
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        private readonly agentService: AgentService,
        private readonly prisma: PrismaService
    ) {}

    async createSession(title: string = 'New Research Session') {
        return await this.prisma.chatSession.create({
            data: {
                title: title,
            }
        });
    }

    async getSessions() {
        return await (this.prisma as any).chatSession.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    }

    async getSessionHistory(sessionId: string) {
        return await (this.prisma as any).chatSession.findUnique({
            where: { id: sessionId },
            include: {
                messages: {
                orderBy: { createdAt: 'asc' },
                },
            },
        });
    }

    async sendMessage(userPrompt: string, sessionId?: string) {
        // 1. Get or verify session
        let session;
        if (sessionId) {
            session = await this.prisma.chatSession.findUnique({
                where: { id: sessionId },
                include: { messages: true },
            });
            if (!session) {
                throw new NotFoundException('Session not found');
            }
        } else {
            const title = await this.agentService.generateSessionTitle(userPrompt);
            session = await this.createSession(title);
        }

        this.logger.log(`Session ID: ${session.id}, User Prompt: ${userPrompt}`);

        await this.prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: 'user',
                content: userPrompt,
            },
        })

        const history: BaseMessage[] = (session.messages || []).map((m: { role: string; content: string }) =>
            m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content),
        );

        // 4. Run LangGraph Agent Workflow
        const agentResult = await this.agentService.runAgent(userPrompt, history);

        // 5. Save AI response to database
        const aiMessage = await this.prisma.chatMessage.create({
            data: {
                sessionId: session.id,
                role: 'assistant',
                content: agentResult.response.toString(),
                metadata: { context: agentResult.context },
            },
        });

        return {
            sessionId: session.id,
            userPrompt,
            message: aiMessage,
            context: agentResult.context,
        }
    }
}
