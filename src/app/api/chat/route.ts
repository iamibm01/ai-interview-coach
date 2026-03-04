import { streamText, convertToModelMessages } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req: Request) {
  const { messages, interviewType } = await req.json();

  const systemPrompt = `You are an expert technical interviewer conducting a ${interviewType} developer interview.

<rules>
- Ask ONE interview question at a time
- After the candidate answers, give structured feedback in this exact format:

✅ WHAT WAS GOOD:
[what they got right]

❌ WHAT WAS MISSING:
[important points they missed]

💡 MODEL ANSWER:
[a strong complete answer]

- Then ask the next question
- Questions should progress from easier to harder
- After 5 questions, give an overall session summary with a score out of 10
</rules>`;

 const result = streamText({
  model: openrouter("openai/gpt-4o"),
  system: systemPrompt,
  messages: await convertToModelMessages(messages),
  maxOutputTokens: 1000,
});

  return result.toUIMessageStreamResponse();
}