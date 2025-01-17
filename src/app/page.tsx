"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { League, LeagueDetail, User } from "@/lib/types";
import Allplayers from "@/lib/allplayers.json";
import { useRouter } from "next/navigation";

const allplayers: { [key: string]: { [key: string]: string } } =
  Object.fromEntries(
    Allplayers.data.map((player_obj: { [key: string]: string }) => [
      player_obj.player_id,
      player_obj,
    ])
  );

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [userLeagues, setUserLeagues] = useState<User>({
    user_id: "",
    username: "",
    avatar: "",
    leagues: [],
  });
  const [leagueDetail, setLeagueDetail] = useState<LeagueDetail>({
    league_id: "",
    avatar: "",
    name: "",
    rosters: [],
  });
  const [selectedRosterId, setSelectedRosterId] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const fetchUserLeagues = async () => {
    const response = await axios.get("/api/user", {
      params: {
        username,
      },
    });

    setUserLeagues(response.data);
  };

  const fetchLeagueDetail = async (league_id: string) => {
    setSelectedRosterId(0);
    const response = await axios.get("/api/league", {
      params: {
        league_id,
      },
    });

    setLeagueDetail(response.data);
  };

  const modifySelectedPlayers = (player_id: string, checked: boolean) => {
    if (checked) {
      setSelectedPlayers((prevState) => [...prevState, player_id]);
    } else {
      setSelectedPlayers((prevState) =>
        prevState.filter((x) => x !== player_id)
      );
    }
  };

  const submitPlayers = async () => {
    const response = await axios.post("/api/submitplayers", {
      selectedPlayers,
      user_id: userLeagues.user_id,
      league_id: leagueDetail.league_id,
      roster_id: selectedRosterId,
    });

    router.push(`/user/${response.data}`);
  };

  useEffect(() => {
    setSelectedPlayers([]);
  }, [selectedRosterId]);

  const userRoster = leagueDetail.rosters.find(
    (roster) => roster.owner_id === userLeagues.user_id
  );

  const lmRoster = leagueDetail.rosters.find(
    (roster) => roster.roster_id === selectedRosterId
  );

  return (
    <div className="center">
      <h1>Trade Helper</h1>

      <div className="flex column">
        <label>Enter Your Sleeper Username</label>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => fetchUserLeagues()}>Submit</button>
      </div>

      {userLeagues.user_id && (
        <div className="flex column">
          <label>Select League to find trades in</label>
          <select onChange={(e) => fetchLeagueDetail(e.target.value)}>
            <option value="" hidden>
              Select League
            </option>
            {userLeagues.leagues.map((league: League) => {
              return (
                <option key={league.league_id} value={league.league_id}>
                  {league.name}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {leagueDetail.league_id && (
        <div className="flex column">
          <label>Select a Leaguemate to trade with</label>
          <select
            value={selectedRosterId}
            onChange={(e) => setSelectedRosterId(parseInt(e.target.value))}
          >
            <option value="" hidden>
              Select Leaguemate
            </option>
            {leagueDetail.rosters
              .filter((roster) => roster.owner_id !== userLeagues.user_id)
              .map((roster) => {
                return (
                  <option key={roster.roster_id} value={roster.roster_id}>
                    {roster.username}
                  </option>
                );
              })}
          </select>
        </div>
      )}

      {selectedRosterId > 0 && (
        <div className="rosters_container">
          <label>
            Select 10 Players that you are interested in trading for/away
          </label>
          <br />
          <br />
          <em>{selectedPlayers.length} selected</em>
          <br /> <br />
          <div className="rosters">
            <table className="inline players">
              <tbody>
                {(userRoster?.players || []).map((player_id) => {
                  return (
                    <tr key={player_id}>
                      <td>{allplayers[player_id]?.full_name || player_id}</td>
                      <td>
                        <input
                          type="checkbox"
                          disabled={
                            !selectedPlayers.includes(player_id) &&
                            selectedPlayers.length === 10
                          }
                          checked={selectedPlayers.includes(player_id)}
                          onChange={(e) =>
                            modifySelectedPlayers(player_id, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <table className="inline players">
              <tbody>
                {(lmRoster?.players || []).map((player_id) => {
                  return (
                    <tr key={player_id}>
                      <td>{allplayers[player_id]?.full_name || player_id}</td>
                      <td>
                        <input
                          type="checkbox"
                          disabled={
                            !selectedPlayers.includes(player_id) &&
                            selectedPlayers.length === 10
                          }
                          checked={selectedPlayers.includes(player_id)}
                          onChange={(e) =>
                            modifySelectedPlayers(player_id, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => {
              if (selectedPlayers.length === 10) {
                submitPlayers();
              } else {
                alert(`Select ${10 - selectedPlayers.length} more players`);
              }
            }}
          >
            Submit Players
          </button>
        </div>
      )}
    </div>
  );
}
