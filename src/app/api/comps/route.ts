import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const identifier = searchParams.get("identifier");
  const type = searchParams.get("type");

  const db_string = fs.readFileSync("./data/db.json", "utf-8");

  const db = JSON.parse(db_string);

  const record = identifier && db[identifier];

  if (record) {
    if (type === "L") {
      return NextResponse.json({
        league: record.league,
        leaguemate: record.user.username,
        ...record.leaguemate,
      });
    } else if (type === "U") {
      return NextResponse.json({
        league: record.league,
        leaguemate: record.leaguemate.username,
        ...record.user,
      });
    }
  }

  return NextResponse.json({ error: "Record not found" });
}
