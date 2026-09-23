import "dotenv/config";
import readline from "node:readline/promises";
import {stdin as input , stdout as output} from "node:process";
import { createAgent } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { visitPage, webSearch } from "./tools/index.js";



const model = new ChatOpenAI({
  model: "openrouter/free",
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
});

const agent = createAgent({
  model:model,
  tools:[webSearch, visitPage],
  systemPrompt:"Youa re a helpful assistant. Answer clearly and keep replies short. you also have visit_page for urls , web_search for general search"
});

const rl = readline.createInterface({input , output});

console.log("Chat agent. type 'exit' to quit.\n");

while(true){
  const question = await rl.question("You: ");

  if(question.toLowerCase() === "exit") break;

  const result = await agent.stream(
    {messages:[{role:"human" , content:question}]},
    {streamMode:"messages"},
  );

  process.stdout.write("Agent: ");
  for await (const [token] of result) {
    if (token.type !== "ai" || typeof token.content !== "string") continue;
    process.stdout.write(token.content);
  }
  console.log("\n");
}

rl.close();