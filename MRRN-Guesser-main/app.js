const TOTAL_LOCATIONS = 20;
const ROUNDS_PER_GAME = 5;
const ROUND_SECONDS = 20;
const MAP_SIZE = 720;

const coordinates = {
  1: { x: 435, y: 225 },
  2: { x: 500, y: 115 },
  3: { x: 535, y: 135 },
  4: { x: 530, y: 45 },
  5: { x: 480, y: 215 },
  6: { x: 485, y: 255 },
  7: { x: 485, y: 315 },
  8: { x: 435, y: 295 },
  9: { x: 445, y: 345 },
  10: { x: 420, y: 350 },
  11: { x: 430, y: 390 },
  12: { x: 435, y: 435 },
  13: { x: 370, y: 430 },
  14: { x: 410, y: 470 },
  15: { x: 335, y: 450 },
  16: { x: 360, y: 370 },
  17: { x: 295, y: 395 },
  18: { x: 290, y: 435 },
  19: { x: 385, y: 400 },
  20: { x: 385, y: 325 },
};

const els = {
  startScreen: document.getElementById("startScreen"),
  gameScreen: document.getElementById("gameScreen"),
  finalScreen: document.getElementById("finalScreen"),
  startButton: document.getElementById("startButton"),
  leaderboardLink: document.getElementById("leaderboardLink"),
  roundText: document.getElementById("roundText"),
  timerText: document.getElementById("timerText"),
  scoreText: document.getElementById("scoreText"),
  photoStage: document.getElementById("photoStage"),
  locationImage: document.getElementById("locationImage"),
  mapPanel: document.getElementById("mapPanel"),
  miniGuessMarker: document.getElementById("miniGuessMarker"),
  mapOverlay: document.getElementById("mapOverlay"),
  expandedMap: document.getElementById("expandedMap"),
  guessMarker: document.getElementById("guessMarker"),
  actualFlag: document.getElementById("actualFlag"),
  roundResult: document.getElementById("roundResult"),
  distanceText: document.getElementById("distanceText"),
  roundScoreText: document.getElementById("roundScoreText"),
  nextButton: document.getElementById("nextButton"),
  finalScore: document.getElementById("finalScore"),
  shareButton: document.getElementById("shareButton"),
  shareDialog: document.getElementById("shareDialog"),
  shareForm: document.getElementById("shareForm"),
  usernameInput: document.getElementById("usernameInput"),
  usernameError: document.getElementById("usernameError"),
  leaderboardDialog: document.getElementById("leaderboardDialog"),
  leaderboardList: document.getElementById("leaderboardList"),
  closeLeaderboard: document.getElementById("closeLeaderboard"),
  confettiCanvas: document.getElementById("confettiCanvas"),
};

const sounds = {
  amongUs: document.getElementById("audioAmongUs"),
  countdown: document.getElementById("audioCountdown"),
  bomb: document.getElementById("audioBomb"),
  fah: document.getElementById("audioFah"),
  ding: document.getElementById("audioDing"),
  pvz: document.getElementById("audioPvz"),
  vineBoom: document.getElementById("audioVineBoom"),
};

let state = {
  locations: [],
  roundIndex: 0,
  totalScore: 0,
  timer: ROUND_SECONDS,
  intervalId: null,
  hasGuessed: false,
  currentGuess: null,
};

function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function stopSound(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function shuffle(values) {
  return values
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((entry) => entry.value);
}

function setMarkerPosition(element, point) {
  element.style.left = `${(point.x / MAP_SIZE) * 100}%`;
  element.style.top = `${(point.y / MAP_SIZE) * 100}%`;
}

function getMapPoint(event) {
  const rect = els.expandedMap.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * MAP_SIZE;
  const y = ((event.clientY - rect.top) / rect.height) * MAP_SIZE;
  return {
    x: Math.max(0, Math.min(MAP_SIZE, x)),
    y: Math.max(0, Math.min(MAP_SIZE, y)),
  };
}

function calculateDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function calculateScore(distance) {
  if (distance < 10) return 5000;
  if (distance > 1000) return 0;
  return Math.round((1 - (distance - 10) / 990) * 5000);
}

function startGame() {
  state = {
    locations: shuffle(Array.from({ length: TOTAL_LOCATIONS }, (_, index) => index + 1)).slice(0, ROUNDS_PER_GAME),
    roundIndex: 0,
    totalScore: 0,
    timer: ROUND_SECONDS,
    intervalId: null,
    hasGuessed: false,
    currentGuess: null,
  };

  els.startScreen.classList.add("hidden");
  els.finalScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  updateTopBar();
  startRound();
}

function startRound() {
  clearInterval(state.intervalId);
  stopSound(sounds.countdown);
  state.timer = ROUND_SECONDS;
  state.hasGuessed = false;
  state.currentGuess = null;

  els.mapOverlay.classList.add("hidden");
  els.roundResult.classList.add("hidden");
  els.nextButton.classList.add("hidden");
  els.guessMarker.classList.add("hidden");
  els.actualFlag.classList.add("hidden");
  els.miniGuessMarker.classList.add("hidden");
  els.photoStage.classList.add("is-loading");

  updateTopBar();
  setTimeout(() => {
    const locationId = state.locations[state.roundIndex];
    els.locationImage.src = `Assets/Locations/${locationId}.jpg`;
    els.locationImage.onload = () => {
      els.photoStage.classList.remove("is-loading");
      playSound(sounds.amongUs);
    };
  }, 350);

  playSound(sounds.countdown);
  state.intervalId = setInterval(() => {
    state.timer -= 1;
    updateTopBar();
    if (state.timer <= 0) {
      finishRound(null, true);
    }
  }, 1000);
}

function updateTopBar() {
  els.roundText.textContent = `${Math.min(state.roundIndex + 1, ROUNDS_PER_GAME)}/${ROUNDS_PER_GAME}`;
  els.timerText.textContent = `${state.timer}`;
  els.scoreText.textContent = `${state.totalScore}`;
}

function openMap() {
  if (els.gameScreen.classList.contains("hidden")) return;
  els.mapOverlay.classList.remove("hidden");
}

function finishRound(guess, timedOut = false) {
  if (state.hasGuessed) return;

  clearInterval(state.intervalId);
  stopSound(sounds.countdown);
  state.hasGuessed = true;

  const locationId = state.locations[state.roundIndex];
  const actual = coordinates[locationId];
  const effectiveGuess = guess || { x: MAP_SIZE, y: MAP_SIZE };
  const distance = calculateDistance(effectiveGuess, actual);
  const roundScore = timedOut ? 0 : calculateScore(distance);

  state.currentGuess = guess;
  state.totalScore += roundScore;
  updateTopBar();

  if (guess) {
    setMarkerPosition(els.guessMarker, guess);
    setMarkerPosition(els.miniGuessMarker, guess);
    els.guessMarker.classList.remove("hidden");
    els.miniGuessMarker.classList.remove("hidden");
  }

  setMarkerPosition(els.actualFlag, actual);
  els.actualFlag.classList.remove("hidden");
  els.distanceText.textContent = `Distance: ${Math.round(distance)} px`;
  els.roundScoreText.textContent = `Score: ${roundScore}`;
  els.roundResult.classList.remove("hidden");
  els.nextButton.textContent = state.roundIndex === ROUNDS_PER_GAME - 1 ? "Finish" : "Next";
  els.nextButton.classList.remove("hidden");
  els.mapOverlay.classList.remove("hidden");

  if (timedOut || roundScore < 1000) {
    playSound(sounds.bomb);
  } else if (roundScore < 2500) {
    playSound(sounds.fah);
  } else if (roundScore < 4500) {
    playSound(sounds.ding);
  } else {
    playSound(sounds.pvz);
  }
}

function nextRound() {
  state.roundIndex += 1;
  if (state.roundIndex >= ROUNDS_PER_GAME) {
    showFinal();
    return;
  }
  startRound();
}

function showFinal() {
  clearInterval(state.intervalId);
  stopSound(sounds.countdown);
  els.gameScreen.classList.add("hidden");
  els.mapOverlay.classList.add("hidden");
  els.finalScreen.classList.remove("hidden");
  els.finalScore.textContent = `${state.totalScore}`;
}

function validateUsername(username) {
  const trimmed = username.trim();
  const banned = ["admin", "moderator", "owner", "fuck", "shit", "bitch", "cunt", "nigger", "nigga", "fag"];
  if (trimmed.length < 2 || trimmed.length > 18) {
    return { ok: false, value: trimmed, message: "Use 2 to 18 characters." };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { ok: false, value: trimmed, message: "Use letters, numbers, _ or - only." };
  }
  const lowered = trimmed.toLowerCase();
  if (banned.some((word) => lowered.includes(word))) {
    return { ok: false, value: trimmed, message: "Choose a different username." };
  }
  return { ok: true, value: trimmed, message: "" };
}

async function submitScore(event) {
  event.preventDefault();
  const result = validateUsername(els.usernameInput.value);
  els.usernameError.textContent = result.message;
  if (!result.ok) return;

  try {
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: result.value, score: state.totalScore }),
    });
    if (!response.ok) throw new Error("Score upload failed");
    els.shareDialog.classList.add("hidden");
    await showLeaderboard();
  } catch (error) {
    els.usernameError.textContent = "Start the local server to upload scores.";
  }
}

async function showLeaderboard() {
  els.leaderboardDialog.classList.remove("hidden");
  startConfetti();
  els.leaderboardList.innerHTML = "<li>Loading...<span></span></li>";

  try {
    const response = await fetch("/api/scores");
    if (!response.ok) throw new Error("Leaderboard unavailable");
    const scores = await response.json();
    if (!scores.length) {
      els.leaderboardList.innerHTML = "<li>No scores yet<span></span></li>";
      return;
    }
    els.leaderboardList.innerHTML = scores
      .map((entry) => `<li>${escapeHtml(entry.username)}<span>${entry.score}</span></li>`)
      .join("");
  } catch (error) {
    els.leaderboardList.innerHTML = "<li>Start the local server for scores<span></span></li>";
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char];
  });
}

function closeLeaderboard() {
  els.leaderboardDialog.classList.add("hidden");
}

function startConfetti() {
  const canvas = els.confettiCanvas;
  const context = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);

  const colors = ["#1473e6", "#ffcc00", "#ef4444", "#10b981", "#ffffff"];
  const pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * rect.width,
    y: -20 - Math.random() * rect.height,
    size: 5 + Math.random() * 7,
    speed: 2 + Math.random() * 4,
    drift: -1.5 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
  }));
  const started = performance.now();

  function draw(now) {
    context.clearRect(0, 0, rect.width, rect.height);
    pieces.forEach((piece) => {
      piece.x += piece.drift;
      piece.y += piece.speed;
      piece.rotation += 0.08;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.55);
      context.restore();
    });
    if (now - started < 1800) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, rect.width, rect.height);
    }
  }

  requestAnimationFrame(draw);
}

els.startButton.addEventListener("click", startGame);
els.mapPanel.addEventListener("click", openMap);
els.expandedMap.addEventListener("click", (event) => {
  if (state.hasGuessed) return;
  const guess = getMapPoint(event);
  playSound(sounds.vineBoom);
  setMarkerPosition(els.guessMarker, guess);
  els.guessMarker.classList.remove("hidden");
  finishRound(guess);
});
els.nextButton.addEventListener("click", nextRound);
els.shareButton.addEventListener("click", () => {
  els.usernameInput.value = "";
  els.usernameError.textContent = "";
  els.shareDialog.classList.remove("hidden");
  els.usernameInput.focus();
});
els.shareForm.addEventListener("submit", submitScore);
els.leaderboardLink.addEventListener("click", showLeaderboard);
els.closeLeaderboard.addEventListener("click", closeLeaderboard);
