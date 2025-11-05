import waiting from "../../assets/waiting.svg";
import { getRoomPlayers, setRoomState, onPlayerJoined, removeListeners } from "../../api/api";
import { useState, useEffect } from "react";
import useStore from "../../tools/store";

export default function StartGameWaiting() {
  const { roomCode, setWindowState } = useStore();
  const [players, setPlayers] = useState([]);

  // --- Загрузка игроков при подключении ---
  useEffect(() => {
    if (!roomCode) return;

    const fetchPlayers = async () => {
      try {
        const data = await getRoomPlayers(roomCode);
        setPlayers(data);
      } catch (err) {
        console.error("Ошибка при получении игроков:", err);
      }
    };

    fetchPlayers();

    // --- Слушаем новых игроков через socket ---
    onPlayerJoined((player) => {
      setPlayers((prev) => [...prev, player]);
    });

    return () => removeListeners();
  }, [roomCode]);

  // --- Старт игры ---
  const handleStartGame = async () => {
    try {
      await setRoomState(roomCode, "started");
      setWindowState("game");
    } catch (err) {
      console.error("Ошибка при обновлении состояния комнаты:", err);
    }
  };

  return (
    <div className="start-game-waiting">
      <p style={{ fontSize: "64px" }}>Waiting...</p>
      <p style={{ fontSize: "48px" }}>
        {(players?.length ?? 0)}/6
      </p>

      

      <img src={waiting} alt="waiting" />
      <button
        onClick={handleStartGame}
        className={players.length >= 6 ? "join-button" : "button-disabled"}
        disabled={players.length < 6}
      >
        Начать игру
      </button>
    </div>
  );
}
