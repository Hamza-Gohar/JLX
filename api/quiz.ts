import { GoogleGenAI, Content, Part, TextPart, Type } from "@google/genai";
import type { Message, Subject, Quiz } from '../src/types';

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
        const { subject, messages, questionCount } = (await req.json()) as {
            subject: Subject,
            messages: Message[],
            questionCount: number,
        };
        
        if (!subject || !messages || !questionCount) {
             return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const conversationHistory = messages
          .filter(m => !m.isInterrupted)
          .slice(-10) 
          .map(m => {
            const textContent = m.parts
              .filter((p): p is TextPart => 'text' in p)
              .map(p => p.text)
              .join(' ');
            return `${m.role === 'user' ? 'User' : 'AI'}: ${textContent}`
          })
          .join('\n\n');

        const prompt = `Based on the following conversation about ${subject.name}, generate a short multiple-choice quiz with ${questionCount} questions to test understanding. The questions should be relevant to the key topics discussed. Ensure the 'correctAnswer' value is an exact match to one of the strings in the 'options' array.

        Conversation:
        ${conversationHistory}`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: "You are a helpful assistant that creates educational quizzes in JSON format.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING, description: "The quiz question." },
                  options: { type: Type.ARRAY, description: "An array of 4 possible answers.", items: { type: Type.STRING } },
                  correctAnswer: { type: Type.STRING, description: "The correct answer, which must be one of the strings from the options array." }
                },
                required: ["question", "options", "correctAnswer"]
              }
            }
          }
        });

        const quizJson = JSON.parse(response.text);
        
        return new Response(JSON.stringify(quizJson), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("Error in quiz API:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
