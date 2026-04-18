import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const MODEL = "gemini-2.0-flash-lite";

const PLANET_CATALOG = [
  "THE SUN - ◎1.001 SOL - Massive ball of plasma. Too hot. Ultimate space heater.",
  "MERCURY - ◎0.0045 SOL - Closest to the sun. Cheap starter planet.",
  "VENUS - ◎0.0082 SOL - Beautiful but sulfuric acid atmosphere.",
  "EARTH - SOLD OUT - Overrated. Too many humans.",
  "MARS - ◎0.013 SOL - Red, dusty, Elon approved. Great potential.",
  "JUPITER - ◎0.025 SOL - Gas giant, no solid ground. Gas fees apply.",
  "SATURN - ◎0.032 SOL - Most stylish. Has rings. Premium real estate.",
  "PLUTO - ◎0.001 SOL - Small, cold, lonely. Perfect for introverts. On sale.",
  "BLACK HOLE - ◎0.1 SOL - Infinite density. No refunds. Ever.",
].join("\n");

async function complete(prompt: string): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
  });
  return (res.choices[0]?.message?.content || "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "chat") {
      const { message, chatHistory } = body;

      const history = (chatHistory || [])
        .map((m: { role: string; text: string }) =>
          (m.role === "user" ? "Human" : "Agent") + ": " + m.text
        )
        .join("\n");

      const prompt =
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

      return NextResponse.json({ reply: await complete(prompt) });
    }

    if (action === "insight") {
      const { planetName, planetDescription } = body;

      const prompt =
        "You are a sassy intergalactic real estate agent. " +
        'Generate one fun, witty "insider tip" (1-2 sentences) about this planet: ' +
        planetName +
        ". Description: " +
        planetDescription +
        ". Be creative and funny. No quotes around your response.";

      return NextResponse.json({ insight: await complete(prompt) });
    }

    if (action === "audit") {
      const { planetName, details } = body;

      const prompt =
        `You are Agent VOID-9, a classified Galactic Property Intelligence operative. Generate a secret dossier on this planet for a prospective buyer.\nPlanet: ${planetName}\nListing details: ${details}\n\nReturn ONLY valid JSON, no markdown, no code blocks:\n{\n  "caseId": "GPI-XXXXX (5 random digits)",\n  "clearanceLevel": "one of: CLASSIFIED / TOP SECRET / EYES ONLY / COSMIC CLEARANCE",\n  "sections": [\n    {"label": "STRUCTURAL CONDITION", "content": "1-2 sentence absurd but specific assessment", "flag": "OK|WARNING|DANGER"},\n    {"label": "OCCUPANCY STATUS", "content": "any alien tenants, squatters, or void entities", "flag": "OK|WARNING|DANGER|UNKNOWN"},\n    {"label": "HAZARD ASSESSMENT", "content": "cosmic dangers, hostile neighbors, environmental risks", "flag": "OK|WARNING|DANGER"},\n    {"label": "INVESTMENT OUTLOOK", "content": "absurd financial analysis with made-up galactic market data", "flag": "OK|WARNING|DANGER"}\n  ],\n  "verdict": "BUY|AVOID|PROCEED WITH CAUTION",\n  "verdictReason": "one punchy funny sentence",\n  "classified": "one genuinely surprising absurd secret about this planet that no listing mentions",\n  "agent": "a cool spy codename like 'Agent Null-7' or 'Operative Singularity'"\n}\n\nRules: be specific to this planet's real traits, mix genuine-sounding with absurd humor, classified should feel like a real secret`;

      const raw = (await complete(prompt)).replace(/```json\n?|\n?```/g, "");
      try {
        const dossier = JSON.parse(raw);
        return NextResponse.json({ dossier });
      } catch {
        return NextResponse.json({ error: "Intelligence feed corrupted" }, { status: 500 });
      }
    }

    if (action === "appeal") {
      const { dossier, message } = body;

      const sectionSummary = (dossier.sections as { label: string; content: string; flag: string }[])
        .map((s) => `${s.label} [${s.flag}]: ${s.content}`)
        .join("\n");

      const prompt =
        `You are Agent VOID-9, a Galactic Property Intelligence operative. A buyer is disputing your classified dossier findings.\nYour findings:\n${sectionSummary}\nVerdict: ${dossier.verdict} — ${dossier.verdictReason}\n\nBuyer says: "${message}"\n\nRespond in 2-3 sentences as a dry, slightly sinister intelligence operative. Either stand your ground with classified evidence they can't verify, or reluctantly revise one finding while adding a new suspicious detail. Stay in character. No bureaucracy — more spy thriller.`;

      return NextResponse.json({ response: await complete(prompt) });
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
