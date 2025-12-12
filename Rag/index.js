import {PDFLoader} from '@langchain/community/document_loaders/fs/pdf';
import {RecursiveCharacterTextSplitter} from '@langchain/textsplitters'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
dotenv.config();

async function indexdoc() {
    const PDF_Path='./dsa.pdf';
    const pdfLoader=new PDFLoader(PDF_Path);
    const rawDocs=await pdfLoader.load();
    console.log("pdf loaded");
    
    // console.log(JSON.stringify(rawDocs,null,2));
    // console.log(rawDocs.length);

    //Chunking document
    const textsplitter=new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200,
})
const chunkedDocs=await textsplitter.splitDocuments(rawDocs)
// console.log(chunkedDocs);
console.log( 'chuncked');


//vector embedding model

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: 'text-embedding-004',
  });
console.log('embedding model configuration');


  //Database  config i.e Pinecone
  //Intitialize Pinecone
  const pinecone = new Pinecone();
  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  console.log('Pine cone config');
  

  //langchain (chunking,embedding,database)
  await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  console.log("data stored");
  


}



indexdoc();
