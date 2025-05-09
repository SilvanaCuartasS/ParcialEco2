import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
      <div id="screen1">
        <h2>Screen 1</h2>
        <p>Hello from screen 1</p>

        <h3>Now Players</h3>
        <div id="nowPlayers"></div>
      </div>
      `;

  const nowPlayers = document.getElementById("nowPlayers");

  socket.on("nowPlayers", (players) => {
    nowPlayers.innerHTML = ""; 
    
    players.forEach((player) => {
      nowPlayers.innerHTML += `
        <p>${player.nickname} | Rol: ${
        player.role ?? "sin asignar"
      } | Puntos: ${player.score ?? 0}</p>
      `;
    });
  });
}
