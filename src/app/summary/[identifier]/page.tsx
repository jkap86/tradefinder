"use client";

import axios from "axios";
import Allplayers from "@/lib/allplayers.json";
import { useParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";

interface summary {
  league: string;
  selectedPlayers: string[];
  user: {
    username: string;
    rankings: { [key: string]: string | number }[];
  };
  leaguemate: {
    username: string;
    rankings: { [key: string]: string | number }[];
  };
}
const allplayers: { [key: string]: { [key: string]: string } } =
  Object.fromEntries(
    Allplayers.data.map((player_obj: { [key: string]: string }) => [
      player_obj.player_id,
      player_obj,
    ])
  );

const Summary: React.FC = () => {
  const params = useParams();
  const identifier = params.identifier;
  const [summary, setSummary] = useState<summary>({
    league: "",
    selectedPlayers: [],
    user: { username: "", rankings: [] },
    leaguemate: { username: "", rankings: [] },
  });
  const [sortby, setSortby] = useState("L");

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await axios.get("/api/summary", {
        params: {
          identifier,
        },
      });

      setSummary(response.data);
    };
    fetchSummary();
  }, [identifier]);

  console.log({ summary });

  return (
    <>
      <h1>Summary</h1>
      <div className="flex column">
        {summary.user.username} Selections
        <Link href={`/user/${params.identifier}`}>
          {window.location.href.replace("summary", "user")}
        </Link>
        <br />
        <br />
        {summary.leaguemate.username} Selections
        <Link href={`/leaguemate/${params.identifier}`}>
          {window.location.href.replace("summary", "leaguemate")}
        </Link>
      </div>
      <table className="summary">
        <thead>
          <tr>
            <th rowSpan={2}>Player</th>
            <th colSpan={2}>{summary.user.username}</th>
            <th colSpan={2}>{summary.leaguemate.username}</th>
          </tr>
          <tr>
            <th onClick={() => setSortby("U")}>Rank</th>
            <th onClick={() => setSortby("U")}>Score</th>
            <th onClick={() => setSortby("L")}>Rank</th>
            <th onClick={() => setSortby("L")}>Score</th>
          </tr>
        </thead>
        <tbody>
          {(summary.selectedPlayers || [])
            .map((player_id: string, index: number) => {
              const player_name = allplayers[player_id].full_name || player_id;
              const user_ranking = summary.user.rankings.find(
                (r: { [key: string]: string | number }) =>
                  r.player === player_id
              );
              const lm_ranking = summary.leaguemate.rankings?.find(
                (r: { [key: string]: string | number }) =>
                  r.player === player_id
              );
              return {
                sort:
                  sortby === "L"
                    ? lm_ranking?.score || 0
                    : user_ranking?.score || 0,
                row: (
                  <tr key={`${player_id}_${index}`}>
                    <td>{player_name}</td>
                    <td>{user_ranking?.rank?.toString() || "-"}</td>
                    <td>{user_ranking?.score?.toString() || "-"}</td>
                    <td>{lm_ranking?.rank?.toString() || "-"}</td>
                    <td>{lm_ranking?.score?.toString() || "-"}</td>
                  </tr>
                ),
              };
            })
            .sort((a, b) => (b.sort > a.sort ? 1 : -1))
            .map((row: { row: ReactNode }) => row.row)}
        </tbody>
      </table>
    </>
  );
};

export default Summary;
