import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { Roster, Leaguemate } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const league_id = searchParams.get("league_id");

  try {
    const [league, users, rosters] = await Promise.all([
      (await axios.get(`https://api.sleeper.app/v1/league/${league_id}`)).data,
      (
        await axios.get(`https://api.sleeper.app/v1/league/${league_id}/users`)
      ).data,
      (
        await axios.get(
          `https://api.sleeper.app/v1/league/${league_id}/rosters`
        )
      ).data,
    ]);

    return NextResponse.json({
      ...league,
      rosters: rosters.map((roster: Roster) => {
        const user: Leaguemate | undefined = users.find(
          (user: Leaguemate) => user.user_id === roster.owner_id
        );

        return {
          ...roster,
          username: user?.display_name || "Orphan",
          avatar: user?.avatar,
        };
      }),
    });
  } catch (err) {
    return NextResponse.json({ err });
  }
}
