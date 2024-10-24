import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const identifier = searchParams.get("identifier");

  const db_string = fs.readFileSync("./data/db.json", "utf-8");

  const db = JSON.parse(db_string);

  const record = identifier && db[identifier];

  if (record) {
    return NextResponse.json(record);
  } else {
    return NextResponse.json({ error: "Record not found..." });
  }
}
