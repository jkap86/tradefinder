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
  const [selectedLeaguemate, setSelectedLeaguemate] = useState<{
    user_id: string;
    username: string;
    avatar: string;
    roster_id: number;
  }>({
    user_id: "",
    username: "",
    avatar: "",
    roster_id: 0,
  });
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
      username: userLeagues.username,
      league_id: leagueDetail.league_id,
      league_name: leagueDetail.name,
      lm_user_id: selectedLeaguemate.user_id,
      lm_username: selectedLeaguemate.username,
    });

    router.push(`/user/${response.data}`);
  };

  useEffect(() => {
    setSelectedPlayers([]);
  }, [selectedLeaguemate]);

  const userRoster = leagueDetail.rosters.find(
    (roster) => roster.user_id === userLeagues.user_id
  );

  const lmRoster = leagueDetail.rosters.find(
    (roster) => roster.roster_id === selectedLeaguemate.roster_id
  );

  const selectLeaguemate = (roster_id: number) => {
    const lmRoster = leagueDetail.rosters.find(
      (r) => r.roster_id === roster_id
    );

    if (lmRoster) {
      setSelectedLeaguemate({
        user_id: lmRoster.user_id,
        username: lmRoster.username,
        avatar: lmRoster.avatar,
        roster_id: roster_id,
      });
    }
  };

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
            value={selectedLeaguemate.roster_id}
            onChange={(e) => selectLeaguemate(parseInt(e.target.value))}
          >
            <option value="" hidden>
              Select Leaguemate
            </option>
            {leagueDetail.rosters
              .filter((roster) => roster.user_id !== userLeagues.user_id)
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

      {selectedLeaguemate.roster_id > 0 && (
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
                {(userRoster?.players || [])
                  .sort((a, b) => {
                    const getPositionValue = (player_id: string) => {
                      const position =
                        allplayers && allplayers[player_id]?.position;

                      switch (position) {
                        case "QB":
                          return 1;
                        case "RB":
                          return 2;
                        case "FB":
                          return 2;
                        case "WR":
                          return 3;
                        case "TE":
                          return 4;
                        default:
                          return 5;
                      }
                    };

                    return getPositionValue(a) - getPositionValue(b);
                  })
                  .map((player_id) => {
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
                {(userRoster?.draftpicks || [])
                  .sort(
                    (a, b) =>
                      a.season - b.season ||
                      a.round - b.round ||
                      (a.order || 0) - (b.order || 0)
                  )
                  .map((pick) => {
                    const pick_name = pick.order
                      ? `${pick.season} ${
                          pick.round
                        }.${pick.order.toLocaleString("en-US", {
                          minimumIntegerDigits: 2,
                        })}`
                      : `${pick.season} Round ${pick.round} ${`(${
                          pick.original_user.username +
                          (pick.original_user.username === "Orphan"
                            ? `_${pick.roster_id}`
                            : "")
                        })`}`;
                    return (
                      <tr
                        key={`${pick.season}_${pick.round}_${pick.roster_id}`}
                      >
                        <td>
                          {pick_name.replace(`(${userRoster?.username})`, "")}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            disabled={
                              !selectedPlayers.includes(pick_name) &&
                              selectedPlayers.length === 10
                            }
                            checked={selectedPlayers.includes(pick_name)}
                            onChange={(e) =>
                              modifySelectedPlayers(pick_name, e.target.checked)
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
                {(lmRoster?.draftpicks || [])
                  .sort(
                    (a, b) =>
                      a.season - b.season ||
                      a.round - b.round ||
                      (a.order || 0) - (b.order || 0)
                  )
                  .map((pick) => {
                    const pick_name = pick.order
                      ? `${pick.season} ${
                          pick.round
                        }.${pick.order.toLocaleString("en-US", {
                          minimumIntegerDigits: 2,
                        })}`
                      : `${pick.season} Round ${pick.round} ${`(${
                          pick.original_user.username +
                          (pick.original_user.username === "Orphan"
                            ? `_${pick.roster_id}`
                            : "")
                        })`}`;
                    return (
                      <tr
                        key={`${pick.season}_${pick.round}_${pick.roster_id}`}
                      >
                        <td>
                          {pick_name.replace(`(${lmRoster?.username})`, "")}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            disabled={
                              !selectedPlayers.includes(pick_name) &&
                              selectedPlayers.length === 10
                            }
                            checked={selectedPlayers.includes(pick_name)}
                            onChange={(e) =>
                              modifySelectedPlayers(pick_name, e.target.checked)
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
