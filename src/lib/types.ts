export type Heat = {
  id: number;
  heat_order: number;
  round_name: string;
  heat_label: string;
  lane1_team: string | null;
  lane2_team: string | null;
  lane3_team: string | null;
  lane4_team: string | null;
  lane5_team: string | null;
  lane6_team: string | null;
  lane1_time: number | null;
  lane2_time: number | null;
  lane3_time: number | null;
  lane4_time: number | null;
  lane5_time: number | null;
  lane6_time: number | null;
  is_finished: boolean;
  updated_at: string;
};

export type Group = {
  id: number;
  name: string;
  score: number;
  updated_at: string;
};

export type MissionState = {
  id: number;
  is_locked: boolean;
  message: string | null;
  updated_at: string;
};

export type PingPong = {
  id: number;
  name: string;
  qualifying_score: number | null;
  final_rank: number | null;
  updated_at: string;
};
