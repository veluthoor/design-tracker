import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

const DEFAULT_MEMBERS = ["Kunal Verma", "Akash Roy"];

async function ensureMembers(db: Awaited<ReturnType<typeof getDb>>) {
  const count = await db.collection("members").countDocuments();
  if (count === 0) {
    await db.collection("members").insertMany(
      DEFAULT_MEMBERS.map(name => ({ name, createdAt: new Date().toISOString() }))
    );
  }
}

export async function GET() {
  try {
    const db = await getDb();
    await ensureMembers(db);
    const members = await db.collection("members").find({}).sort({ name: 1 }).toArray();
    return NextResponse.json(members.map(m => m.name));
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const db = await getDb();
    const existing = await db.collection("members").findOne({ name: name.trim() });
    if (existing) {
      return NextResponse.json({ error: "Member already exists" }, { status: 409 });
    }
    await db.collection("members").insertOne({
      name: name.trim(),
      createdAt: new Date().toISOString(),
    });
    return NextResponse.json({ name: name.trim() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
