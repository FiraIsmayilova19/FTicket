import create from "zustand";

export const useCart = create((set, get) => ({
  items: [], // {eventId, seatId, price}
  add: (item) => set(state => ({ items: [...state.items, item] })),
  remove: (seatId) => set(state => ({ items: state.items.filter(i => i.seatId !== seatId) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((s, i) => s + (i.price || 0), 0),
}));
