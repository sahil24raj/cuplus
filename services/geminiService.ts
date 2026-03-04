
import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, AnswerEvaluation } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this example, we'll throw an error if the key is missing.
  console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


export const solveDoubt = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) return "AI functionality is disabled. API_KEY is not configured.";
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a helpful academic assistant for university students. Keep your answers concise and accurate. Question: ${prompt}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error solving doubt:", error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
};

export const generateQuiz = async (topic: string): Promise<QuizQuestion[] | string> => {
    if (!process.env.API_KEY) return "AI functionality is disabled. API_KEY is not configured.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 5 multiple choice questions on the topic: ${topic}. Each question must have 4 options.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        questions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    question: { type: Type.STRING },
                                    options: {
                                        type: Type.ARRAY,
                                        items: { type: Type.STRING }
                                    },
                                    correctAnswer: { type: Type.STRING }
                                },
                                required: ["question", "options", "correctAnswer"]
                            }
                        }
                    }
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed.questions || [];
    } catch (error) {
        console.error("Error generating quiz:", error);
        return "Failed to generate quiz. Please check the topic and try again.";
    }
};


export const evaluateAnswer = async (question: string, answer: string): Promise<AnswerEvaluation | string> => {
    if (!process.env.API_KEY) return "AI functionality is disabled. API_KEY is not configured.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `As a university professor, evaluate the student's answer for the following question.
            Question: "${question}"
            Student's Answer: "${answer}"
            Provide a detailed evaluation. Your response must be in the specified JSON format. Give a rating out of 10, detailed feedback on the answer's correctness and completeness, and specific suggestions for improvement.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rating: {
                            type: Type.NUMBER,
                            description: "A numerical rating for the answer from 0 to 10."
                        },
                        feedback: {
                            type: Type.STRING,
                            description: "Detailed, constructive feedback on the student's answer, explaining what was good and what could be improved."
                        },
                        suggestions: {
                            type: Type.STRING,
                            description: "Actionable suggestions for how the student could improve their answer and understanding of the topic."
                        }
                    },
                    required: ["rating", "feedback", "suggestions"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return parsed as AnswerEvaluation;
    } catch (error) {
        console.error("Error evaluating answer:", error);
        return "Failed to evaluate the answer. The AI may be experiencing issues. Please try again later.";
    }
};

export const generateSubjectiveTest = async (topic: string): Promise<string[] | string> => {
    if (!process.env.API_KEY) return "AI functionality is disabled. API_KEY is not configured.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate 3 distinct, open-ended subjective questions for a university-level test on the topic: ${topic}.`,
        });
        
        const text = response.text;
        // Simple parsing based on newlines and numbers
        const questions = text.split('\n').filter(q => q.trim().length > 0 && /^\d+\./.test(q.trim()));
         if (questions.length < 2) { // Loosen condition in case of parsing issues
             // Fallback for when the model doesn't number the list or formats it differently
             const fallbackQuestions = text.split('\n').filter(q => q.trim().length > 15); // Check for reasonable length
             return fallbackQuestions.slice(0, 3);
        }
        return questions;
    } catch (error) {
        console.error("Error generating subjective test:", error);
        return "Failed to generate test questions. Please try again.";
    }
};
