export type League = {
  league_id: string;
  avatar: string;
  name: string;
};

export type User = {
  user_id: string;
  username: string;
  avatar: string;
  leagues: League[];
};

export type Roster = {
  roster_id: number;
  owner_id: string;
  players: string[];
};

export type Leaguemate = {
  user_id: string;
  avatar: string;
  display_name: string;
};

export type LeagueDetail = {
  league_id: string;
  avatar: string;
  name: string;
  rosters: {
    roster_id: number;
    avatar: string;
    owner_id: string;
    username: string;
    players: string[];
  }[];
};
