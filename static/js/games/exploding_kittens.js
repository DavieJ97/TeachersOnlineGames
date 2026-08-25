// ==============================
// HTML ELEMENTS
// ==============================

const scoreboard = document.getElementById("scoreboard");
const currentTeamLabel = document.getElementById("current-team");
const startButton = document.getElementById("start-game-btn");
const loadLessonButton = document.getElementById("load-lesson-btn");
const lessonFileInput = document.getElementById("lesson-file");
const lessonInfo = document.getElementById("lesson-info");
const lessonGrade = document.getElementById("lesson-grade");
const lessonName = document.getElementById("lesson-name");
const lessonQuestionCount = document.getElementById("lesson-question-count");

// ==============================
// SCREEN ELEMENTS
// ==============================

const setupScreen = document.getElementById("setup-screen");
const mainScreen = document.getElementById("main-screen");

// ==============================
// QUESTION GRID
// ==============================

const animationLayer = document.getElementById("animation-layer");
const questionGrid = document.getElementById("question-grid");
const questionOverlay = document.getElementById("question-overlay");
const questionBox = document.getElementById("question-box");
const questionImage = document.getElementById("question-image");
const answerBox = document.getElementById("answer-box");
const instruction = document.getElementById("instruction");
const showAnswerButton = document.getElementById("show-answer-btn");
const incorrectButton = document.getElementById("incorrect-btn");
const correctButton = document.getElementById("correct-btn");

// ==============================
// REWARD ELEMENTS
// ==============================

const rewardOverlay = document.getElementById("reward-overlay");
const drawnCards = document.getElementById("drawn-cards");
const temporaryScore = document.getElementById("temporary-score");
const temporaryScoreLabel = document.getElementById("temporary-score-label");
const rewardTitle = document.getElementById("reward-title");
const drawButton = document.getElementById("draw-btn");
const stopButton = document.getElementById("stop-btn");
const returnButton = document.getElementById("return-btn");
const cardRect=drawnCards.getBoundingClientRect();
const rewardWindow=document.getElementById("reward-window");
const GAME_SETTINGS = {
    SPECIAL_EVENT_CHANCE: 1 / 6,
    NUCLEAR_CHANCE: 0.10,
    REWARD_DECK_SIZE: 12,
    MAX_CARD_VALUE: 5
};
const CARD_TYPES = {

    POINTS: {
        type: "points",
        folder: "normal_cards"
    },

    BOMB: {
        type: "bomb",
        folder: "normal_cards",
        image: "bomb.png"
    },

    NUCLEAR: {
        type: "nuclear",
        folder: "normal_cards",
        image: "nuclear.png"
    },

    SWAP: {
        type: "swap",
        folder: "special_cards",
        image: "change.png"
    },

    LOSE_ALL: {
        type: "lose_all",
        folder: "special_cards",
        image: "Lose_all.png"
    }

};
const REWARD_MODES = {
    NORMAL: "normal",
    SPECIAL: "special"
};
const SOUNDPATHS = "/static/audio/sounds/exploding_kittens/";
const MUSICPATHS = "/static/audio/music/exploding_kittens/";

const swapOverlay = document.getElementById("swap-overlay");
const swapTeamList = document.getElementById("swap-team-list");
const cancelSwapButton = document.getElementById("cancel-swap-btn");
let rewardActive = false;

// ==============================
// AUDIO ELEMENTS
// ==============================

const sounds = {

    music: new Audio(MUSICPATHS + "Battle Theme - Kitty Letter Music EXTENDED (Exploding Kittens Inc & The Oatmeal).mp3"),

    draw: new Audio(SOUNDPATHS + "wind-swoosh-short-289744.mp3"),

    bomb: new Audio(SOUNDPATHS + "medium-explosion-cat.mp3"),

    nuclear: new Audio(SOUNDPATHS + "Dan Dan Dannnnnnnn!!! Sound Effect.mp3"),

    correct: new Audio(SOUNDPATHS + "correct-6033.mp3"),

    // wrong: new Audio(SOUNDPATHS + "wrong.mp3"),

    loseAll: new Audio(SOUNDPATHS + "Oh No (Instrumental) - Kreepa(cut edition).mp3"),

    swap: new Audio(SOUNDPATHS + "tada-military-3-183975.mp3"),

    special: new Audio(SOUNDPATHS + "heavenly-choir-of-angels-322708.mp3"),

    click: new Audio(SOUNDPATHS + "button-202966.mp3")

};

sounds.music.loop = true;
sounds.music.volume = 0.35;

// ==============================
// GAME STATE
// ==============================

const game = {

    // Current screen
    currentScreen: "setup",

    // Team information
    numberOfTeams: 2,
    currentTeam: 0,
    teams: [],

    // Lesson information
    lesson: null,
    questions: [],
    currentQuestion: null,

    // Reward system
    specialCard: null,
    teamScores: [],
    rewardMode: null,
    rewardDeck: [],
    temporaryScore: 0,

    // Future use
    soundsEnabled: true

};


// ==============================
// SHOW SCREENS
// ==============================

function showSetupScreen() {

    GameUI.showOnly(
        setupScreen,
        [mainScreen]
    );

    game.currentScreen = "setup";

}



function showMainScreen() {

    GameUI.showOnly(
        mainScreen,
        [setupScreen]
    );

    game.currentScreen = "main";

}



// ==============================
// START GAME
// ==============================

game.questions = [

    {
        instruction:"Unscramble the word",
        question:"llohe",
        answer:"hello",
        used:false
    },

    {
        instruction:"Translate",
        question:"Cat",
        answer:"고양이",
        used:false
    },

    {
        instruction:"Spell the word",
        question:"Elephant",
        answer:"Elephant",
        used:false
    }

];

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


function startGame() {

    const body = document.body;
    body.style.backgroundImage = "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('/static/images/games/exploding_kittens/backgrounds/main_background.png')";

    const teamInput = document.getElementById("team-count");
    sounds.music.play();

    game.numberOfTeams = parseInt(teamInput.value);

    game.teams = [];

    for (let i = 0; i < game.numberOfTeams; i++) {

        game.teams.push({
            score: 0
        });

    }

    game.currentTeam = 0;

    updateScoreboard();

    createQuestionGrid();

    showMainScreen();

}

// ==============================
// SCOREBOARD
// ==============================

function updateScoreboard() {

    Scoreboard.render({
        container: scoreboard,
        currentTeamLabel: currentTeamLabel,
        teams: game.teams,
        currentTeam: game.currentTeam
    });
}

function addPoints(points) {

    game.teams[game.currentTeam].score += points;

    updateScoreboard();

}

function nextTeam() {

    game.currentTeam++;

    if (game.currentTeam >= game.numberOfTeams) {

        game.currentTeam = 0;

    }

    updateScoreboard();

}

function createQuestionGrid() {
    QuestionGrid.render({
        container: questionGrid,
        items: game.questions,
        getLabel: (question, index) => index + 1,
        isUsed: (question) => question.used,
        clickSound: sounds.click,
        onSelect: ({ item, index, card }) => {
            item.used = true;
            openQuestion(card, index);
        }
    });
}

function openQuestion(card, index) {

    const question = game.questions[index];

    game.currentQuestion = index;

    instruction.textContent = question.instruction;

    answerBox.textContent = question.answer;
    answerBox.style.display = "none";

    if (question.image) {

        questionImage.hidden = false;

        questionImage.src = question.image;

    }

    sounds.music.volume = 0.1;

    animateCard(card);

}

function animateCard(card) {

    const rect = card.getBoundingClientRect();

    const clone = card.cloneNode(true);

    clone.classList.add("flying-card");

    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.width = rect.width + "px";
    clone.style.height = rect.height + "px";

    animationLayer.appendChild(clone);

    card.style.visibility = "hidden";

    const startX = rect.left;
    const startY = rect.top;

    const endX = window.innerWidth / 2 - rect.width / 2;
    const endY = window.innerHeight / 2 - rect.height / 2;

    const duration = 700;

    const startTime = performance.now();

    function animate(time){

        let progress = (time - startTime) / duration;

        if(progress > 1)
            progress = 1;

        // Smooth easing
        const ease = 1 - Math.pow(1-progress,3);

        // Position
        const x = startX + (endX-startX)*ease;
        const y = startY + (endY-startY)*ease;

        // Nice little arc
        const arc = Math.sin(progress*Math.PI)*80;

        // Scale
        const scale = 1 + (2*ease);

        // Rotation
        const rotate = 180*ease;

        clone.style.left = x + "px";
        clone.style.top = (y-arc) + "px";

        clone.style.transform =
            `scale(${scale}) rotateY(${rotate}deg)`;

        if(progress < 1){

            requestAnimationFrame(animate);

        }else{

            clone.remove();

            questionOverlay.classList.add("show");

        }

    }
    sounds.draw.play();
    requestAnimationFrame(animate);

}

function incorrectAnswer(){

    // sounds.wrong.play();

    closeQuestion();

    nextTeam();

}

function correctAnswer(){

    sounds.correct.play();

    closeQuestion();

    showRewardScreen();

}

function closeQuestion(){

    questionOverlay.classList.remove("show");

    answerBox.style.display = "none";

    game.currentQuestion = null;

    createQuestionGrid();

}

function showRewardScreen(){
    drawnCards.innerHTML = "";

    sounds.music.volume = 0.35;
    
    rewardActive = true;

    game.temporaryScore = 0;

    temporaryScore.textContent = "0";

    drawnCards.textContent = "";

    rewardOverlay.classList.add("show");

    rollRewardScenario();

    drawButton.disabled = false;
    stopButton.disabled = false;

}

function rollRewardScenario() {

    if (Math.random() < GAME_SETTINGS.SPECIAL_EVENT_CHANCE) {

        setupSpecialReward();

    } else {

        setupNormalReward();

    }

}

function setupNormalReward(){

    game.rewardMode = REWARD_MODES.NORMAL;

    rewardTitle.textContent = "Draw Cards for Points!";

    drawButton.textContent = "Draw";

    stopButton.textContent = "Stop";

    temporaryScore.hidden = false;
    temporaryScoreLabel.innerHTML = "Temporary Score ";

    createNormalRewardDeck();

}

function setupSpecialReward(){
    drawnCards.hidden = true;
    game.rewardMode = REWARD_MODES.SPECIAL;

    rewardTitle.textContent = "Special Event!";

    drawButton.textContent = "Show";

    stopButton.textContent = "5 Points";

    temporaryScore.hidden = true;
    temporaryScoreLabel.innerHTML = "Show<br>or<br>5 Points";

    game.specialCard =
        Math.random() < 0.5
            ? CARD_TYPES.SWAP
            : CARD_TYPES.LOSE_ALL;
    setTimeout(() => {
        drawnCards.hidden = false;
        sounds.special.currentTime = 0;
        sounds.special.play();

        rewardWindow.classList.add("special-event");

        drawnCards.classList.remove("special-intro");
        drawnCards.classList.add("special-animate");
    }, 1000);

}

function closeRewardScreen(){

    rewardOverlay.classList.remove("show");

}

function animateRewardCard(card){

    const cardDiv=document.createElement("div");

    cardDiv.className="reward-card";

    cardDiv.innerHTML=`

        <img class="reward-card-back"
             src="/static/images/games/exploding_kittens/cards/back_of_card.png">

        <img class="reward-card-front"
             src="/static/images/games/exploding_kittens/cards/${card.folder}/${card.image}">

    `;

    drawnCards.appendChild(cardDiv);

    let flipDelay = 10;

    if (card.folder === "normal_cards") {

        requestAnimationFrame(() => {

            cardDiv.classList.add("move");

        });

        flipDelay = 800;

    }

    setTimeout(() => {

        cardDiv.classList.add("flip");
        sounds.draw.play();

    }, flipDelay);

    return cardDiv;
}

function drawNormalCard() {

    if (game.rewardDeck.length === 0) {

        stopDrawing();

        return;

    }

    const card = game.rewardDeck.shift();
    let cardDiv;

    switch (card.type) {

        case CARD_TYPES.POINTS:
            cardDiv = animateRewardCard(card);
            if (rewardActive === true) {
                game.temporaryScore += card.value;
            }
            setTimeout(() => {
                temporaryScore.textContent = game.temporaryScore;
            }, 1000);

            break;

        case CARD_TYPES.BOMB:
            cardDiv = animateRewardCard(card);
            drawButton.disabled = true;
            stopButton.disabled = true;
            if (rewardActive === true) {
                game.temporaryScore = 0;
            }

            setTimeout(() => {
                temporaryScore.textContent = "0";
                cardDiv.classList.add("bomb");

                drawnCards.classList.add("explode");
                rewardWindow.classList.add("shake");

                temporaryScore.classList.add("score-hit");
                sounds.bomb.play();
            }, 1200);

            setTimeout(() => {

                drawnCards.classList.remove("explode");

                temporaryScore.classList.remove("score-hit");
                rewardWindow.classList.remove("shake");

            }, 1800);

            break;

        case CARD_TYPES.NUCLEAR:
            cardDiv = animateRewardCard(card);

            drawButton.disabled = true;
            stopButton.disabled = true;
            if (rewardActive === true) {
                setTimeout(() => {
                    temporaryScore.textContent = "0";
                    sounds.nuclear.play();
                }, 900);

                for (let i = 0; i < game.teams.length; i++) {

                    game.teams[i].score = 0; 

                }    
            }
            break;

    }

}

function showSpecialCard() {
    drawButton.disabled = true;
    stopButton.disabled = true;
    switch (game.specialCard) {

        case CARD_TYPES.SWAP:
            // TODO: Change text to images
            animateRewardCard(CARD_TYPES.SWAP);

            sounds.swap.play();
            if (rewardActive === true) {
                setTimeout(() => {

                    showSwapSelection();

                }, 2000);
            }

            break;

        case CARD_TYPES.LOSE_ALL:
            // TODO: Change text to images
            animateRewardCard(CARD_TYPES.LOSE_ALL);
            if (rewardActive === true) {
                game.teams[game.currentTeam].score = 0;
                sounds.loseAll.play();
            }

            break;

    }

}

function createNormalRewardDeck() {

    game.rewardDeck = [];

    // Create random number cards
    for (let i = 0; i < GAME_SETTINGS.REWARD_DECK_SIZE; i++) {
        const value = Math.floor(Math.random() * GAME_SETTINGS.MAX_CARD_VALUE) + 1;

        game.rewardDeck.push({

            type: CARD_TYPES.POINTS,

            value: value,

            folder: CARD_TYPES.POINTS.folder,

            image: `+${value}.png`

        });

    }

    // Always add one bomb
    game.rewardDeck.push({

        type: CARD_TYPES.BOMB,
        folder: CARD_TYPES.BOMB.folder,
        image: CARD_TYPES.BOMB.image

    });

    // Small chance of adding a nuclear card
    if (Math.random() < GAME_SETTINGS.NUCLEAR_CHANCE) {

        game.rewardDeck.push({

            type: CARD_TYPES.NUCLEAR,
            folder: CARD_TYPES.NUCLEAR.folder,
            image: CARD_TYPES.NUCLEAR.image

        });

    }

    shuffleDeck();
    console.log(game.rewardDeck);

}

function shuffleDeck() {

    for (let i = game.rewardDeck.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [game.rewardDeck[i], game.rewardDeck[j]] =
        [game.rewardDeck[j], game.rewardDeck[i]];

    }

}

function stopDrawing() {

    if (game.rewardMode == REWARD_MODES.NORMAL) {

        game.teams[game.currentTeam].score += game.temporaryScore;

    }
    else if (game.rewardMode == REWARD_MODES.SPECIAL) {

        game.teams[game.currentTeam].score += 5;

    }

    rewardActive = false;
    stopButton.disabled = true;

}

function showSwapSelection() {

    swapTeamList.innerHTML = "";

    game.teams.forEach((team, index) => {

        // Don't allow swapping with yourself
        if (index === game.currentTeam) return;

        const button = document.createElement("button");

        button.className = "swap-team-button";

        button.textContent =
            `Team ${index + 1} (${team.score} points)`;

        button.addEventListener("click", () => {

            swapTeamScores(index);

        });

        swapTeamList.appendChild(button);

    });

    swapOverlay.classList.add("show");

}

function swapTeamScores(otherTeam) {
    console.log(game.teams);
    const temp = game.teams[game.currentTeam].score;

    game.teams[game.currentTeam].score =
        game.teams[otherTeam].score;

    game.teams[otherTeam].score = temp;

    swapOverlay.classList.remove("show");

}

function returnToSetup() {
    updateScoreboard();
    closeRewardScreen();
    nextTeam();
}

document.querySelectorAll("button").forEach(button => {

    button.addEventListener("click", () => {

        sounds.click.play();

    });

});

startButton.addEventListener("click", startGame);

loadLessonButton.addEventListener("click", () => {

    lessonFileInput.click();

});

lessonFileInput.addEventListener("change", loadLessonPack);

showAnswerButton.addEventListener("click", ()=>{

    answerBox.style.display = "block";

});

incorrectButton.addEventListener("click", incorrectAnswer);

correctButton.addEventListener("click", correctAnswer);

drawButton.addEventListener("click", () => {
    if (game.rewardMode === REWARD_MODES.NORMAL) {

        drawNormalCard();

    }
    else {

        showSpecialCard();

    }

});

returnButton.addEventListener("click", returnToSetup);

stopButton.addEventListener("click", stopDrawing);

cancelSwapButton.addEventListener("click", () => {

    swapOverlay.classList.remove("show");

});

