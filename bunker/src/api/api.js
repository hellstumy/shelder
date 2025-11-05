import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL;

// === SOCKET ИНИЦИАЛИЗАЦИЯ ===
export const socket = io(API_URL, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// === REST API ===

// Создание комнаты
export async function createRoom() {
  const res = await fetch(`${API_URL}/create-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

// Присоединение к комнате
export async function joinRoom(roomCode, playerName) {
  const res = await fetch(`${API_URL}/join-room`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode, playerName }),
  });
  const data = await res.json();

  // Подключаемся к сокет-комнате после входа
  if (data.success) {
    socket.emit("joinRoom", roomCode);
  }

  return data;
}

// Получение списка игроков
export async function getRoomPlayers(roomCode) {
  const res = await fetch(`${API_URL}/room/${roomCode}`);
  return res.json();
}

// Получение состояния комнаты
export async function getRoomState(roomCode) {
  const res = await fetch(`${API_URL}/room-state/${roomCode}`);
  return res.json();
}

// Установка состояния комнаты
export async function setRoomState(roomCode, state) {
  const res = await fetch(`${API_URL}/room-state`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomCode, state }),
  });
  const data = await res.json();

  if (data.success) {
    socket.emit("stateUpdate", { roomCode, state });
  }

  return data;
}

// === SOCKET API ===

// Слушатели
export const onPlayerJoined = (cb) => socket.on("playerJoined", cb);
export const onStateUpdate = (cb) => socket.on("stateUpdate", cb);
export const onVoteUpdate = (cb) => socket.on("voteUpdate", cb);
export const onMessage = (cb) => socket.on("message", cb);
export const onPlayerEliminated = (cb) => socket.on("playerEliminated", cb);
export const onNewRound = (cb) => socket.on("newRound", cb);
export const onVoteResult = (cb) => socket.on("voteResult", cb);
export const onGameOver = (cb) => socket.on("gameOver", cb);
export const onAttributeRevealed = (cb) => socket.on("attributeRevealed", cb);

// Эмиттеры
export const sendMessage = (roomCode, name, text) => {
  socket.emit("message", { roomCode, name, text });
};

export const sendVote = (roomCode, name, target) => {
  socket.emit("vote", { roomCode, name, target });
};

export const sendReveal = (roomCode, requester, target, attribute) => {
  socket.emit("reveal", { roomCode, requester, target, attribute });
};

// Эмиттеры
export const emitStateUpdate = (roomCode, state) => {
  socket.emit("stateUpdate", { roomCode, state });
};

// Очистка слушателей
export const removeListeners = () => {
  socket.off("playerJoined");
  socket.off("stateUpdate");
  socket.off("voteUpdate");
  socket.off("playerEliminated");
  socket.off("newRound");
  socket.off("voteResult");
  socket.off("gameOver");
  socket.off("message");
  socket.off("attributeRevealed");
};
  