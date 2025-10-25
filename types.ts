import type { FC } from 'react';

export interface Subject {
  id: string;
  name: string;
  description: string;
  Icon: FC<{ className?: string }>;
  gradient: string;
  systemPrompt: string;
  quickQuestions: string[];
  quotes: string[];
}

export interface TextPart {
  text: string;
}

export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export type Part = TextPart | InlineDataPart;

export interface Message {
  role: 'user' | 'model';
  parts: Part[];
  isInterrupted?: boolean;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  timestamp: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export type Quiz = QuizQuestion[];

export interface Flashcard {
  question: string;
  answer: string;
}

export type Flashcards = Flashcard[];