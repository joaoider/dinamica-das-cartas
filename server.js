const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const rooms = new Map();

app.get("/logo.png", (_request, response) => {
  response.sendFile(path.join(__dirname, "logo.png"));
});
app.get("/Mario-Araripe.jpeg", (_request, response) => {
  response.sendFile(path.join(__dirname, "Mario-Araripe.jpeg"));
});
app.use(express.static(path.join(__dirname, "public")));

function roomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (rooms.has(code));
  return code;
}

function publicRoom(room) {
  return {
    code: room.code,
    phase: room.phase,
    participants: [...room.people.values()].map(({ id, name, submitted }) => ({ id, name, submitted })),
    submissionCount: room.submissions.size,
    results: room.phase === "results" ? aggregate(room) : null
  };
}

function aggregate(room) {
  const totals = Array(10).fill(0);
  const firstPlaces = Array(10).fill(0);
  for (const submission of room.submissions.values()) {
    const order = submission.order;
    order.forEach((cardId, index) => {
      totals[cardId - 1] += 10 - index;
      if (index === 0) firstPlaces[cardId - 1] += 1;
    });
  }
  return totals
    .map((score, index) => ({ cardId: index + 1, score, firstPlaces: firstPlaces[index] }))
    .sort((a, b) => b.score - a.score || b.firstPlaces - a.firstPlaces || a.cardId - b.cardId);
}

function update(code) {
  const room = rooms.get(code);
  if (!room) return;
  io.to(code).emit("room:update", publicRoom(room));
  if (room.phase === "results") {
    const individualResults = [...room.submissions.values()].map(submission => ({
      name: submission.name,
      order: submission.order
    }));
    io.to(room.hostId).emit("results:individual", individualResults);
    for (const [participantId, submission] of room.submissions) {
      io.to(participantId).emit("results:own", { order: submission.order });
    }
  }
}

io.on("connection", (socket) => {
  socket.on("room:create", ({ name }, done) => {
    const code = roomCode();
    const room = {
      code,
      hostId: socket.id,
      phase: "lobby",
      people: new Map(),
      submissions: new Map()
    };
    room.people.set(socket.id, { id: socket.id, name: cleanName(name), submitted: false });
    rooms.set(code, room);
    socket.join(code);
    socket.data.roomCode = code;
    done({ ok: true, code, isHost: true });
    update(code);
  });

  socket.on("room:join", ({ code, name }, done) => {
    code = String(code || "").trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return done({ ok: false, error: "Sala não encontrada." });
    if (room.phase === "results") return done({ ok: false, error: "Esta dinâmica já foi encerrada." });
    room.people.set(socket.id, { id: socket.id, name: cleanName(name), submitted: false });
    socket.join(code);
    socket.data.roomCode = code;
    done({ ok: true, code, isHost: false });
    update(code);
  });

  socket.on("phase:set", ({ phase }, done = () => {}) => {
    const room = rooms.get(socket.data.roomCode);
    if (!room || room.hostId !== socket.id) return done({ ok: false });
    if (!["lobby", "ranking", "results"].includes(phase)) return done({ ok: false });
    room.phase = phase;
    update(room.code);
    done({ ok: true });
  });

  socket.on("ranking:submit", ({ order }, done) => {
    const room = rooms.get(socket.data.roomCode);
    const valid = Array.isArray(order) && order.length === 10 && new Set(order).size === 10 && order.every(n => Number.isInteger(n) && n >= 1 && n <= 10);
    if (!room || room.phase !== "ranking" || !valid) return done({ ok: false, error: "Não foi possível enviar a ordem." });
    const person = room.people.get(socket.id);
    room.submissions.set(socket.id, { order, name: person?.name || "Participante" });
    if (person) person.submitted = true;
    update(room.code);
    done({ ok: true });
  });

  socket.on("disconnect", () => {
    const code = socket.data.roomCode;
    const room = rooms.get(code);
    if (!room) return;
    room.people.delete(socket.id);
    if (room.hostId === socket.id) {
      io.to(code).emit("room:closed");
      rooms.delete(code);
    } else update(code);
  });
});

function cleanName(value) {
  return String(value || "Participante").trim().slice(0, 40) || "Participante";
}

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Dinâmica disponível em http://localhost:${port}`));
