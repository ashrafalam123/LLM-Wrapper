import express from "express";
import { createChatSchema, Model, Role } from "./types";
import { chatCompletion } from "./openrouter";
import  { InMemoryStore } from "./InMemoryStore";

const app = express();
app.use(express.json())

app.post('/chat', async (req, res) => {
    const { success, data } = createChatSchema.safeParse(req.body);

    if(!success || !data) {
        res.status(411).json({
            message : "Invalid input format"
        })
    }

    const conversationId = data?.conversationId ?? Bun.randomUUIDv7();

    let existingMessages = InMemoryStore.getInstance().get(conversationId) || []

    existingMessages.push({
        role : Role.User,
        content : data!.message
    })

    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');

    let message = ""
    await chatCompletion(existingMessages, data!.model, (chunk : string) => {
        message += chunk
        res.write(chunk)
    })
    res.end()

    InMemoryStore.getInstance().add(conversationId,{
        content :  data!.message,
        role : Role.User
    })

    InMemoryStore.getInstance().add(conversationId, {
        content : message,
        role : Role.Agent
    })
})
