import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const ai = new GoogleGenAI({apiKey:"AIzaSyDoA502hhjfzgHtQ5QZYkBCYAas0Z1gnoc"});

const History=[]


  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
  });

async function main(){
    const userProblem=readlineSync.question("What can i do for you => ");
    const response = await chat.sendMessage({
    message: userProblem,
  });
  console.log(response.text);
    main();
}

main();