// Fix: Manually define `import.meta.env` to fix TypeScript errors without a vite-env.d.ts file.
interface ImportMetaEnv {
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

import type { Message, Subject, Quiz, Part } from '../types';

const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateResponseStream = async (
    subject: Subject,
    messages: Message[],
    newParts: Part[],
    onStream: (chunk: string) => void,
    onError: (error: string) => void
): Promise<void> => {
    if (isDemoMode) {
        try {
            const demoResponse = subject.demoResponse || "This is a demo response. Everything seems to be working!";
            for (const char of demoResponse.split('')) {
                await sleep(20);
                onStream(char);
            }
        } catch (e) {
            onError("An error occurred in demo mode.");
        }
        return;
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, messages, newParts })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API error:", errorData);
            onError(`I'm sorry, I encountered an error: ${errorData.error || response.statusText}`);
            return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
            onError("Failed to read the response stream.");
            return;
        }

        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            onStream(decoder.decode(value, { stream: true }));
        }
    } catch (error) {
        console.error("Fetch API error:", error);
        onError("I'm sorry, I encountered a network error. Please check your connection and try again.");
    }
};

export const generateQuiz = async (subject: Subject, messages: Message[], questionCount: number): Promise<Quiz | null> => {
    if (isDemoMode) {
        return [
            { question: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
            { question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correctAnswer: "Paris" },
            { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], correctAnswer: "Mars" },
        ].slice(0, questionCount);
    }
    
    try {
        const response = await fetch('/api/quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, messages, questionCount })
        });
        
        if (!response.ok) {
            console.error("Quiz API error:", await response.text());
            return null;
        }
        
        const quizJson = await response.json();

        if (Array.isArray(quizJson)) {
            return quizJson as Quiz;
        }
        
        console.error("Parsed quiz data is not an array:", quizJson);
        return null;

    } catch (error) {
        console.error("Gemini API error during quiz generation:", error);
        return null;
    }
};