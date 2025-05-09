const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;

    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();

    emitEvent("userJoined", gameData);
    emitEvent("nowPlayers", gameData.players);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();
    // [
    //   { id: 4432,  name: "Luis", role: "marco" },
    //   { id: 4432, name: "Marta", role: "polo-especial" },
    //   { id: 4432, name: "Carlos", role: "polo" },
    //   { id: 4432, name: "Ana", role: "polo" }
    // ]

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    // rolesToNotify= [
    //   { id: 43432, name: "Luis", role: "polo-especial" },
    //   { name: "Carlos", role: "polo" }
    // ]

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    // rolesToNotify= [
    //   { id: 43432, name: "Luis", role: "marco" },
    // ]

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const marco = playersDb.findPlayerById(socketId); // Jugador actual
    const polo = playersDb.findPlayerById(poloId); // El polo que fue atrapado o seleccionado por marco
    // marco= { id: 4432, name: "Luis", role: "marco" }
    // polo= { id: 4432, name: "Marta", role: "polo-especial" }

    const allPlayers = playersDb.getAllPlayers();

    let message = "";

    if (polo.role === "polo-especial") {
      // Si atrapó a un polo especial
      playersDb.updateScore(marco.id, 50); // suma +50
      playersDb.updateScore(polo.id, -10); // pierde -10

      message = `¡El marco ${marco.nickname} ha ganado! ${polo.nickname} fue capturado.`;
    } else {
      // Marco no atrapó a un polo especial
      playersDb.updateScore(marco.id, -10); // pierde -10

      const polosEspeciales = playersDb.findPlayersByRole("polo-especial");
      // polosEspeciales= [{ id: 4432, name: "Luis", role: "polo-especial" }]

      polosEspeciales.forEach((p) => {
        playersDb.updateScore(p.id, 10); // gana 10
      });

      message = `¡El marco ${marco.nickname} ha perdido! No atrapó al polo especial.`;
    }

    allPlayers.forEach((player) => {
      emitToSpecificClient(player.id, "notifyGameOver", { message });
    });

    // Enviar jugadores actualizados con sus puntajes al frontend
    const updatedGameData = playersDb.getGameData();
    emitEvent("nowPlayers", updatedGameData.players);

    // Verifica si alguien ya ganó
    const winner = allPlayers.find((p) => p.score >= 100);

    if (winner) {
      // Ordenar por puntaje de mayor a menor
      const rankedPlayers = [...allPlayers].sort((a, b) => b.score - a.score);

      emitEvent("gameWinner", {
        winner,
        rankedPlayers,
      });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const restartGame = async (req, res) => {
  try {
    playersDb.clearScores(); // Deberás agregar esta función al db si no existe

    emitEvent("gameRestarted"); // Avisamos a todos que el juego fue reiniciado

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  restartGame,
};
