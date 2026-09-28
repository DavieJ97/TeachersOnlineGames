import { questions, environments, pinEnvironments, pokeballs } from "../shared/pokemon_data.js";

const setupScreen = document.getElementById("setup-screen");
const mainScreen = document.getElementById("main-screen");

const scoreboard = document.getElementById("scoreboard");
const currentTeamLabel = document.getElementById("current-team");
const lessonGrade = document.getElementById("lesson-grade");
const lessonName = document.getElementById("lesson-name");
const lessonQuestionCount = document.getElementById("lesson-question-count");
const startButton = document.getElementById("start-game-btn");
const loadLessonButton = document.getElementById("load-lesson-btn");
const lessonFileInput = document.getElementById("lesson-file");
const lessonInfo = document.getElementById("lesson-info");

// Reward overlay elements
const rewardOverlay = document.getElementById("reward-overlay");
const rewardWindow = document.getElementById("reward-window");
const questionOverlay = document.getElementById("question-overlay")
const instruction = document.getElementById("instruction");
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const showAnswerButton = document.getElementById("show-answer-btn");
const correctButton = document.getElementById("correct-btn");
const incorrectButton = document.getElementById("incorrect-btn");
const character = document.getElementById("character");
const characterArm = document.getElementById("character_arm");
const textDisplay = document.getElementById("text-display");
const exitButton = document.getElementById("exit-button");

const question_map = document.getElementById("question_map");

const characterPath = "/static/images/games/pokemon_hunters/other/";

const characterFrames = [
    new Image(),
    new Image(),
    new Image()
];

characterFrames[0].src = characterPath + "character_1.png";
characterFrames[1].src = characterPath + "character_2.png";
characterFrames[2].src = characterPath + "character_3.png";

const game = {

    // Team information
    numberOfTeams: 2,
    currentTeam: 0,
    teams: [],

    // Lesson information
    lesson: null,
    questions: [],
    currentQuestion: null,

    // Reward system
    currentEnvironment: null,
    currentEnvironData: null,
    currentPokemon: null,
    currentBackGround: null,
    currentPokeballs: null,
    lessonObjectUrls: [],
    overlayOpen: false,
    rewardStarted: false,
    // Future use
    soundsEnabled: true

};

const sounds = {
    mainTheme: new Audio("/static/audio/music/pokemon_hunters/main_music.wav"),
    question: new Audio("/static/audio/music/pokemon_hunters/question_music.mp3"),
    clickPin: new Audio("/static/audio/sounds/pokemon_hunters/click_question.mp3"),
    clickSpecialPin: new Audio("/static/audio/sounds/pokemon_hunters/click_special_question.mp3"),
    hitPokemon: new Audio("/static/audio/sounds/pokemon_hunters/hit.mp3"),
    catch: new Audio("/static/audio/sounds/pokemon_hunters/pokeball_open.wav"),
    miss: new Audio("/static/audio/sounds/pokemon_hunters/run.wav")
};

game.questions = questions;

function validateLesson(lessonData) {
    if (!lessonData || typeof lessonData !== "object" || Array.isArray(lessonData)) {
        throw new Error("The lesson file must contain a lesson object.");
    }
    if (lessonData.game !== "pokemon_hunters") {
        throw new Error("This lesson pack is not for Pokemon Hunters.");
    }
    if (!Array.isArray(lessonData.questions)) {
        throw new Error("The lesson pack must contain a questions array.");
    }
    if (lessonData.questions.length < 3 || lessonData.questions.length > 47) {
        throw new Error("Pokemon Hunters needs between 3 and 47 questions.");
    }

    lessonData.questions.forEach((question, index) => {
        const questionNumber = index + 1;
        if (!question || typeof question !== "object" || Array.isArray(question)) {
            throw new Error(`Question ${questionNumber} must be a question object.`);
        }
        const hasText = typeof question.question === "string" && question.question.trim();
        const hasImage = typeof question.image === "string" && question.image.trim();
        if (!hasText && !hasImage) {
            throw new Error(`Question ${questionNumber} needs text or an image.`);
        }
        const hasAnswer =
            (typeof question.answer === "string" && question.answer.trim()) ||
            (typeof question.answer === "number" && Number.isFinite(question.answer));
        if (!hasAnswer) {
            throw new Error(`Question ${questionNumber} needs an answer.`);
        }
        if (hasImage) {
            const imagePath = question.image.replace(/\\/g, "/");
            if (imagePath.startsWith("/") || imagePath.split("/").some(part => !part || part === "." || part === "..")) {
                throw new Error(`Question ${questionNumber} has an invalid image path.`);
            }
        }
    });

    return lessonData;
}

async function loadLessonPack(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const newObjectUrls = [];
    try {
        const { zip, lessonData } = await LessonLoader.load(file);
        validateLesson(lessonData);

        for (const question of lessonData.questions) {
            if (question.image) {
                const objectUrl = await LessonLoader.getObjectUrl(
                    zip,
                    `images/${question.image.replace(/\\/g, "/")}`
                );
                newObjectUrls.push(objectUrl);
                question.image = objectUrl;
            }
        }

        game.lessonObjectUrls.forEach(URL.revokeObjectURL);
        game.lessonObjectUrls = newObjectUrls;
        game.lesson = lessonData;
        game.questions = lessonData.questions;
        lessonGrade.textContent = lessonData.grade || "-";
        lessonName.textContent = lessonData.name || "Untitled Lesson";
        lessonQuestionCount.textContent = game.questions.length;
        lessonInfo.hidden = false;
        alert("Lesson loaded successfully!");
    } catch (error) {
        newObjectUrls.forEach(URL.revokeObjectURL);
        console.error(error);
        alert(error.message || "Invalid lesson pack.");
    } finally {
        lessonFileInput.value = "";
    }
}

function showMainScreen() {
    GameUI.showOnly(mainScreen, [setupScreen]);
    game.currentScreen = "main";
}

function updateScoreboard() {
    Scoreboard.render({
        container: scoreboard,
        currentTeamLabel,
        teams: game.teams,
        currentTeam: game.currentTeam,
        pokemonHunters: true
    });
}

function create_pins() {
    question_map.querySelectorAll(".map-location").forEach(pin => pin.remove());

    game.questions.forEach((question, index) => {
        const isSpecial = index >= game.questions.length - 3;
        const letter = isSpecial ? ["A", "B", "C"][index - (game.questions.length - 3)] : "";
        const pin = document.createElement("button");
        const pinImage = document.createElement("img");
        const label = isSpecial ? `Special location ${letter}` : `Question ${index + 1}`;

        pin.type = "button";
        pin.className = isSpecial ? "map-location special-location" : "map-location question-location";
        pin.setAttribute("aria-label", label);
        pin.dataset.questionIndex = index;
        pinImage.src = isSpecial
            ? "/static/images/games/pokemon_hunters/buttons/special_location_button.png"
            : "/static/images/games/pokemon_hunters/buttons/location_button.png";
        pinImage.alt = "";

        if (isSpecial) {
            pin.dataset.special = letter;
        } else {
            pin.dataset.question = index + 1;
        }

        const number = document.createElement("span");
        number.className = "location-number";
        number.textContent = isSpecial ? letter : index + 1;
        pin.append(pinImage, number);
        pin.addEventListener("click", isSpecial ? handleSpecialPinClick : handleNormalPinClick);
        question_map.appendChild(pin);
    });
}

function startGame() {
    try {
        validateLesson({ game: "pokemon_hunters", questions: game.questions });
    } catch (error) {
        alert(error.message);
        return;
    }
    sounds.mainTheme.loop = true;
    sounds.mainTheme.volume = 0.8;
    sounds.mainTheme.play().catch(err => console.warn("Failed to play main theme:", err));
    document.body.style.backgroundImage = "none";
    document.body.style.backgroundColor = "#1d59bc";
    const teamInput = document.getElementById("team-count");
    game.numberOfTeams = Math.min(6, Math.max(2, Number.parseInt(teamInput.value, 10) || 2));
    teamInput.value = game.numberOfTeams;
    game.teams = Array.from({ length: game.numberOfTeams }, () => ({ score: 0 }));
    game.currentTeam = 0;
    updateScoreboard();
    create_pins();
    showMainScreen();
}

function displayOverlay(index, environmentKey = index + 1) {
    if (game.overlayOpen || !Number.isInteger(index) || !game.questions[index]) return;
    sounds.mainTheme.pause();
    sounds.mainTheme.currentTime = 0;
    sounds.question.loop = true;
    sounds.question.volume = 0.2;
    sounds.question.play().catch(err => console.warn("Failed to play question music:", err));

    clearRewardObjects();
    game.overlayOpen = true;
    game.rewardStarted = false;
    textDisplay.style.display = "none";
    exitButton.style.display = "none";
    textDisplay.textContent = "";
    characterArm.src = characterPath + "character_arm_1.png";
    characterArm.classList.remove("character-arm-2");
    characterArm.classList.add("character-arm-1");

    game.currentEnvironment = pinEnvironments[environmentKey];
    game.currentEnvironData = environments.find(env => env.name === game.currentEnvironment);
    if (!game.currentEnvironData?.backgrounds?.length || !game.currentEnvironData?.pokemon?.length) {
        game.overlayOpen = false;
        console.error(`No complete environment is configured for map pin ${environmentKey}.`);
        return;
    }

    game.currentBackGround =
        game.currentEnvironData.backgrounds[
            Math.floor(Math.random() * game.currentEnvironData.backgrounds.length)
        ]; 
    let displayedBackground = game.currentBackGround.imageUrl;


    rewardWindow.style.backgroundImage = `url(${displayedBackground})`;

    const question = game.questions[index];

    question.used = true;
    game.currentQuestion = index;

    instruction.textContent =
        question.instruction || "Answer the question";

    questionBox.replaceChildren();

    const questionText = document.createElement("p");

    questionText.className = "mb-0";
    questionText.textContent = question.question || "";

    questionBox.appendChild(questionText);

    if (question.image) {
        const image = document.createElement("img");

        image.src = question.image;
        image.alt = "Question image";
        image.className = "img-fluid mt-3";

        questionBox.appendChild(image);
    }

    answerBox.textContent = question.answer ?? "";
    answerBox.hidden = true;

    rewardOverlay.classList.add("show");
    questionOverlay.classList.add("show");
    showAnswerButton.onclick = showAnswer;
    correctButton.onclick = playRewardScreen;
    incorrectButton.onclick = () => exitRewardOverlay(0);

}

function handleNormalPinClick(event) {
    const pinButton = event.currentTarget;
    if (game.overlayOpen) return;
    pinButton.disabled = true;
    pinButton.classList.add("clicked");
    sounds.clickPin.currentTime = 0;
    sounds.clickPin.play().catch(err => console.warn("Failed to play click pin sound:", err));
    displayOverlay(Number(pinButton.dataset.questionIndex));
}

function handleSpecialPinClick(event) {
    const pinButton = event.currentTarget;
    if (game.overlayOpen) return;
    pinButton.disabled = true;
    pinButton.classList.add("clicked");
    sounds.clickSpecialPin.currentTime = 0;
    sounds.clickSpecialPin.play().catch(err => console.warn("Failed to play click special pin sound:", err));
    displayOverlay(Number(pinButton.dataset.questionIndex), pinButton.dataset.special);
}

function showAnswer(){
    answerBox.hidden = false;
}

function nextTeam() {

    game.currentTeam++;

    if (game.currentTeam >= game.numberOfTeams) {

        game.currentTeam = 0;

    }

    updateScoreboard();

}

function playRewardScreen() {
    if (!game.overlayOpen || game.rewardStarted) return;
    sounds.question.volume = 0.8;
    game.rewardStarted = true;
    questionOverlay.classList.remove("show");
    game.currentPokemon = getRandomPokemon(game.currentEnvironData.pokemon);
    const pokemonObject = document.createElement("img");
    pokemonObject.src = game.currentPokemon.imageUrl;
    pokemonObject.className = "pokemon";
    pokemonObject.style.bottom = game.currentBackGround.bottom;
    pokemonObject.style.left = game.currentBackGround.left;
    pokemonObject.style.height = game.currentPokemon.height;
    rewardWindow.appendChild(pokemonObject);
    game.currentPokeballs = [
        getRandomPokeball(),
        getRandomPokeball(),
        getRandomPokeball(),
    ];
    createPokeball();
}

function exitRewardOverlay(reward = 0){
    if (!game.overlayOpen) return;
    sounds.question.pause();
    sounds.question.currentTime = 0;
    sounds.mainTheme.play().catch(err => console.warn("Failed to play main theme:", err));
    console.log(`Reward: ${reward}`);
    clearRewardObjects();
    textDisplay.style.display = "none";
    exitButton.style.display = "none";
    textDisplay.textContent = "";
    questionOverlay.classList.remove("show");
    rewardOverlay.classList.remove("show");
    game.teams[game.currentTeam].score += reward;
    game.overlayOpen = false;
    game.rewardStarted = false;
    nextTeam();
}

function clearRewardObjects() {
    rewardWindow.querySelectorAll(".pokemon, .pokeball, .projectile, .projectile-glow")
        .forEach(object => object.remove());

    exitButton.onclick = null;

    const projectileLayer = document.getElementById("projectile-layer");

    if (projectileLayer) {
        projectileLayer.replaceChildren();
    }
}

function createPokeball() {
    game.currentPokeballs.forEach((ball, index) => {
        const ballButton = document.createElement("button");
        const ballImage = document.createElement("img");
        ballButton.type = "button";
        ballButton.className = `pokeball ${ball.status.glowClass}`;
        ballButton.dataset.index = index;
        ballButton.setAttribute("aria-label", `Throw Pokeball ${index + 1}`);
        ballButton.title = `Catch chance ${ball.status.catchChance}%, XP multiplier ${ball.status.xpMultiplier}`;
        ballImage.src = ball.imageUrl;
        ballImage.alt = "";
        ballButton.appendChild(ballImage);
        ballButton.addEventListener("click", () => playPokeball(index));
        rewardWindow.appendChild(ballButton);
    });
}

function getRandomPokeball() {

    const ballKeys = Object.keys(pokeballs);

    const randomKey =
        ballKeys[Math.floor(Math.random() * ballKeys.length)];

    return pokeballs[randomKey];
}

function getRandomPokemon(pokemonList) {

    const totalWeight = pokemonList.reduce(
        (total, pokemon) => total + pokemon.status,
        0
    );

    let random = Math.random() * totalWeight;

    for (const pokemon of pokemonList) {

        random -= pokemon.status;

        if (random <= 0) {
            return pokemon;
        }
    }
}

function calculateCatchPossibility(ball) {
    const catchChance = Number(ball.status.catchChance) || 0;
    const xpMultiplier = Number(ball.status.xpMultiplier) || 1;
    const pokemonHp = Number(game.currentPokemon?.hp) || 0;
    const roll = Math.random() * 100;
    const isCaught = roll < catchChance;
    const xpEarned = Math.round(pokemonHp * xpMultiplier);
    if (!isCaught) {
        sounds.miss.currentTime = 0;
        sounds.miss.play().catch(err => console.warn("Failed to play miss sound:", err));
        missedPokemon();
        return {
            isCaught: false,
            xpEarned: 0
        };
    }
    sounds.catch.currentTime = 0;
    sounds.catch.play().catch(err => console.warn("Failed to play catch sound:", err));
    catchedPokemon(xpEarned);

    return {
        isCaught: true,
        xpEarned: xpEarned
    };
}

function catchedPokemon(xpEarned = 0) {
    const pokemonNode = document.querySelector(".pokemon");
    const projectile = document.querySelector(".projectile-grounded, .projectile");
    if (!pokemonNode) {
        game.currentPokemon = null;
        return;
    }

    if (projectile) {
        const glow = new Image();
        glow.src = "/static/images/games/pokemon_hunters/other/glow.png";
        glow.className = "projectile-glow";
        glow.alt = "capture glow";
        glow.style.opacity = "1";

        const layer = document.getElementById("projectile-layer");
        const layerRect = layer.getBoundingClientRect();
        const projectileRect = projectile.getBoundingClientRect();

        glow.style.left = `${projectileRect.left - layerRect.left + (projectileRect.width / 2)}px`;
        glow.style.top = `${projectileRect.top - layerRect.top + (projectileRect.height / 2)}px`;

        layer.appendChild(glow);

        const start = performance.now();
        const duration = 900;

        function pulseGlow(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const alpha = 1 - progress;

            glow.style.opacity = String(Math.max(0, alpha));
            glow.style.transform = `translate(-50%, -50%) scale(${0.8 + eased * 0.55})`;

            if (progress < 1) {
                requestAnimationFrame(pulseGlow);
                return;
            }

            glow.remove();
        }

        requestAnimationFrame(pulseGlow);
    }

    const pokemonRect = pokemonNode.getBoundingClientRect();
    const projectileRect = projectile ? projectile.getBoundingClientRect() : pokemonRect;
    const dx = (projectileRect.left + projectileRect.width / 2) - (pokemonRect.left + pokemonRect.width / 2);
    const dy = (projectileRect.top + projectileRect.height / 2) - (pokemonRect.top + pokemonRect.height / 2);

    pokemonNode.style.transition = "transform 0.7s ease, opacity 0.7s ease";
    pokemonNode.style.transform = `translate(${dx * 0.7}px, ${dy * 0.7}px) scale(0.15)`;
    pokemonNode.style.opacity = "0";

    setTimeout(() => {
        if (pokemonNode.parentNode) {
            pokemonNode.parentNode.removeChild(pokemonNode);
        }

        game.currentPokemon = null;
    }, 700);

    console.log(`Pokemon caught! XP earned: ${xpEarned}`);
}

function missedPokemon() {
    const pokemonNode = document.querySelector(".pokemon");

    if (!pokemonNode) {
        game.currentPokemon = null;
        return;
    }

    pokemonNode.style.transition = "transform 0.8s ease, opacity 0.8s ease";
    pokemonNode.style.transform = "translateX(-580px) scale(0.8)";
    pokemonNode.style.opacity = "0";

    setTimeout(() => {
        if (pokemonNode.parentNode) {
            pokemonNode.parentNode.removeChild(pokemonNode);
        }

        game.currentPokemon = null;
    }, 800);

    console.log("Pokemon missed!");
}

function playPokeball(index){
    if (!game.rewardStarted || !game.currentPokeballs?.[index]) return;
    game.rewardStarted = false;
    const selectedBall = game.currentPokeballs[index];

    rewardWindow.querySelectorAll(".pokeball").forEach(ball => ball.remove());
    playThrowAnimation();
    sounds.hitPokemon.currentTime = 0;
    sounds.hitPokemon.play().catch(err => console.warn("Failed to play hit sound:", err));


    setTimeout(() => {
        launchBallToPokemon(selectedBall);
    }, 250);
}

function launchBallToPokemon(ball) {
    launchPokeball(ball, () => {
        const result = calculateCatchPossibility(ball);

        textDisplay.textContent = `XP won: ${result.xpEarned}`;
        textDisplay.style.display = "block";
        exitButton.style.display = "block";
        exitButton.onclick = () => {
            exitRewardOverlay(result.xpEarned);
        };
    });
}

function playThrowAnimation() {

    character.src =
        characterPath + "character_1.png";

    characterArm.src =
        characterPath + "character_arm_1.png";
    characterArm.classList.remove("character-arm-2");
    characterArm.classList.add("character-arm-1");
    characterArm.hidden = false;

    setTimeout(() => {
        characterArm.hidden = true;
        character.src =
            characterPath + "character_2.png";

    }, 120);

    setTimeout(() => {
        character.src =
            characterPath + "character_3.png";

    }, 140);

    setTimeout(() => {
        character.src =
            characterPath + "character_1.png";
        characterArm.src =
            characterPath + "character_arm_2.png";

        characterArm.classList.remove("character-arm-1");
        characterArm.classList.add("character-arm-2");

        characterArm.hidden = false;

    }, 550);
}

function launchPokeball(ball, onLand = null) {
  const projectile = document.createElement("img");
  projectile.src = ball.imageUrl;
  projectile.className = "projectile";

  const start = getHandPosition();
  const end = getPokemonPosition();

  const projectileLayer = document.getElementById("projectile-layer");
  projectileLayer.innerHTML = "";
  projectileLayer.appendChild(projectile);

  projectile.style.left = `${start.x}px`;
  projectile.style.top = `${start.y}px`;
  projectile.style.transform = "scale(0.82)";

  animateProjectileFlight(projectile, start, end, onLand);
}

function animateProjectileFlight(projectile, start, end, onLand = null) {
  const duration = 700;
  const startTime = performance.now();
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  const arcLift = Math.max(110, Math.abs(deltaY) * 0.9 + 80);

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const x = start.x + deltaX * eased;
    const y = start.y + deltaY * eased - Math.sin(progress * Math.PI) * arcLift;
    const scale = 0.82 - progress * 0.18;

    projectile.style.left = `${x}px`;
    projectile.style.top = `${y}px`;
    projectile.style.transform = `scale(${scale})`;

    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }

    triggerImpact(projectile, end, onLand);
  }

  requestAnimationFrame(step);
}

function getHandPosition() {
  const rewardRect = rewardWindow.getBoundingClientRect();
  const characterRect = character.getBoundingClientRect();

  return {
    x: characterRect.right - rewardRect.left - 30,
    y: characterRect.top - rewardRect.top + 80
  };
}

function getPokemonPosition() {
  const rewardRect = rewardWindow.getBoundingClientRect();
  const rawLeft = parseFloat(game.currentBackGround.left) || 56;
  const rawBottom = parseFloat(game.currentBackGround.bottom) || 30;
  const pokemonHeightPercent = parseFloat(game.currentPokemon.height) || 40;

  const leftPx = rewardRect.width * (rawLeft / 100);
  const bottomPx = rewardRect.height * (rawBottom / 100);
  const pokemonHeightPx = rewardRect.height * (pokemonHeightPercent / 100);

  return {
    x: leftPx + 46,
    y: rewardRect.height - bottomPx - (pokemonHeightPx * 0.32)
  };
}

function triggerImpact(projectile, endPosition, onLand = null) {
  const pokemonNode = document.querySelector(".pokemon");

  if (pokemonNode) {
    pokemonNode.classList.remove("pokemon-hit");
    void pokemonNode.offsetWidth;
    pokemonNode.classList.add("pokemon-hit");
  }

  projectile.style.left = `${endPosition.x}px`;
  projectile.style.top = `${endPosition.y}px`;
  projectile.style.transform = "scale(0.72)";

  const fallDistance = 70;
  const fallStart = performance.now();

  function dropBall(now) {
    const elapsed = now - fallStart;
    const progress = Math.min(elapsed / 420, 1);
    const eased = 1 - Math.pow(1 - progress, 2);

    projectile.style.left = `${endPosition.x}px`;
    projectile.style.top = `${endPosition.y + (fallDistance * eased)}px`;
    projectile.style.transform = `scale(${0.72 - (0.04 * eased)}) rotate(${180 * eased}deg)`;

    if (progress < 1) {
      requestAnimationFrame(dropBall);
      return;
    }

    projectile.classList.add("projectile-grounded");
    projectile.style.left = `${endPosition.x}px`;
    projectile.style.top = `${endPosition.y + fallDistance}px`;
    projectile.style.transform = "scale(0.68) rotate(180deg)";

    if (typeof onLand === "function") {
      onLand();
    }
  }

  requestAnimationFrame(dropBall);
}


startButton.addEventListener("click", startGame);
loadLessonButton.addEventListener("click", () => lessonFileInput.click());
lessonFileInput.addEventListener("change", loadLessonPack);

document.addEventListener("keydown", event => {
    if (
        event.key === "Escape" &&
        game.overlayOpen &&
        (questionOverlay.classList.contains("show") || exitButton.style.display === "block")
    ) {
        exitRewardOverlay(0);
    }
});