import { socket } from "./socket";

// === ЭМИТЫ ===

// Присоединиться к комнате
export const joinRoom = (roomId, username) => {
  socket.emit("joinRoom", { roomId, username });
};

// Отправить сообщение в чат
export const sendMessage = (roomId, username, message) => {
  socket.emit("sendMessage", { roomId, username, message });
};

// Начать игру
export const startGame = (roomId) => {
  socket.emit("startGame", { roomId });
};

// Проголосовать
export const vote = (roomId, targetId) => {
  socket.emit("vote", { roomId, targetId });
};

// === СЛУШАТЕЛИ ===

// Получение новых сообщений
export const onMessage = (callback) => {
  socket.on("newMessage", callback);
};

// Изменение состояния комнаты
export const onRoomUpdate = (callback) => {
  socket.on("roomUpdate", callback);
};

// Изменение состояния игры
export const onGameState = (callback) => {
  socket.on("gameState", callback);
};

// Очистить слушателей (например, при размонтировании)
export const removeListeners = () => {
  socket.off("newMessage");
  socket.off("roomUpdate");
  socket.off("gameState");
};
