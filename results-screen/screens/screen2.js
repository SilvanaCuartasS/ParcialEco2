import { navigateTo, makeRequestScreen2 } from "../app.js";

export default function renderScreen2(data) {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div id="screen2">
      <h2>🏆 ¡Ganador: ${data?.winner?.nickname}!</h2>
      <p>Obtuvo ${data?.winner?.score} puntos</p>

      <h3>Ranking:</h3>
      <ol id="ranking-list">
        ${data.rankedPlayers
          .map(
            (player, index) =>
              `<li>${index + 1}. ${player.nickname} (${player.score} pts)</li>`
          )
          .join("")}
      </ol>

      <button id="sort-alpha">Ordenar alfabéticamente</button>
      <button id="reset-btn">Reiniciar Juego</button>

    </div>
  `;

  const resetButton = document.getElementById("reset-btn");


  document.getElementById("sort-alpha").addEventListener("click", () => {
    const sorted = [...data.rankedPlayers].sort((a, b) =>
      a.nickname.localeCompare(b.nickname)
    );
    renderRanking(sorted);
  });

  function renderRanking(players) {
    const rankingList = document.getElementById("ranking-list");
    rankingList.innerHTML = players
      .map(
        (player, index) =>
          `<li>${index + 1}. ${player.nickname} (${player.score} pts)</li>`
      )
      .join("");
  }

  resetButton.addEventListener("click", async () => {
    await makeRequestScreen2("/api/game/reset-game", "POST");
    navigateTo("/"); 
  });
}
