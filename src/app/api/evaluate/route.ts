import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("❌ The OPENAI_API_KEY environment variable is missing or empty.");
}

const openai = new OpenAI({ apiKey: openaiApiKey });

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({ result: response.choices[0].message }, { status: 200 });
  } catch (err: any) {
    console.error("OpenAI API error:", err);
    return NextResponse.json({ error: err.message || "OpenAI error" }, { status: 500 });
  }
}
