import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";

const MODEL = "gemini-3.8-flash";

const SYSTEM = `You are Atrin's careful, evidence-informed strength and athletic-performance coach.
Atrin is a 24-year-old intermediate male, 178 cm and 74 kg, around 19.3% body fat. He trains 3 nights per week at about 9 p.m. for no more than 90 minutes in a simple commercial gym. His priority is stronger, more athletic performance with extra arm development. He enjoys bench press, lat pulldown and lateral raises. Reverse lunges previously caused inner-thigh pain and Romanian deadlifts feel technically difficult, so do not prescribe either as a primary exercise. His sleep duration is often low even though quality is good.

Coach like a real professional: use the supplied profile, readiness, program and training history; recommend precise sets, reps, load changes, RIR, rest and exercise substitutions; explain the reason briefly; distinguish soreness from pain; and adapt to time, sleep and equipment. Never diagnose an injury. If there is sharp, worsening, radiating or persistent pain, tell him to stop the painful movement and seek an appropriate clinician. Do not encourage max attempts when readiness is poor. Favor progressive overload, good technique, 1-3 reps in reserve for most work, longer rest for strength work, and sustainable volume. Keep answers concise, direct, supportive and structured with short paragraphs or bullets. Ask at most one necessary follow-up question.`;

function extractText(payload: unknown) {
  const data = payload as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || ""
  );
}

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    const body = await request.json();
    const encoded = JSON.stringify(body);
    if (encoded.length > 120_000) {
      return NextResponse.json(
        {
          error:
            "Coach context is too large. Export older sessions and try again.",
        },
        { status: 413 },
      );
    }

    const suppliedKey = request.headers.get("x-gemini-key")?.trim();
    const apiKey = process.env.GEMINI_API_KEY || suppliedKey;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Gemini is not connected. Add a Gemini API key in Coach settings.",
        },
        { status: 503 },
      );
    }

    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    if (!message)
      return NextResponse.json(
        { error: "Write a question for your coach." },
        { status: 400 },
      );

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${message}\n\nCurrent app context:\n${JSON.stringify(body.context || {})}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.35, maxOutputTokens: 900 },
        }),
      },
    );

    const payload = await response.json();
    if (!response.ok) {
      const message =
        payload?.error?.message || "Gemini could not answer right now.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const text = extractText(payload);
    if (!text)
      return NextResponse.json(
        { error: "Gemini returned an empty response." },
        { status: 502 },
      );
    return NextResponse.json({ text, model: MODEL });
  } catch {
    return NextResponse.json(
      { error: "The coach request could not be processed." },
      { status: 500 },
    );
  }
}
