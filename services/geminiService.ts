
import { GoogleGenAI, Content, Type } from "@google/genai";
import type { Message, Subject, Quiz, Part, TextPart } from '../types';

if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set. It seems the API key is missing. Please ensure it is configured correctly in the environment.");
}

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const model = 'gemini-2.0-flash';

export const generateResponse = async (
    subject: Subject,
    messages: Message[],
    newParts: Part[]
): Promise<string> => {
  try {
    const history: Content[] = messages
        .filter(m => !m.isInterrupted) // Don't send interrupted turns
        .map(m => ({
            role: m.role,
            parts: m.parts
        }));
    
    const contents: Content[] = [...history, { role: 'user', parts: newParts }];

    const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
            systemInstruction: subject.systemPrompt,
            temperature: 0.5,
        }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("I'm sorry, I encountered an error while processing your request. Please try again later. Here's an example of what you could ask: 'Explain Newton's laws of motion.'");
  }
};


export const generateQuiz = async (subject: Subject, messages: Message[], questionCount: number): Promise<Quiz | null> => {
  try {
    // Filter out interrupted messages and take the last 10 messages for context
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
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful assistant that creates educational quizzes in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The quiz question."
              },
              options: {
                type: Type.ARRAY,
                description: "An array of 4 possible answers.",
                items: { type: Type.STRING }
              },
              correctAnswer: {
                type: Type.STRING,
                description: "The correct answer, which must be one of the strings from the options array."
              }
            },
            required: ["question", "options", "correctAnswer"]
          }
        }
      }
    });
    
    let quizJson;
    try {
        quizJson = JSON.parse(response.text);
    } catch(parseError) {
        console.error("Failed to parse JSON response for quiz:", parseError);
        return null;
    }

    if (Array.isArray(quizJson)) {
      return quizJson as Quiz;
    }
    return null;

  } catch (error) {
    console.error("Gemini API error during quiz generation:", error);
    return null;
  }
};


export const generateFlashcards = async (subject: Subject, messages: Message[], cardCount: number): Promise<Flashcards | null> => {
    try {
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

        const prompt = `Based on the following conversation about ${subject.name}, generate a set of ${cardCount} flashcards to help with studying. Each flashcard should have a 'question' on one side and a concise 'answer' on the other.

        Conversation:
        ${conversationHistory}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are a helpful assistant that creates educational flashcards in JSON format.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            question: {
                                type: Type.STRING,
                                description: "The question for the front of the flashcard."
                            },
                            answer: {
                                type: Type.STRING,
                                description: "The answer for the back of the flashcard."
                            }
                        },
                        required: ["question", "answer"]
                    }
                }
            }
        });

        let flashcardsJson;
        try {
            flashcardsJson = JSON.parse(response.text);
        } catch (parseError) {
            console.error("Failed to parse JSON response for flashcards:", parseError);
            return null;
        }

        if (Array.isArray(flashcardsJson)) {
            return flashcardsJson as Flashcards;
        }
        return null;

    } catch (error) {
        console.error("Gemini API error during flashcard generation:", error);
        return null;
    }
};