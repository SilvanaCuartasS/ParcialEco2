import { navigateTo, socket, makeRequest } from "../app.js";

export default function renderHomeScreen() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="home-welcome-screen">
      <h2>Bienvenidos</h2>
      <p>Ingresa tu nombre de usuario para unirte al juego</p>
      <div id="form">
        <input type="text" id="nickname" placeholder="nickname" />
        <button id="join-button">Join Game</button>
      </div>
    </div>
  `;

  const nicknameInput = document.getElementById("nickname");
  const joinButton = document.getElementById("join-button");

  // Al hacer click en el boton hace...
  joinButton.addEventListener("click", async () => {
    const userName = nicknameInput.value;

    // Esta linea solo verifica si hay un valor en el input, sino sale el alert
    if (!userName.trim()) {
      alert("Please enter a nickname");
      return;
    }

    const result = await makeRequest("/api/game/join", "POST", {
      nickname: userName,
      socketId: socket.id,
    });

    if (result.success !== false) {
      navigateTo("/lobby", { nickname: userName, players: result.players });
    } else {
      alert("Failed to join game. Please try again.");
    }
  });
}
