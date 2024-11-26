import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser, CommaSeparatedListOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";

import * as dotenv from "dotenv";
dotenv.config();

//Create model
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,

});

async function callStringOutputParser() {
    // Create Prompt Template
    // const prompt = ChatPromptTemplate.fromTemplate("You are a comedian. Tell a joke about the following word: {input}");
    const prompt = ChatPromptTemplate.fromMessages([
        "system", "Generate a joke based on a word provided by the user",
        "human", "{input}"
    ]);

    // Create output parser
    const outputParser = new StringOutputParser();

    // Create chain
    const chain = prompt.pipe(model).pipe(outputParser);

    // Call chain
    return await chain.invoke({
        input: "dog"
    })

}

async function callListOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(
        "Provide 5 synonyms, separated by commas, for the following word {word}"
    )

    const outputParser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    return await chain.invoke({
        word: "happy"
    })
}

// Structured output Parser
async function callStructuredOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase. 
        Formatting Instructions: {format_instructions} 
        Phrase: {phrase}`
    )

    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "Name of the person",
        age: "Age of the person",
    })

    const chain = prompt.pipe(model).pipe(outputParser);

    return await chain.invoke({
        phrase: "Kevin is 24 years old",
        format_instructions: outputParser.getFormatInstructions(),
    })
}

async function callZodOutputParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase. 
        Formatting Instructions: {format_instructions} 
        Phrase: {phrase}`
    )
    const outputParser = StructuredOutputParser.fromZodSchema(
        z.object({
            recipe: z.string().describe("name of recipe"),
            ingredients: z.array(z.string()).describe("ingredients"),
        })
    )

    const chain = prompt.pipe(model).pipe(outputParser);

    return await chain.invoke({
        phrase: "The ingredients for a Spaghetti Bolognese recipe are tomatoes, minced beef, garlic, wine and herbs",
        format_instructions: outputParser.getFormatInstructions(),
    })
}

// const response = await callStringOutputParser();
// const response = await callListOutputParser();
// const response = await callStructuredOutputParser();
const response = await callZodOutputParser();
console.log(response);

