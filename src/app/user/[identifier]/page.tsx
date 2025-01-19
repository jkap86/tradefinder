"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Allplayers from "@/lib/allplayers.json";

const allplayers: { [key: string]: { [key: string]: string } } =
  Object.fromEntries(
    Allplayers.data.map((player_obj: { [key: string]: string }) => [
      player_obj.player_id,
      player_obj,
    ])
  );

interface Comp {
  player_id: string;
  player_id_value: number;
  player_id2: string;
  player_id2_value: number;
  winner: string;
  value_delta: number;
}

const User: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const identifier = params.identifier;
  const [comps, setComps] = useState<Comp[]>([]);
  const [username, setUsername] = useState("");
  const [league, setLeague] = useState("");
  const [leaguemate, setLeaguemate] = useState("");

  useEffect(() => {
    const fetchComps = async () => {
      const response = await axios.get("/api/comps", {
        params: {
          type: "U",
          identifier,
        },
      });

      const comps = response.data.comps.sort(
        (a: { [key: string]: number }, b: { [key: string]: number }) =>
          a.value_delta - b.value_delta
      );

      setUsername(response.data.username);
      setLeague(response.data.league);
      setLeaguemate(response.data.leaguemate);
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

    if (comp_to_update) {
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
    }
  };

  const generateRankings = async () => {
    await axios.post("/api/generaterankings", {
      identifier,
      comps,
      type: "U",
    });

    router.push(`/summary/${identifier}`);
  };

  return (
    <>
      {/* <h1>
        LEAGUEMATE LINK:
        <Link href={`/leaguemate/${params.identifier}`}>
          {window.location.href.replace("user", "leaguemate")}
        </Link>
        <br />
        VIEW SUMMARY:
        <Link href={`/summary/${params.identifier}`}>
          {window.location.href.replace("user", "sumary")}
        </Link>
      </h1>
      <br />
      <h1>User</h1>
*/}
      <h1>{username}</h1>

      <h3>
        {league} - {leaguemate}
      </h3>

      {comps.length > 0 && (
        <div className="comps_container center">
          <h3>
            For each pair, select which player you prefer in this league. For
            pairs where the KeepTradeCut Value gap is greater than 2000, the
            player with the higher value has been selected, but you are able to
            modify.
          </h3>
          <h3>
            {comps.filter((c) => c.winner === "").length}/{comps.length}{" "}
            Selections
          </h3>

          <div className="comps center">
            {comps
              .sort(
                (a, b) =>
                  (b.winner === "" ? 1 : 0) - (a.winner === "" ? 1 : 0) ||
                  a.value_delta - b.value_delta
              )
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
                      {allplayers[comp.player_id]?.full_name || comp.player_id}
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
                      {allplayers[comp.player_id2]?.full_name ||
                        comp.player_id2}
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

export default User;
