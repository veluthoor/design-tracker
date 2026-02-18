import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const db = await getDb();
    const tasks = await db
      .collection("tasks")
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();
    const now = new Date().toISOString();
    const task = {
      ...body,
      createdAt: now,
      updatedAt: now,
    };
    const result = await db.collection("tasks").insertOne(task);
    return NextResponse.json({ ...task, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
