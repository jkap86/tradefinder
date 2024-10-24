"use client";

import axios from "axios";
import Allplayers from "@/lib/allplayers.json";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [summary, setSummary] = useState<any>({});
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
  }, []);

  return (
    <>
      <h1>Summary</h1>
      <table className="summary">
        <thead>
          <tr>
            <th>Player</th>
            <th onClick={() => setSortby("U")}>User Rank</th>
            <th onClick={() => setSortby("U")}>User Score</th>
            <th onClick={() => setSortby("L")}>Lm Rank</th>
            <th onClick={() => setSortby("L")}>Lm Score</th>
          </tr>
        </thead>
        <tbody>
          {(summary.selectedPlayers || [])
            .map((player_id: string, index: number) => {
              const player_name = allplayers[player_id].full_name || player_id;
              const user_ranking = summary.user.rankings.find(
                (r: any) => r.player === player_name
              );
              const lm_ranking = summary.leaguemate.rankings.find(
                (r: any) => r.player === player_name
              );
              return {
                sort: sortby === "L" ? lm_ranking.score : user_ranking.score,
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
            .sort(
              (a: { [key: string]: number }, b: { [key: string]: number }) =>
                b.sort - a.sort
            )
            .map((row: any) => row.row)}
        </tbody>
      </table>
    </>
  );
};

export default Summary;
