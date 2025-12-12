import * as dotenv from 'dotenv';
dotenv.config();
import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI,ApiError  } from "@google/genai";

const ai = new GoogleGenAI({});
const History = []

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 

async function chatting(question) {
    //convert this question into vector
    const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
    });
 
 const queryVector = await embeddings.embedQuery(question);   
//query vector 
 //make connection with pinecone
 const pinecone = new Pinecone();
 const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

 const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
    });

    // console.log(searchResults);

    //top 10 documents : 10 meta data text part needed
    const context = searchResults.matches
                   .map(match => match.metadata.text)
                   .join("\n\n---\n\n");

    //create the context for llm

    History.push({
    role:'user',
    parts:[{text:question}]
    })   
    
    let response;
    const maxRetries = 5;
    for (let i = 0; i < maxRetries; i++) {
        try {
    response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: History,
    config: {
      systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
    You will be given a context of relevant information and a user question.
    Your task is to answer the user's question based ONLY on the provided context.
    If the answer is not in the context, you must say "I could not find the answer in the provided document."
    Keep your answers clear, concise, and educational.
      
      Context: ${context}
      `,
    },
   });
   break;
    } catch (error) {
            if (error instanceof ApiError && error.status === 429) {
                const retryAfterSeconds = error.details?.[2]?.retryDelay?.seconds || Math.pow(2, i) + Math.random(); // Use suggested time or exponential backoff
                console.log(`\nRate limit exceeded. Retrying in ${retryAfterSeconds.toFixed(2)} seconds...`);
                await sleep(retryAfterSeconds * 1000);
                if (i === maxRetries - 1) throw new Error("Max retries reached. Still hitting rate limits.");
            } else {
                // If it's a different error, throw it immediately
                throw error;
            }
        }
    }


   History.push({
    role:'model',
    parts:[{text:response.text}]
  })

  console.log("\n");
  console.log(response.text);
}


async function main(){
   const userProblem = readlineSync.question("Ask me anything--> ");
   await chatting(userProblem);
   main();
}


main();