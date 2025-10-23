import { GoogleGenAI, Content, Part, TextPart } from "@google/genai";
import type { Message, Subject } from '../src/types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {        
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const { subject, messages, newParts } = (await req.json()) as {
            subject: Subject;
            messages: Message[];
            newParts: Part[];
        };

        if (!subject || !messages || !newParts) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        // Basic rate limiting concept. For production, use a service like Upstash.
        // This is a placeholder and won't work effectively across serverless invocations.
        // console.log("Rate limiting should be implemented here.");

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const model = process.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
        
        const history: Content[] = messages
            .filter(m => !m.isInterrupted)
            .map(m => ({
                role: m.role,
                parts: m.parts
            }));
        
        const contents: Content[] = [...history, { role: 'user', parts: newParts }];

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: contents,
            config: {
                systemInstruction: subject.systemPrompt,
                temperature: 0.5,
            }
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of responseStream) {
                    controller.enqueue(encoder.encode(chunk.text));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error("Error in chat API:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
