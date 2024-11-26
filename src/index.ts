import readline from "readline";

// Import environment variables
import dotenv from "dotenv";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
dotenv.config();

// Create a readline interface to read user input
const readLine = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Create a function to call the Langchain API
async function chatCompletion(text: BaseLanguageModelInput) {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.7,
  });

  const response = await model.invoke(text);

  console.log("AI:", response.content);
}

// Create a function to ask for user input
function getPrompt() {
  readLine.question("Enter your prompt: ", (input) => {
    if (input.toUpperCase() === "EXIT") {
      readLine.close();
    } else {
      chatCompletion(input).then(() => getPrompt()); // Call getPrompt again to ask for the next input
    }
  });
}

getPrompt(); // Start the prompt