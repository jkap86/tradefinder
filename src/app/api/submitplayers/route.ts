import { NextRequest, NextResponse } from "next/server";
import fs from "fs";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const { selectedPlayers, user_id, league_id, roster_id } = formData;

  const ktc_string = fs.readFileSync("./data/ktc.json", "utf-8");

  const ktc = JSON.parse(ktc_string);

  const comps: {
    player_id: string;
    player_id_value: number;
    player_id2: string;
    player_id2_value: number;
    winner: string;
    value_delta: number;
  }[] = [];

  const ktc_margin = 2500;

  selectedPlayers.forEach((player_id: string, i: number) => {
    selectedPlayers.forEach((player_id2: string, j: number) => {
      if (i < j) {
        const player_id_value = ktc[player_id] || 0;
        const player_id2_value = ktc[player_id2] || 0;

        comps.push({
          player_id,
          player_id_value,
          player_id2,
          player_id2_value,
          winner:
            player_id_value - ktc_margin > player_id2_value
              ? player_id
              : player_id2_value - ktc_margin > player_id_value
              ? player_id2
              : "",
          value_delta: Math.abs(player_id_value - player_id2_value),
        });
      }
    });
  });

  const db_string = fs.readFileSync("./data/db.json", "utf-8");

  const db = JSON.parse(db_string);

  const identifier = `${user_id}__${league_id}__${roster_id}`;

  fs.writeFileSync(
    "./data/db.json",
    JSON.stringify({
      ...db,
      [identifier]: {
        selectedPlayers,
        user: {
          comps,
        },
        leaguemate: {
          comps,
        },
      },
    })
  );

  return NextResponse.json(identifier);
}
