import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';

const ai = new GoogleGenAI({apiKey:"AIzaSyDoA502hhjfzgHtQ5QZYkBCYAas0Z1gnoc"});

const History=[]

async function genai(userProblem) {

    History.push({
        role:`user`,
        parts:[{text:userProblem}]
    })
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: History
  });

    History.push({
        role:`model`,
        parts:[{text:response.text}]
    })

  console.log(response.text);
}

async function main(){
    const userProblem=readlineSync.question("What can i do for you => ");
    await genai(userProblem);
    main();
}

main();