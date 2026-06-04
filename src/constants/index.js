import { Star, Brain, Shield, Code } from "lucide-react";

export const TIMEFRAMES = [
  { key: "live", label: "Live Score" },
  { key: "w2", label: "2 Weeks" },
  { key: "mo", label: "Monthly" },
];

export const CATS = [
  { key: "All", label: "Overall", Icon: Star },
  { key: "AI", label: "AI", Icon: Brain },
  { key: "Cy", label: "Cybersecurity", Icon: Shield },
  { key: "Wb", label: "Web Dev", Icon: Code },
];

export const PODIUM_HEIGHTS = [180, 240, 140];
export const PODIUM_RANKS = [2, 1, 3];
export const RANK_COLORS = ["#C0C0C0", "#FAA41A", "#CD7F32"];
export const ANIM_CLASSES = ["podium-col-l", "podium-col-c", "podium-col-r"];
