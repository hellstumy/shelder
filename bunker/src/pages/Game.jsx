import "./Game.css";
import player from "../assets/player.svg";
import time from "../assets/time.svg";
import exit from "../assets/exit.svg";
import PlayerCard from "../components/PlayerCard";
import GameStartModal from "../components/GameStartModal";
import GameEndModal from "../components/GameEndModal";
import {
  getRoomPlayers,
  getRoomState,
  setRoomState,
  onPlayerJoined,
  onStateUpdate,
  onVoteUpdate,
  onPlayerEliminated,
  onNewRound,
  onVoteResult,
  onGameOver,
  onAttributeRevealed,
  removeListeners,
} from "../api/api";
import useStore from "../tools/store";
import { useEffect, useState } from "react";

export default function Game() {
  const { roomCode, backWindowState, setButtonState } = useStore();
  const [players, setPlayers] = useState([]);
  const [voteState, setVoteState] = useState(null);
  const [voteProgress, setVoteProgress] = useState({});
  const [revealedAttributes, setRevealedAttributes] = useState({});
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [gameData, setGameData] = useState(null);
  const [winners, setWinners] = useState([]);

  // --- Таймер ---
  const startTimer = (seconds) => {
    setTimer(seconds);
    const id = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  // --- Переключение на "voting" и обратно ---
  const setVotingState = async () => {
    const duration = 60; // секунд
    try {
      await setRoomState(roomCode, "voting");
      setVoteState("voting");
      startTimer(duration);

      setTimeout(async () => {
        await setRoomState(roomCode, "started");
        setVoteState("started");
        clearInterval(intervalId);
        setTimer(0);
      }, duration * 1000);
    } catch (err) {
      console.error("Ошибка при установке состояния голосования:", err);
    }
  };

  // --- Обработка выхода ---
  const handleExit = () => {
    backWindowState();
    setButtonState();
    if (intervalId) clearInterval(intervalId);
    removeListeners();
  };

  // --- Форматирование таймера ---
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- Подписки ---
  useEffect(() => {
    if (!roomCode) return;

    const loadInitial = async () => {
      const playersData = await getRoomPlayers(roomCode);
      setPlayers(playersData);
      try {
        const stateData = await getRoomState(roomCode);
        setVoteState(stateData.state);
      } catch (err) {
        console.error("Ошибка при получении состояния комнаты:", err);
      }
    };
    loadInitial();

    onPlayerJoined((newPlayer) => {
      setPlayers((prev) => [...prev, newPlayer]);
    });

    onStateUpdate((payload) => {
      const state =
        typeof payload === "string"
          ? payload
          : payload?.state || payload?.state?.state || payload;
      setVoteState(state);

      if (state === "voting") startTimer(60);
      else if (state === "started") {
        clearInterval(intervalId);
        setTimer(0);
      }

      if (state === "started" && payload?.gameData) {
        setGameData(payload.gameData);
        setIsStartModalOpen(true);
      }
    });

    onVoteUpdate((voteData) => {
      setVoteProgress(voteData.votes || {});
    });

    onAttributeRevealed(({ target, attribute, value, revealedBy }) => {
      setRevealedAttributes((prev) => {
        const copy = { ...prev };
        if (!copy[target]) copy[target] = {};
        copy[target][attribute] = { value, revealedBy };
        return copy;
      });
    });

    onPlayerEliminated(({ loser }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.name === loser ? { ...p, status: "dead" } : p))
      );
    });

    onNewRound(() => {
      setVoteProgress({});
      setRevealedAttributes({});
    });

    onVoteResult((data) => {
      console.log("🟡 Vote result:", data);
      // Reset revealed attributes for new round
      setRevealedAttributes({});
    });

    onGameOver(({ winners }) => {
      setVoteState("gameOver");
      setWinners(winners);
      setIsEndModalOpen(true);
    });

    return () => {
      removeListeners();
      if (intervalId) clearInterval(intervalId);
    };
  }, [roomCode, intervalId]);

  return (
    <div className="game-container">
      <header>
        <h2>Bunker</h2>
        {voteState === "voting" ? (
          <h2>Voting...</h2>
        ) : (
          <button
            style={{ padding: "10px 15px" }}
            onClick={setVotingState}
            className="join-button"
          >
            Start Voting
          </button>
        )}

        <nav>
          <ul>
            <li className="nav_li">
              <img src={player} alt="player icon" />
              <span>{players.length}</span>
            </li>
            <li className="nav_li">
              <img src={time} alt="time icon" />
              <span>{timer > 0 ? formatTime(timer) : "00:00"}</span>
            </li>
            <li className="nav_li">
              <img onClick={handleExit} src={exit} alt="exit icon" />
            </li>
          </ul>
        </nav>
      </header>

      <main className="game-main">
        <div className="players-grid">
          {players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              voteState={voteState}
              voteProgress={voteProgress}
              revealedAttributes={revealedAttributes}
            />
          ))}
        </div>
      </main>

      {gameData && (
        <GameStartModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          gameData={gameData}
        />
      )}

      {winners.length > 0 && (
        <GameEndModal
          isOpen={isEndModalOpen}
          onClose={() => setIsEndModalOpen(false)}
          winners={winners}
        />
      )}
    </div>
  );
}
