const cards = [
  "Os melhores profissionais deixam a empresa por causa da liderança, não do trabalho.",
  "As decisões ficam concentradas em poucas pessoas e tudo demora mais do que deveria.",
  "Os líderes gastam mais tempo apagando incêndios do que construindo o futuro.",
  "As pessoas deixam de propor ideias porque não sentem segurança para se expor.",
  "O conhecimento fica preso nas pessoas e não se transforma em capacidade do time.",
  "Os conflitos são evitados até virarem problemas muito maiores.",
  "Os líderes mais técnicos têm dificuldade para desenvolver outras pessoas e acabam virando gargalos.",
  "As mudanças acontecem, mas a cultura não acompanha a velocidade do negócio.",
  "Sem feedback de qualidade, talentos crescem mais devagar e erros se repetem.",
  "Sem feedback de qualidade, talentos crescem mais devagar e erros se repetem."
];
const socket = io();
const $ = id => document.getElementById(id);
let isHost = false;
let submitted = false;
let currentRoom;

function enter(result) {
  if (!result.ok) return showError(result.error);
  isHost = result.isHost;
  document.body.classList.add("in-room");
  $("home").classList.add("hidden"); $("app").classList.remove("hidden");
  $("room-code").textContent = result.code;
  document.querySelectorAll(".host-only").forEach(el => el.classList.toggle("hidden", !isHost));
  document.querySelectorAll(".guest-only").forEach(el => el.classList.toggle("hidden", isHost));
  history.replaceState(null, "", `?sala=${result.code}&modo=${isHost ? "organizador" : "participante"}`);
}
function credentials() { return { name: $("name").value, code: $("code").value }; }
function showError(message) { $("home-error").textContent = message || "Informe seu nome e tente novamente."; }
$("create").onclick = () => socket.emit("room:create", credentials(), enter);
$("join").onclick = () => socket.emit("room:join", credentials(), enter);
$("start").onclick = () => socket.emit("phase:set", { phase: "ranking" });
$("show-results").onclick = () => socket.emit("phase:set", { phase: "results" });
$("copy").onclick = async () => {
  const participantUrl = new URL("/", location.origin);
  participantUrl.searchParams.set("sala", currentRoom?.code || $("room-code").textContent);
  participantUrl.searchParams.set("modo", "participante");
  await navigator.clipboard.writeText(participantUrl.toString());
  toast("Link dos participantes copiado!");
};
$("submit").onclick = () => {
  const order = [...$("cards").children].map(el => Number(el.dataset.id));
  socket.emit("ranking:submit", { order }, result => {
    if (!result.ok) return toast(result.error);
    const wasSubmitted = submitted;
    submitted = true;
    $("submit").textContent = "Reenviar ordem";
    toast(wasSubmitted ? "Ordem atualizada!" : "Ordem enviada! Você ainda pode alterá-la.");
  });
};

function renderCards() {
  const order = [...cards.keys()].sort(() => Math.random() - .5);
  $("cards").innerHTML = order.map(i => `<article class="card" draggable="true" data-id="${i + 1}"><span class="handle">⋮⋮</span><b>${String(i + 1).padStart(2,"0")}</b><p>${cards[i]}</p><span><button type="button" data-move="up" aria-label="Mover para cima">↑</button> <button type="button" data-move="down" aria-label="Mover para baixo">↓</button></span></article>`).join("");
  let dragged;
  $("cards").addEventListener("dragstart", e => { dragged = e.target.closest(".card"); dragged?.classList.add("dragging"); });
  $("cards").addEventListener("dragend", () => { dragged?.classList.remove("dragging"); dragged = null; });
  $("cards").addEventListener("dragover", e => {
    e.preventDefault(); const target = e.target.closest(".card");
    if (!dragged || !target || target === dragged) return;
    const box = target.getBoundingClientRect();
    $("cards").insertBefore(dragged, e.clientY < box.top + box.height / 2 ? target : target.nextSibling);
  });
  $("cards").addEventListener("click", e => {
    const button = e.target.closest("[data-move]");
    const card = button?.closest(".card");
    if (!card) return;
    if (button.dataset.move === "up" && card.previousElementSibling) card.parentElement.insertBefore(card, card.previousElementSibling);
    if (button.dataset.move === "down" && card.nextElementSibling) card.parentElement.insertBefore(card.nextElementSibling, card);
  });
}
renderCards();

socket.on("room:update", room => {
  currentRoom = room;
  ["lobby", "ranking", "results", "completed"].forEach(id => $(id).classList.add("hidden"));
  if (room.phase === "results") {
    $(isHost ? "results" : "completed").classList.remove("hidden");
  } else {
    $(room.phase).classList.remove("hidden");
  }
  $("count").textContent = room.participants.length;
  $("people").innerHTML = room.participants.map(p => `<span>${escapeHtml(p.name)}${p.submitted ? " ✓" : ""}</span>`).join("");
  $("progress").textContent = `${room.submissionCount} de ${room.participants.length} enviaram`;
  if (isHost) $("show-results").classList.toggle("hidden", room.submissionCount === 0);
  if (isHost && room.results) renderResults(room.results);
});
socket.on("room:closed", () => { alert("O facilitador encerrou a sala."); location.href = "/"; });
socket.on("results:individual", submissions => {
  if (!isHost) return;
  $("individual-results").innerHTML = submissions.map(submission => `
    <article class="individual-vote">
      <h3>${escapeHtml(submission.name)}</h3>
      <ol>${submission.order.map(cardId => `<li><b>${String(cardId).padStart(2, "0")}</b><span>${cards[cardId - 1]}</span></li>`).join("")}</ol>
    </article>
  `).join("");
});
socket.on("results:own", submission => {
  if (isHost) return;
  $("own-result-list").innerHTML = submission.order.map(cardId => `
    <li><b>${String(cardId).padStart(2, "0")}</b><span>${cards[cardId - 1]}</span></li>
  `).join("");
});

function renderResults(results) {
  $("result-list").innerHTML = results.map((r, i) => `<article><span class="position">${i + 1}º</span><b>${String(r.cardId).padStart(2,"0")}</b><p>${cards[r.cardId - 1]}</p><span class="score">${r.score} pts · ${r.firstPlaces} voto(s) em 1º</span></article>`).join("");
}
function escapeHtml(value) { const d = document.createElement("div"); d.textContent = value; return d.innerHTML; }
function toast(message) { $("toast").textContent = message; $("toast").classList.add("on"); setTimeout(() => $("toast").classList.remove("on"), 1800); }

const accessParams = new URLSearchParams(location.search);
const param = accessParams.get("sala");
const participantMode = accessParams.get("modo") === "participante";
if (param) $("code").value = param.toUpperCase();
if (participantMode) {
  $("creator-entry").classList.add("hidden");
  $("participant-entry").classList.remove("hidden");
  $("access-title").innerHTML = "Entre na <em>dinâmica</em>";
  $("access-description").textContent = param
    ? `Você foi convidado para a sala ${param.toUpperCase()}. Informe seu nome para participar.`
    : "Informe seu nome e o código enviado pelo facilitador para participar.";
}
