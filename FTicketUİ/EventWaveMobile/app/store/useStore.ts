import { create } from "zustand";

interface SeatState {
  shape: "circle" | "square" | "rectangle" | "triangle" | null;
  count: number;
  setShape: (shape: SeatState["shape"]) => void;
  setCount: (count: number) => void;
}

export const useSeatStore = create<SeatState>((set) => ({
  shape: null,
  count: 0,
  setShape: (shape) => set({ shape }),
  setCount: (count) => set({ count }),
}));
