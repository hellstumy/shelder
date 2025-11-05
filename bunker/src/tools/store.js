import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set) => ({
      // --- Start Game State ---
      startState: "buttons",
      history: [],

      setInputState: () =>
        set((state) => ({
          history: [...state.history, state.startState],
          startState: "inputs",
        })),

      setButtonState: () =>
        set((state) => ({
          history: [...state.history, state.startState],
          startState: "buttons",
        })),

      setWaitingState: () =>
        set((state) => ({
          history: [...state.history, state.startState],
          startState: "waiting",
        })),

      // 🔙 Возврат к предыдущему состоянию
      goBack: () =>
        set((state) => {
          const prev = state.history[state.history.length - 1] || "buttons";
          return {
            startState: prev,
            history: state.history.slice(0, -1),
          };
        }),

      // --- Остальные состояния ---
      // Room Code
      roomCode: "",
      setRoomCode: (code) => set({ roomCode: code }),

  // Current player name (for voting)
  playerName: "",
  setPlayerName: (name) => set({ playerName: name }),

      // Start Room State
      startRoomState: true,
      setRoomState: () => set({ startRoomState: false }),

      // Window State
      windowState: "start",
      setWindowState: () => set({ windowState: "Game" }),
      backWindowState: () => set({ windowState: "Start" }),
      setRulesState: () => set({ windowState: "Rules" }),
    }),
    {
      name: "bunker-storage", // название хранилища в localStorage
      // ❌ без partialize — сохраняет всё состояние
    }
  )
);

export default useStore;
