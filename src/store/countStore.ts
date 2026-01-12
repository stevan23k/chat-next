import { create } from "zustand";

interface countState {
  count: number
  title: string
  increment: (value: number) => void
}

export const useCountStore = create<countState>((set, get) =>
({
  count: 10,
  title: "este es el titulo",
  increment: (value: number) => set(state => ({
    count: state.count + value
  }))
}))

