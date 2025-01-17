import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const { identifier, comps, type } = formData;

  const players: { [player_id: string]: { wins: number; losses: number } } = {};

  comps.forEach(
    ({
      player_id,
      player_id2,
      winner,
    }: {
      player_id: string;
      player_id2: string;
      winner: string;
    }) => {
      if (!players[player_id]) players[player_id] = { wins: 0, losses: 0 };
      if (!players[player_id2]) players[player_id2] = { wins: 0, losses: 0 };

      if (winner === player_id) {
        players[player_id].wins += 1;
        players[player_id2].losses += 1;
      } else {
        players[player_id2].wins += 1;
        players[player_id].losses += 1;
      }
    }
  );

  const rankings = Object.keys(players)
    .sort(
      (a, b) =>
        players[b].wins - players[a].wins ||
        players[a].losses - players[b].losses
    )
    .map((player, index) => ({
      player,
      rank: index + 1,
      score: Math.round(
        (players[player].wins /
          (players[player].wins + players[player].losses)) *
          100
      ),
      wins: players[player].wins,
      losses: players[player].losses,
    }));

  const db_string = fs.readFileSync("./data/db.json", "utf-8");

  const db = JSON.parse(db_string);

  const record = identifier && db[identifier];

  let updated_record;

  if (type === "L") {
    updated_record = {
      ...record,
      leaguemate: {
        ...record.leaguemate,
        comps,
        rankings,
      },
    };
  } else if (type === "U") {
    updated_record = {
      ...record,
      user: {
        ...record.user,
        comps,
        rankings,
      },
    };
  }

  fs.writeFileSync(
    "./data/db.json",
    JSON.stringify({
      ...db,
      [identifier]: updated_record,
    })
  );

  return NextResponse.json("Success");
}
