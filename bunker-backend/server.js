// import express from "express";
// import { Server } from "socket.io";
// import http from "http";
// import cors from "cors";
// import sqlite3 from "sqlite3";
// import fs from "fs";
// import path from "path";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// app.use(cors());
// app.use(express.json());

// // === Подгружаем JSON с характеристиками ===
// const jsonPath = path.resolve("./characteristics.json");
// const characteristics = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

// // === Game Scenarios ===
// const gameScenariosPath = path.resolve("./gameScenarios.json");
// const gameScenarios = JSON.parse(fs.readFileSync(gameScenariosPath, "utf-8"));

// // === Helper Functions ===
// const generateGameScenario = (players) => {
//   // Randomly select scenario elements
//   const apocalypseScenario = gameScenarios.apocalypseScenarios[Math.floor(Math.random() * gameScenarios.apocalypseScenarios.length)];
//   const bunkerDescription = gameScenarios.bunkerDescriptions[Math.floor(Math.random() * gameScenarios.bunkerDescriptions.length)];
  
//   // Generate random supplies
//   const supplies = gameScenarios.supplies.map(supply => ({
//     ...supply,
//     quantity: Math.floor(Math.random() * (supply.maxQuantity - supply.minQuantity + 1)) + supply.minQuantity
//   }));

//   // Calculate required survivors based on player count (40% of initial players, minimum 2)
//   const requiredSurvivors = Math.max(2, Math.ceil(players.length * 0.4));

//   return {
//     apocalypseScenario,
//     bunkerDescription,
//     supplies,
//     requiredSurvivors
//   };
// };

// // === SQLite ===
// const sqlite = sqlite3.verbose();
// const db = new sqlite.Database("./bunker.db", (err) => {
//   if (err) console.error(err.message);
//   else console.log("SQLite DB connected");
// });

// db.serialize(() => {
//   db.run(`
//       CREATE TABLE IF NOT EXISTS rooms (
//           code TEXT PRIMARY KEY,
//           state TEXT DEFAULT 'waiting'
//       )
//   `);
//   db.run(`
//       CREATE TABLE IF NOT EXISTS players (
//           id INTEGER PRIMARY KEY AUTOINCREMENT,
//           name TEXT,
//           roomCode TEXT,
//           gender TEXT,
//           age INTEGER,
//           body TEXT,
//           trait TEXT,
//           profession TEXT,
//           health TEXT,
//           hobby TEXT,
//           phobia TEXT,
//           inventory TEXT,
//           backpack TEXT,
//           ability TEXT,
//           status TEXT DEFAULT 'alive',
//           FOREIGN KEY(roomCode) REFERENCES rooms(code)
//       )
//   `);
// });

// // === Вспомогательные функции ===
// function getRandom(arr) {
//   return arr[Math.floor(Math.random() * arr.length)];
// }
// function generateRandomAge() {
//   return Math.floor(Math.random() * (88 - 17 + 1)) + 17;
// }

// // === Хранилище голосов ===
// const votes = {};
// const rounds = {}; // отслеживает номер раунда

// // === Эндпоинты ===

// // Создать комнату
// app.post("/create-room", (_, res) => {
//   const code = Math.random().toString(36).substring(2, 8).toUpperCase();
//   db.run("INSERT INTO rooms(code, state) VALUES(?, ?)", [code, "waiting"], (err) => {
//     if (err) return res.status(500).json({ success: false, error: err.message });
//     rounds[code] = 1;
//     res.json({ success: true, roomCode: code, state: "waiting" });
//   });

// });

// // Присоединиться к комнате
// app.post("/join-room", (req, res) => {
//   const { roomCode, playerName } = req.body;
//   if (!roomCode || !playerName)
//     return res.status(400).json({ success: false, error: "Missing data" });

//   db.get("SELECT * FROM rooms WHERE code = ?", [roomCode], (err, room) => {
//     if (err) return res.status(500).json({ success: false, error: err.message });
//     if (!room) return res.status(404).json({ success: false, error: "Room not found" });

//     const player = {
//       name: playerName,
//       gender: getRandom(characteristics.genders),
//       orientations: getRandom(characteristics.orientations),
//       age: generateRandomAge(),
//       body: getRandom(characteristics.bodies),
//       trait: getRandom(characteristics.traits),
//       profession: getRandom(characteristics.professions),
//       health: getRandom(characteristics.healthStates),
//       hobby: getRandom(characteristics.hobbies),
//       phobia: getRandom(characteristics.phobias),
//       inventory: getRandom(characteristics.inventories),
//       backpack: getRandom(characteristics.backpacks),
//       ability: getRandom(characteristics.abilities),
//       roomCode,
//       status: "alive",
//     };

//     db.run(
//       `
//         INSERT INTO players(name, roomCode, gender, age, body, trait, profession, health, hobby, phobia, inventory, backpack, ability, status)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//       `,
//       [
//         player.name,
//         player.roomCode,
//         player.gender,
//         player.age,
//         player.body,
//         player.trait,
//         player.profession,
//         player.health,
//         player.hobby,
//         player.phobia,
//         player.inventory,
//         player.backpack,
//         player.ability,
//         player.status,
//       ],
//       function (err) {
//         if (err) return res.status(500).json({ success: false, error: err.message });

//         io.to(roomCode).emit("playerJoined", player);
//         res.json({ success: true, player });
//       }
//     );
//   });
// });

// // Получить игроков комнаты
// app.get("/room/:code", (req, res) => {
//   const roomCode = req.params.code;
//   db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, rows) => {
//     if (err) return res.status(500).json({ success: false, error: err.message });
//     res.json(rows);
//   });
// });

// // Получить состояние комнаты
// app.get("/room-state/:code", (req, res) => {
//   const roomCode = req.params.code;
//   db.get("SELECT state FROM rooms WHERE code = ?", [roomCode], (err, row) => {
//     if (err) return res.status(500).json({ success: false, error: err.message });
//     if (!row) return res.status(404).json({ success: false, error: "Room not found" });
//     res.json({ roomCode, state: row.state });
//   });
// });

// // Обновить состояние комнаты
// // Helper function to start voting
// const startVoting = (roomCode) => {
//   // Reset votes for this room
//   votes[roomCode] = {};
  
//   // Update room state
//   db.run("UPDATE rooms SET state = ? WHERE code = ?", ["voting", roomCode], (err) => {
//     if (err) return console.error("Error updating room state:", err);
    
//     // Get current players to pass with state update
//     db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, players) => {
//       if (err) return console.error(err);
      
//       io.to(roomCode).emit("stateUpdate", { 
//         state: "voting",
//         activePlayers: players.filter(p => p.status === "alive")
//       });
//     });
//   });
// };

// app.post("/room-state", (req, res) => {
//   const { roomCode, state } = req.body;
//   if (!roomCode || !state)
//     return res.status(400).json({ success: false, error: "Missing data" });

//   if (state === "voting") {
//     startVoting(roomCode);
//     res.json({ success: true, roomCode, state });
//   } else {
//     db.run("UPDATE rooms SET state = ? WHERE code = ?", [state, roomCode], function (err) {
//       if (err) return res.status(500).json({ success: false, error: err.message });
      
//       if (state === "started") {
//         // Get game scenario data for the room
//         db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, players) => {
//           if (err) return res.status(500).json({ success: false, error: err.message });
          
//           const gameData = generateGameScenario(players);
//           io.to(roomCode).emit("stateUpdate", { state, gameData });
//           res.json({ success: true, roomCode, state, gameData });
//         });
//       } else {
//         io.to(roomCode).emit("stateUpdate", state);
//         res.json({ success: true, roomCode, state });
//       }
//     });
//   }
// });

// // === Game State Management ===
// const gameStates = {};

// const initializeGame = async (roomCode) => {
//   // Get players in room
//   return new Promise((resolve, reject) => {
//     db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, players) => {
//       if (err) {
//         console.error("Error initializing game:", err);
//         reject(err);
//         return;
//       }

//       const gameData = generateGameScenario(players);
//       gameStates[roomCode] = {
//         state: "started",
//         players,
//         gameData,
//         votes: {},
//         round: 1
//       };

//       resolve(gameStates[roomCode]);
//     });
//   });
// };

// // === SOCKET.IO ===
// io.on("connection", (socket) => {
//   console.log("New socket connected:", socket.id);

//   socket.on("joinRoom", (roomCode) => {
//     socket.join(roomCode);
//     console.log(`${socket.id} joined room ${roomCode}`);
//   });

//   socket.on("message", ({ roomCode, name, text }) => {
//     io.to(roomCode).emit("message", { name, text });
//   });

//   socket.on("vote", ({ roomCode, name, target }) => {
//     // Validate room is in voting state
//     db.get("SELECT state FROM rooms WHERE code = ?", [roomCode], (err, row) => {
//       if (err) return console.error(err);
//       if (!row || row.state !== "voting") {
//         console.log(`Vote rejected: room ${roomCode} not in voting state`);
//         return;
//       }

//       // Check voter is alive
//       db.get("SELECT status FROM players WHERE roomCode = ? AND name = ?", [roomCode, name], (err, voter) => {
//         if (err) return console.error(err);
//         if (!voter || voter.status !== "alive") {
//           console.log(`Vote rejected: voter ${name} not found or not alive in ${roomCode}`);
//           return;
//         }

//         // Check target exists and is alive
//         db.get("SELECT status FROM players WHERE roomCode = ? AND name = ?", [roomCode, target], (err, targ) => {
//           if (err) return console.error(err);
//           if (!targ || targ.status !== "alive") {
//             console.log(`Vote rejected: target ${target} not found or not alive in ${roomCode}`);
//             return;
//           }

//           if (name === target) {
//             console.log(`Vote rejected: ${name} attempted to vote for themself`);
//             return;
//           }

//           if (!votes[roomCode]) votes[roomCode] = {};
//           // Enforce one vote per player per round
//           if (votes[roomCode][name]) {
//             console.log(`Duplicate vote ignored: ${name} already voted in ${roomCode}`);
//             // still emit update so clients can reflect progress
//             try {
//               io.to(roomCode).emit("voteUpdate", { votes: votes[roomCode], message: "duplicate" });
//             } catch (e) {
//               console.error("Error emitting voteUpdate:", e);
//             }
//             return;
//           }

//           votes[roomCode][name] = target;
//           console.log(`${name} voted against ${target} in ${roomCode}`);

//           // Получаем всех живых игроков
//           db.all("SELECT name FROM players WHERE roomCode = ? AND status = 'alive'", [roomCode], (err, players) => {
//             if (err) return console.error(err);
//             const alivePlayers = players.map((p) => p.name);

//             // emit intermediate update with remaining
//             try {
//               const currentVotes = votes[roomCode] || {};
//               const remaining = Math.max(alivePlayers.length - Object.keys(currentVotes).length, 0);
//               io.to(roomCode).emit("voteUpdate", { votes: currentVotes, remaining });
//             } catch (e) {
//               console.error("Error emitting voteUpdate:", e);
//             }

//             // don't auto-eliminate here; tallying occurs when voting officially ends (state->started)
//           });
//         });
//       });
//     });
//   });

//   // Reveal attribute request: fetch attribute server-side and broadcast to room
//   socket.on("reveal", ({ roomCode, requester, target, attribute }) => {
//     // allowed attribute columns to prevent SQL injection
//     const allowed = [
//       "gender",
//       "age",
//       "body",
//       "trait",
//       "profession",
//       "health",
//       "hobby",
//       "phobia",
//       "inventory",
//       "backpack",
//       "ability",
//     ];

//     if (!allowed.includes(attribute)) {
//       console.log(`Reveal rejected: attribute ${attribute} not allowed`);
//       return;
//     }

//     // Verify requester is the same as target (only a player can reveal their own attributes)
//     if (requester !== target) {
//       console.log(`Reveal rejected: requester ${requester} tried to reveal ${target}'s attribute`);
//       return;
//     }

//     // Verify requester is in room and alive
//     db.get("SELECT status FROM players WHERE roomCode = ? AND name = ?", [roomCode, requester], (err, row) => {
//       if (err) return console.error(err);
//       if (!row || row.status !== "alive") {
//         console.log(`Reveal rejected: requester ${requester} invalid or not alive`);
//         return;
//       }

//       // Fetch attribute value for target
//       const sql = `SELECT ${attribute} as value FROM players WHERE roomCode = ? AND name = ?`;
//       db.get(sql, [roomCode, target], (err, res) => {
//         if (err) return console.error(err);
//         if (!res) return console.log(`Reveal: target ${target} not found in ${roomCode}`);

//         io.to(roomCode).emit("attributeRevealed", {
//           target,
//           attribute,
//           value: res.value,
//           revealedBy: requester,
//         });
//       });
//     });
//   });

//   // Handle room state updates from clients (tally votes when voting ends)
//   socket.on("stateUpdate", ({ roomCode, state }) => {
//     if (state === "started") {
//       // Get current game data and players for the room
//       db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, players) => {
//         if (err) return console.error(err);

//         // Generate game scenario only if not already exists
//         const gameData = generateGameScenario(players);

//         io.to(roomCode).emit("stateUpdate", { state, gameData });
//       });
//       return;
//     }

//     if (state !== "voting-end") return;

//     // When voting ends, tally current votes even if not all voted
//     const currentVotes = votes[roomCode] || {};

//     // If no votes were cast, emit a result and start new round
//     if (Object.keys(currentVotes).length === 0) {
//       io.to(roomCode).emit("voteResult", { noVotes: true, tally: {} });
//       rounds[roomCode] = (rounds[roomCode] || 1) + 1;
//       votes[roomCode] = {};
//       io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
//       return;
//     }

//     // Count votes
//     const tally = {};
//     Object.values(currentVotes).forEach((t) => {
//       tally[t] = (tally[t] || 0) + 1;
//     });

//     const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
//     const topCount = entries[0][1];
//     const topCandidates = entries.filter((e) => e[1] === topCount).map((e) => e[0]);

//     if (topCandidates.length > 1) {
//       // Tie
//       io.to(roomCode).emit("voteResult", { tie: true, topCandidates, tally });
//       rounds[roomCode] = (rounds[roomCode] || 1) + 1;
//       votes[roomCode] = {};
//       io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
//     } else {
//       const loser = entries[0][0];
//       db.run("UPDATE players SET status = 'dead' WHERE name = ? AND roomCode = ?", [loser, roomCode], (err) => {
//         if (err) return console.error(err);
//         io.to(roomCode).emit("playerEliminated", { loser });

//         // Get alive players to check required survivors
//         db.all("SELECT * FROM players WHERE roomCode = ? AND status = 'alive'", [roomCode], (err, alivePlayers) => {
//           if (err) return console.error(err);

//           // Get initial players count to calculate required survivors
//           db.all("SELECT * FROM players WHERE roomCode = ?", [roomCode], (err, allPlayers) => {
//             if (err) return console.error(err);

//             const gameData = generateGameScenario(allPlayers);
//             const requiredSurvivors = gameData.requiredSurvivors;

//             if (alivePlayers.length <= requiredSurvivors) {
//               // Game over, these players are the winners
//               io.to(roomCode).emit("gameOver", { winners: alivePlayers });
//               delete votes[roomCode];
//             } else {
//               rounds[roomCode] = (rounds[roomCode] || 1) + 1;
//               votes[roomCode] = {};
//               io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
//             }
//           });
//         });
//       });
//     }
//   });
// });

// server.listen(3000, () => {
//   console.log("Server running http://localhost:3000");
// });
import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// === Подгружаем JSON ===
const characteristics = JSON.parse(fs.readFileSync(path.resolve("./characteristics.json"), "utf-8"));
const gameScenarios = JSON.parse(fs.readFileSync(path.resolve("./gameScenarios.json"), "utf-8"));

// === Helper Functions ===
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const generateRandomAge = () => Math.floor(Math.random() * (88 - 17 + 1)) + 17;

const generateGameScenario = (players) => {
  const apocalypseScenario = getRandom(gameScenarios.apocalypseScenarios);
  const bunkerDescription = getRandom(gameScenarios.bunkerDescriptions);
  const supplies = gameScenarios.supplies.map((supply) => ({
    ...supply,
    quantity: Math.floor(Math.random() * (supply.maxQuantity - supply.minQuantity + 1)) + supply.minQuantity,
  }));
  const requiredSurvivors = Math.max(2, Math.ceil(players.length * 0.4));
  return { apocalypseScenario, bunkerDescription, supplies, requiredSurvivors };
};

// === Better-SQLite3 setup ===
const db = new Database("./bunker.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS rooms (
    code TEXT PRIMARY KEY,
    state TEXT DEFAULT 'waiting'
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    roomCode TEXT,
    gender TEXT,
    age INTEGER,
    body TEXT,
    trait TEXT,
    profession TEXT,
    health TEXT,
    hobby TEXT,
    phobia TEXT,
    inventory TEXT,
    backpack TEXT,
    ability TEXT,
    status TEXT DEFAULT 'alive',
    FOREIGN KEY(roomCode) REFERENCES rooms(code)
  )
`).run();

console.log("SQLite DB ready (better-sqlite3)");

// === Игровое состояние ===
const votes = {};
const rounds = {};
const gameStates = {};

// === Эндпоинты ===

// Создание комнаты
app.post("/create-room", (_, res) => {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  db.prepare("INSERT INTO rooms (code, state) VALUES (?, ?)").run(code, "waiting");
  rounds[code] = 1;
  res.json({ success: true, roomCode: code, state: "waiting" });
});

// Присоединение игрока
app.post("/join-room", (req, res) => {
  const { roomCode, playerName } = req.body;
  if (!roomCode || !playerName)
    return res.status(400).json({ success: false, error: "Missing data" });

  const room = db.prepare("SELECT * FROM rooms WHERE code = ?").get(roomCode);
  if (!room) return res.status(404).json({ success: false, error: "Room not found" });

  const player = {
    name: playerName,
    gender: getRandom(characteristics.genders),
    orientations: getRandom(characteristics.orientations),
    age: generateRandomAge(),
    body: getRandom(characteristics.bodies),
    trait: getRandom(characteristics.traits),
    profession: getRandom(characteristics.professions),
    health: getRandom(characteristics.healthStates),
    hobby: getRandom(characteristics.hobbies),
    phobia: getRandom(characteristics.phobias),
    inventory: getRandom(characteristics.inventories),
    backpack: getRandom(characteristics.backpacks),
    ability: getRandom(characteristics.abilities),
    roomCode,
    status: "alive",
  };

  db.prepare(`
    INSERT INTO players (name, roomCode, gender, age, body, trait, profession, health, hobby, phobia, inventory, backpack, ability, status)
    VALUES (@name, @roomCode, @gender, @age, @body, @trait, @profession, @health, @hobby, @phobia, @inventory, @backpack, @ability, @status)
  `).run(player);

  io.to(roomCode).emit("playerJoined", player);
  res.json({ success: true, player });
});

// Получить игроков комнаты
app.get("/room/:code", (req, res) => {
  const players = db.prepare("SELECT * FROM players WHERE roomCode = ?").all(req.params.code);
  res.json(players);
});

// Получить состояние комнаты
app.get("/room-state/:code", (req, res) => {
  const room = db.prepare("SELECT state FROM rooms WHERE code = ?").get(req.params.code);
  if (!room) return res.status(404).json({ success: false, error: "Room not found" });
  res.json({ roomCode: req.params.code, state: room.state });
});

// Изменить состояние комнаты
const startVoting = (roomCode) => {
  votes[roomCode] = {};
  db.prepare("UPDATE rooms SET state = ? WHERE code = ?").run("voting", roomCode);
  const players = db.prepare("SELECT * FROM players WHERE roomCode = ?").all(roomCode);
  io.to(roomCode).emit("stateUpdate", {
    state: "voting",
    activePlayers: players.filter((p) => p.status === "alive"),
  });
};

app.post("/room-state", (req, res) => {
  const { roomCode, state } = req.body;
  if (!roomCode || !state)
    return res.status(400).json({ success: false, error: "Missing data" });

  if (state === "voting") {
    startVoting(roomCode);
    return res.json({ success: true, roomCode, state });
  }

  db.prepare("UPDATE rooms SET state = ? WHERE code = ?").run(state, roomCode);

  if (state === "started") {
    const players = db.prepare("SELECT * FROM players WHERE roomCode = ?").all(roomCode);
    const gameData = generateGameScenario(players);
    io.to(roomCode).emit("stateUpdate", { state, gameData });
    return res.json({ success: true, roomCode, state, gameData });
  }

  io.to(roomCode).emit("stateUpdate", state);
  res.json({ success: true, roomCode, state });
});

// === SOCKET.IO ===
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", (roomCode) => socket.join(roomCode));

  socket.on("message", ({ roomCode, name, text }) => {
    io.to(roomCode).emit("message", { name, text });
  });

  socket.on("vote", ({ roomCode, name, target }) => {
    const room = db.prepare("SELECT state FROM rooms WHERE code = ?").get(roomCode);
    if (!room || room.state !== "voting") return;

    const voter = db.prepare("SELECT status FROM players WHERE roomCode = ? AND name = ?").get(roomCode, name);
    const targ = db.prepare("SELECT status FROM players WHERE roomCode = ? AND name = ?").get(roomCode, target);
    if (!voter || voter.status !== "alive" || !targ || targ.status !== "alive" || name === target) return;

    if (!votes[roomCode]) votes[roomCode] = {};
    if (votes[roomCode][name]) return;

    votes[roomCode][name] = target;
    const alivePlayers = db.prepare("SELECT name FROM players WHERE roomCode = ? AND status = 'alive'").all(roomCode);
    const remaining = Math.max(alivePlayers.length - Object.keys(votes[roomCode]).length, 0);
    io.to(roomCode).emit("voteUpdate", { votes: votes[roomCode], remaining });
  });

  socket.on("reveal", ({ roomCode, requester, target, attribute }) => {
    const allowed = ["gender", "age", "body", "trait", "profession", "health", "hobby", "phobia", "inventory", "backpack", "ability"];
    if (!allowed.includes(attribute) || requester !== target) return;

    const player = db.prepare("SELECT status FROM players WHERE roomCode = ? AND name = ?").get(roomCode, requester);
    if (!player || player.status !== "alive") return;

    const value = db.prepare(`SELECT ${attribute} as value FROM players WHERE roomCode = ? AND name = ?`).get(roomCode, target);
    if (!value) return;

    io.to(roomCode).emit("attributeRevealed", { target, attribute, value: value.value, revealedBy: requester });
  });

  socket.on("stateUpdate", ({ roomCode, state }) => {
    if (state !== "voting-end") return;
    const currentVotes = votes[roomCode] || {};
    if (Object.keys(currentVotes).length === 0) {
      io.to(roomCode).emit("voteResult", { noVotes: true });
      rounds[roomCode] = (rounds[roomCode] || 1) + 1;
      votes[roomCode] = {};
      return io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
    }

    const tally = {};
    for (const v of Object.values(currentVotes)) tally[v] = (tally[v] || 0) + 1;
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    const topCount = entries[0][1];
    const topCandidates = entries.filter(([_, c]) => c === topCount).map(([n]) => n);

    if (topCandidates.length > 1) {
      io.to(roomCode).emit("voteResult", { tie: true, topCandidates, tally });
      rounds[roomCode] = (rounds[roomCode] || 1) + 1;
      votes[roomCode] = {};
      return io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
    }

    const loser = entries[0][0];
    db.prepare("UPDATE players SET status = 'dead' WHERE name = ? AND roomCode = ?").run(loser, roomCode);
    io.to(roomCode).emit("playerEliminated", { loser });

    const alive = db.prepare("SELECT * FROM players WHERE roomCode = ? AND status = 'alive'").all(roomCode);
    const all = db.prepare("SELECT * FROM players WHERE roomCode = ?").all(roomCode);
    const gameData = generateGameScenario(all);

    if (alive.length <= gameData.requiredSurvivors) {
      io.to(roomCode).emit("gameOver", { winners: alive });
      delete votes[roomCode];
    } else {
      rounds[roomCode] = (rounds[roomCode] || 1) + 1;
      votes[roomCode] = {};
      io.to(roomCode).emit("newRound", { round: rounds[roomCode] });
    }
  });
});

// === Server start ===
const PORT = process.env.PORT || 3000;
server.listen(3000, () => console.log("Server running at http://localhost:3000"));
