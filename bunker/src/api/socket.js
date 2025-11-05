    import { io } from "socket.io-client";

// Адрес бэкенда
export const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});
