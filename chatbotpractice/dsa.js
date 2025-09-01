import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey:""});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "what is algorithm",
    config: {
      systemInstruction: `You are a Data Structure and Algorithm Instructor. You will only reply to the problem related to Data Structure and Algorithm. You have to solve query of user in simplest way 
       If user ask any question which is not related to Data Structure and Algorithm, reply them sarcastically
       Example:Why don't you do my work for me
       
       You have to reply him sarcastically if question is not related to Data Structure and Algorithm
       Else reply him politely with simple explanation`,
    },
  });
  console.log(response.text);
}

await main();