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

    // Classified Planet Intelligence Dossier
    if (action === "audit") {
      const { planetName, details } = body;

      const auditPrompt =
        `You are Agent VOID-9, a classified Galactic Property Intelligence operative. Generate a secret dossier on this planet for a prospective buyer.\nPlanet: ${planetName}\nListing details: ${details}\n\nReturn ONLY valid JSON, no markdown, no code blocks:\n{\n  "caseId": "GPI-XXXXX (5 random digits)",\n  "clearanceLevel": "one of: CLASSIFIED / TOP SECRET / EYES ONLY / COSMIC CLEARANCE",\n  "sections": [\n    {"label": "STRUCTURAL CONDITION", "content": "1-2 sentence absurd but specific assessment", "flag": "OK|WARNING|DANGER"},\n    {"label": "OCCUPANCY STATUS", "content": "any alien tenants, squatters, or void entities", "flag": "OK|WARNING|DANGER|UNKNOWN"},\n    {"label": "HAZARD ASSESSMENT", "content": "cosmic dangers, hostile neighbors, environmental risks", "flag": "OK|WARNING|DANGER"},\n    {"label": "INVESTMENT OUTLOOK", "content": "absurd financial analysis with made-up galactic market data", "flag": "OK|WARNING|DANGER"}\n  ],\n  "verdict": "BUY|AVOID|PROCEED WITH CAUTION",\n  "verdictReason": "one punchy funny sentence",\n  "classified": "one genuinely surprising absurd secret about this planet that no listing mentions",\n  "agent": "a cool spy codename like 'Agent Null-7' or 'Operative Singularity'"\n}\n\nRules: be specific to this planet's real traits, mix genuine-sounding with absurd humor, classified should feel like a real secret`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: auditPrompt,
      });

      const raw = (result.text || "").trim().replace(/```json\n?|\n?```/g, "");
      try {
        const dossier = JSON.parse(raw);
        return NextResponse.json({ dossier });
      } catch {
        return NextResponse.json({ error: "Intelligence feed corrupted" }, { status: 500 });
      }
    }

    // Dispute dossier findings
    if (action === "appeal") {
      const { dossier, message } = body;

      const sectionSummary = (dossier.sections as { label: string; content: string; flag: string }[])
        .map((s) => `${s.label} [${s.flag}]: ${s.content}`)
        .join("\n");

      const appealPrompt =
        `You are Agent VOID-9, a Galactic Property Intelligence operative. A buyer is disputing your classified dossier findings.\nYour findings:\n${sectionSummary}\nVerdict: ${dossier.verdict} — ${dossier.verdictReason}\n\nBuyer says: "${message}"\n\nRespond in 2-3 sentences as a dry, slightly sinister intelligence operative. Either stand your ground with classified evidence they can't verify, or reluctantly revise one finding while adding a new suspicious detail. Stay in character. No bureaucracy — more spy thriller.`;

      const result = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: appealPrompt,
      });

      return NextResponse.json({ response: (result.text || "").trim() });
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
