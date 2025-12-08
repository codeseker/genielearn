import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  // model: "gemini-2.0-flash", 
  model: "gemini-2.5-flash-lite", 
});

export { model };
