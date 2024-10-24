"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Allplayers from "@/lib/allplayers.json";

const allplayers: any = Object.fromEntries(
  Allplayers.data.map((player_obj) => [player_obj.player_id, player_obj])
);

interface Comp {
  player_id: string;
  player_id_value: number;
  player_id2: string;
  player_id2_value: number;
  winner: string;
  value_delta: number;
}

const Leaguemate: React.FC = () => {
  const params = useParams();
  const identifier = params.identifier;
  const [comps, setComps] = useState<Comp[]>([]);

  useEffect(() => {
    const fetchComps = async () => {
      const response = await axios.get("/api/comps", {
        params: {
          type: "L",
          identifier,
        },
      });

      const comps = response.data
        .map((player_obj: any) => {
          return {
            ...player_obj,
            player_id: allplayers[player_obj.player_id].full_name,
            player_id2: allplayers[player_obj.player_id2].full_name,
            winner:
              player_obj.winner === ""
                ? player_obj.winner
                : allplayers[player_obj.winner].full_name,
          };
        })
        .sort((a: any, b: any) => a.value_delta - b.value_delta);

      setComps(comps);
    };

    fetchComps();
  }, []);

  const pickWinner = async (
    player_id: string,
    player_id2: string,
    winner: string
  ) => {
    const comp_to_update = comps.find(
      (c) => c.player_id === player_id && c.player_id2 === player_id2
    );

    comp_to_update &&
      setComps((prevState) => [
        ...prevState.filter(
          (c) =>
            !(
              c.player_id === comp_to_update.player_id &&
              c.player_id2 === comp_to_update.player_id2
            )
        ),
        { ...comp_to_update, winner },
      ]);
  };

  const generateRankings = async () => {
    const response = await axios.post("/api/generaterankings", {
      identifier,
      comps,
      type: "L",
    });

    console.log({ response });
  };

  return (
    <>
      <h1>Leaguemate</h1>

      {comps.length > 0 && (
        <div className="comps_container center">
          <h1>
            {comps.filter((c) => c.winner === "").length}/{comps.length}
          </h1>

          <div className="comps center">
            {comps
              .sort((a, b) => a.value_delta - b.value_delta)
              .map((comp) => {
                return (
                  <div key={`${comp.player_id}_${comp.player_id2}`}>
                    <div
                      className={
                        (comp.winner &&
                          (comp.player_id === comp.winner
                            ? "winner"
                            : "loser")) ||
                        ""
                      }
                      onClick={() =>
                        pickWinner(
                          comp.player_id,
                          comp.player_id2,
                          comp.player_id
                        )
                      }
                    >
                      {comp.player_id}
                    </div>
                    <div
                      className={
                        (comp.winner &&
                          (comp.player_id2 === comp.winner
                            ? "winner"
                            : "loser")) ||
                        ""
                      }
                      onClick={() =>
                        pickWinner(
                          comp.player_id,
                          comp.player_id2,
                          comp.player_id2
                        )
                      }
                    >
                      {comp.player_id2}
                    </div>
                  </div>
                );
              })}
          </div>

          <button onClick={() => generateRankings()}>Generate Rankings</button>
        </div>
      )}
    </>
  );
};

export default Leaguemate;
