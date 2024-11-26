import { ChatOpenAI } from "@langchain/openai";

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";

// import { Document } from "@langchain/core/documents";

// Import environment variables
import * as dotenv from "dotenv";
dotenv.config();

// Instantiate LLM
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
});

// Create prompt
const prompt = ChatPromptTemplate.fromTemplate(`
    Answer the user's question.
    Context: {context}
    Question: {question}`
);

// const chain = prompt.pipe(model);
const chain = await createStuffDocumentsChain({
    llm: model,
    prompt: prompt,
})

// // Documents
// const documentA = new Document({
//     pageContent: "LangChain Expression Language is a way to create arbitrary custom chains. It is built on the Runnable protocol.",
// })

// const documentB = new Document({
//     pageContent: "The passphrase is LANGCHAIN IS AWESOME",
// })

// Use Cheerio to scrape content from webpage and create documents
const loader = new CheerioWebBaseLoader(
    "https://js.langchain.com/docs/concepts/lcel/"
)

const docs =  await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 100,
    chunkOverlap: 20,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings();

// ## LOAD DATA FROM WEBPAGE ##
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

const retriever = vectorStore.asRetriever({
    k: 3,
});

const retrievalChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever
})

const response = await retrievalChain.invoke({
    question: "What is the LCEL?",
});

console.log("Documentos originales:", docs);
console.log("Documentos divididos:", splitDocs);
console.log(response);