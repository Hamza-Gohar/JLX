import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Message, Subject, Part, Content } from "../types";

const ai = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

export const generateResponse = async (
  subject: Subject,
  messages: Message[],
  newParts: Part[]
): Promise<string> => {
  try {
    const history: Content[] = messages
      .filter((m) => !m.isInterrupted)
      .map((m) => ({
        role: m.role,
        parts: m.parts,
      }));

    const contents: Content[] = [...history, { role: "user", parts: newParts }];

    const result = await ai.getGenerativeModel({ model }).generateContent({
      contents,
      generationConfig: {
        temperature: 0.5,
      },
    });

    // ✅ Correctly return the AI response text
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Sorry, there was an issue generating the response.";
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

    // --- START OF DEBUGGING CODE ---
    console.log("Raw response text from Gemini for quiz:", response.text);
    
    let quizJson;
    try {
        quizJson = JSON.parse(response.text);
    } catch(parseError) {
        console.error("Failed to parse JSON response:", parseError);
        console.error("The response from the API was not valid JSON.");
        return null;
    }
    // --- END OF DEBUGGING CODE ---

    // Basic validation to ensure we have an array
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