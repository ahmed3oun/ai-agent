import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/utils/api';
import { Session } from '@/utils/types';
import { CreateSessionDto } from '@repo/schemas';
// import {  } from '@repo/schemas';

const fetchSessions = async (): Promise<Session[]> => {
    const { data } = await api.get('/chat/sessions');
    return data;
};

const createSession = async (session: CreateSessionDto): Promise<Session> => {
    const { data } = await api.post('/chat/sessions', session);
    return data;
};

export function useCreateSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createSession,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    });
}

export function useSessions() {
    return useQuery({
        queryKey: ['chat-sessions'],
        queryFn: () => fetchSessions()
    });
}