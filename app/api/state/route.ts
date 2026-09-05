import { NextRequest, NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getRawDb } from "@/db";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const row = await getRawDb()
      .prepare("SELECT state_json, updated_at FROM user_state WHERE user_id = ?")
      .bind(user.id)
      .first<{ state_json: string; updated_at: string }>();

    return NextResponse.json({
      state: row ? JSON.parse(row.state_json) : null,
      updatedAt: row?.updated_at ?? null,
      user: { id: user.id, email: user.email, displayName: user.displayName },
    });
  } catch {
    return NextResponse.json({ error: "Your training data could not be loaded." }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  try {
    const state = await request.json();
    const serialized = JSON.stringify(state);
    if (serialized.length > 900_000) {
      return NextResponse.json({ error: "Training data is too large. Export older history first." }, { status: 413 });
    }

    const now = new Date().toISOString();
    await getRawDb()
      .prepare(
        `INSERT INTO user_state (user_id, email, state_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           email = excluded.email,
           state_json = excluded.state_json,
           updated_at = excluded.updated_at`,
      )
      .bind(user.id, user.email, serialized, now, now)
      .run();

    return NextResponse.json({ saved: true, updatedAt: now });
  } catch {
    return NextResponse.json({ error: "Your training data could not be saved." }, { status: 503 });
  }
}

