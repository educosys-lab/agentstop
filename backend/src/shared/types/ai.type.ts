import { ChatCompletion } from 'openai/resources';

export type AiResponseType = ChatCompletion & { _request_id?: string | null };
