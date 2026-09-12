import { pokemon, questions, environments, pinEnvironments, pokeballs, pokeballStatusData, backGroundImgs} from "../shared/pokemon_data.js";

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
    // Future use
    soundsEnabled: true

};

game.questions = questions;

async function loadLessonPack(event) {

    const file = event.target.files[0];

    if (!file) {

        return;

    }

    try {

        const zip = await JSZip.loadAsync(file);

        const jsonText =
            await zip.file("lesson.json").async("string");

        const lessonData = JSON.parse(jsonText);

        // Load every image from the zip
        for (const question of lessonData.questions) {

            if (question.image) {

                question.image =
                    await LessonLoader.getObjectUrl(
                        zip,
                        "images/" + question.image
                    );
            }

        }

        game.lesson = lessonData;

        game.questions = lessonData.questions;

        console.log(game.lesson);

        // Update lesson info
        lessonName.textContent =
            game.lesson.name || "Untitled Lesson";

        lessonQuestionCount.textContent =
            game.questions.length;

        lessonInfo.hidden = false;

        alert("Lesson loaded successfully!");

    }
    catch (error) {

        console.error(error);

        alert("Invalid lesson pack.");

    }

}

function showMainScreen() {

    GameUI.showOnly(
        mainScreen,
        [setupScreen]
    );

    game.currentScreen = "main";

}

function updateScoreboard() {

    Scoreboard.render({
        container: scoreboard,
        currentTeamLabel: currentTeamLabel,
        teams: game.teams,
        currentTeam: game.currentTeam,
        pokemonHunters: true
    });
}

function create_pins(){
    for (let i = 0; i < game.questions.length; i++){
        if (i < game.questions.length-3 ){
            let pin_drop = document.createElement("button");
            pin_drop.className = "map-location question-location";
            pin_drop.dataset.question = i + 1;
            let pin_image = document.createElement("img");
            pin_image.src = "/static/images/games/pokemon_hunters/buttons/location_button.png";
            pin_image.alt = "pin-drop";
            let number = document.createElement("span");
            number.className = "location-number";
            number.textContent = i + 1;
            pin_drop.appendChild(pin_image);
            pin_drop.appendChild(number);
            question_map.appendChild(pin_drop)
            pin_drop.addEventListener("click", handleNormalPinClick);
        } else {
            let letter = "";
            if (i == game.questions.length-3){
                letter = "A";
            } else if (i == game.questions.length-2){
                letter = "B";
            } else if (i == game.questions.length-1){
                letter  = "C";
            };
            let pin_drop = document.createElement("button");
            pin_drop.className = "map-location special-location";
            pin_drop.dataset.special = letter;
            let pin_image = document.createElement("img");
            pin_image.src = "/static/images/games/pokemon_hunters/buttons/special_button.png";
            pin_image.alt = "special-pin-drop";
            let number = document.createElement("span");
            number.className = "location-number";
            number.textContent = letter;
            pin_drop.hidden = true
            pin_drop.appendChild(pin_image);
            pin_drop.appendChild(number);
            question_map.appendChild(pin_drop)
            pin_drop.addEventListener("click", handleSpecialPinClick);
        };
    };
}

function startGame (){
    const body = document.body;
    body.style.backgroundColor = "#1855bf";

    const teamInput = document.getElementById("team-count");

    game.numberOfTeams = parseInt(teamInput.value);

    game.teams = [];

    for (let i = 0; i < game.numberOfTeams; i++) {

        game.teams.push({
            score: 0
        });

    }

    game.currentTeam = 0;

    updateScoreboard();
    create_pins();
    showMainScreen();
    
}

function displayOverlay(index){

    clearRewardObjects();
    textDisplay.style.display = "none";
    exitButton.style.display = "none";
    textDisplay.textContent = "";
    characterArm.src = characterPath + "character_arm_1.png";
    characterArm.classList.remove("character-arm-2");
    characterArm.classList.add("character-arm-1");

    game.currentEnvironment = pinEnvironments[index];
    game.currentEnvironData = environments.find(env => env.name === game.currentEnvironment);

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

    answerBox.textContent = question.answer || "";
    answerBox.hidden = true;

    rewardOverlay.classList.add("show");
    questionOverlay.classList.add("show");
    showAnswerButton.onclick = showAnswer;
    correctButton.onclick = playRewardScreen;
    incorrectButton.onclick = () => exitRewardOverlay(0);

}

async function handleNormalPinClick(event){
    const pin_button = event.currentTarget;
    pin_button.classList.add("clicked");
    let index = pin_button.dataset.question;
    displayOverlay(index);
}

async function handleSpecialPinClick(event){
    const pin_button = event.currentTarget;
    pin_button.classList.add("clicked");
    let index = 0;
    const specialIndexMap = {
        A: game.questions.length - 3,
        B: game.questions.length - 2,
        C: game.questions.length - 1
    };

    index = specialIndexMap[pin_button.dataset.special];
    displayOverlay(index);
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

function playRewardScreen(){
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
    console.log(`Reward: ${reward}`);
    clearRewardObjects();
    textDisplay.style.display = "none";
    exitButton.style.display = "none";
    textDisplay.textContent = "";
    questionOverlay.classList.remove("show");
    rewardOverlay.classList.remove("show");
    game.teams[game.currentTeam].score += reward;
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

function createPokeball(){
   game.currentPokeballs.forEach((ball, index) => {

        const ballObject = document.createElement("img");

        ballObject.src = ball.imageUrl;

        ballObject.className = "pokeball";

        ballObject.dataset.index = index;
        console.log(ball.status)
        ballObject.classList.add(
            ball.status.glowClass
        );

        rewardWindow.appendChild(ballObject);
        ballObject.addEventListener("click",() => {
            playPokeball(index);
        });
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

        missedPokemon();
        return {
            isCaught: false,
            xpEarned: 0
        };
    }

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
    const selectedBall = game.currentPokeballs[index];

    rewardWindow.querySelectorAll(".pokeball").forEach(ball => ball.remove());
    playThrowAnimation();

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
loadLessonButton.addEventListener("click", loadLessonPack);