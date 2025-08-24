import { z } from "zod";

export const MAX_INPUT_TOKENS=1000

export enum Model {
    'openai/gpt-4o',
    'openai/gpt-5'
} 

export const createChatSchema = z.object({
    conversationId : z.string().optional(),
    message : z.string().max(MAX_INPUT_TOKENS),
    model : z.enum(Model)
})

export type Message = {
    role : Role,
    content : string
}

export type Messages = Message[]

export enum Role {
    Agent = 'assistant',
    User = 'user'
}
