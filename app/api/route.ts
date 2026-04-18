import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const PLANET_CATALOG = [
  "THE SUN - $999,999 - Massive ball of plasma. Too hot. Ultimate space heater.",
  "MERCURY - $4,500 - Closest to the sun. Cheap starter planet.",
  "VENUS - $8,200 - Beautiful but sulfuric acid atmosphere.",
  "EARTH - SOLD OUT - Overrated. Too many humans.",
  "MARS - $12,999 - Red, dusty, Elon approved. Great potential.",
  "JUPITER - $25,000 - Gas giant, no solid ground. Gas fees apply.",
  "SATURN - $32,000 - Most stylish. Has rings. Premium real estate.",
  "PLUTO - $999 - Small, cold, lonely. Perfect for introverts. On sale.",
  "BLACK HOLE - $99,999 - Infinite density. No refunds. Ever.",
].join("\n");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // AI Planet Concierge Chat
    if (action === "chat") {
      const { message, chatHistory } = body;

      const history = (chatHistory || [])
        .map((m: { role: string; text: string }) =>
          (m.role === "user" ? "Human" : "Agent") + ": " + m.text
        )
        .join("\n");

      const systemPrompt =
        'You are "VOID", the galaxy\'s most elite AI real estate agent for SpaceEstate.\n\n' +
        "Available planets:\n" +
        PLANET_CATALOG +
        "\n\n" +
        "Rules:\n" +
        "- Be enthusiastic about selling planets\n" +
        "- Witty, sarcastic, but genuinely helpful\n" +
        "- Give real recommendations based on user preferences\n" +
        "- Know all prices and can compare planets\n" +
        "- Keep responses SHORT: 2-4 sentences max\n" +
        "- If they ask about Earth, say it is sold out and suggest alternatives\n" +
        "- Use 1-2 emoji per message max\n" +
        "- Never break character\n\n" +
        "Conversation so far:\n" +
        history +
        "\n\nHuman: " +
        message +
        "\nAgent:";

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: systemPrompt,
      });

      return NextResponse.json({ reply: (result.text || "").trim() });
    }

    // Planet-specific quick insight
    if (action === "insight") {
      const { planetName, planetDescription } = body;

      const insightPrompt =
        "You are a sassy intergalactic real estate agent. " +
        'Generate one fun, witty "insider tip" (1-2 sentences) about this planet: ' +
        planetName +
        ". Description: " +
        planetDescription +
        ". Be creative and funny. No quotes around your response.";

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: insightPrompt,
      });

      return NextResponse.json({ insight: (result.text || "").trim() });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json(
      { error: "The Void is experiencing technical difficulties." },
      { status: 500 }
    );
  }
}
