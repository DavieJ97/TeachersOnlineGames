const BOARD_SIZE = 10;
const SHIP_LENGTHS = [1, 2, 3, 3, 4];

const setupScreen = document.getElementById("setup-screen");
const mainScreen = document.getElementById("main-screen");

const startButton = document.getElementById("start-game-btn");
const loadLessonButton = document.getElementById("load-lesson-btn");
const lessonFileInput = document.getElementById("lesson-file");
const lessonInfo = document.getElementById("lesson-info");
const lessonName = document.getElementById("lesson-name");
const lessonQuestionCount = document.getElementById("lesson-question-count");

const turnMessage = document.getElementById("turn-message");
const questionGrid = document.getElementById("question-grid");

const questionOverlay = document.getElementById("question-overlay");
const instruction = document.getElementById("instruction");
const questionBox = document.getElementById("question-box");
const answerBox = document.getElementById("answer-box");
const showAnswerButton = document.getElementById("show-answer-btn");
const correctButton = document.getElementById("correct-btn");
const incorrectButton = document.getElementById("incorrect-btn");

const rewardOverlay = document.getElementById("reward-overlay");
const rewardTitle = document.getElementById("reward-title");
const rewardMessage = document.getElementById("reward-message");
const startAttackButton = document.getElementById("finish-attack-btn");

const winnerOverlay = document.getElementById("winner-overlay");
const winnerMessage = document.getElementById("winner-message");
const playAgainButton = document.getElementById("play-again-btn");

const missileRacks = [
    document.getElementById("team-0-missiles"),
    document.getElementById("team-1-missiles")
];

const missileLayer = document.getElementById("missile-layer");

const MISSILE_OFF =
    "/static/images/games/battleship/other/missile_off.png";

const MISSILE_ON =
    "/static/images/games/battleship/other/missile_on.png";

const boards = [
    document.getElementById("team-0-board"),
    document.getElementById("team-1-board")
];

const teamNames = [
    document.getElementById("team-0-name"),
    document.getElementById("team-1-name")
];

const shipsRemainingLabels = [
    document.getElementById("team-0-ships"),
    document.getElementById("team-1-ships")
];

const rewardMissileReveal = document.getElementById(
    "reward-missile-reveal"
);

const shotsRemainingDisplay = document.getElementById(
    "shots-remaining"
);

const continueOverlay = document.getElementById(
    "continue-overlay"
);

const continueGameButton = document.getElementById(
    "continue-game-btn"
);

const AUDIO_ROOT = "/static/audio/";

const sounds = {
    intro: new Audio(`${AUDIO_ROOT}music/battleship/intro_music.wav`),
    openBoard: new Audio(`${AUDIO_ROOT}sounds/battleship/open_board.wav`),
    questionCard: new Audio(`${AUDIO_ROOT}sounds/battleship/show_question_card.wav`),
    questionText: new Audio(`${AUDIO_ROOT}sounds/battleship/show_question_text.wav`),
    showAnswer: new Audio(`${AUDIO_ROOT}sounds/battleship/show_answer.wav`),
    rewardScreen: new Audio(`${AUDIO_ROOT}sounds/battleship/show_reward_screen.wav`),
    rewardText: new Audio(`${AUDIO_ROOT}sounds/battleship/show_reward_text.wav`),
    missile: new Audio(`${AUDIO_ROOT}sounds/battleship/show_missile.wav`),
    fly: new Audio(`${AUDIO_ROOT}sounds/battleship/fly_missile.wav`),
    hit: new Audio(`${AUDIO_ROOT}sounds/battleship/hit_sound.wav`),
    miss: new Audio(`${AUDIO_ROOT}sounds/battleship/miss_sound.wav`)
};

Object.values(sounds).forEach(sound => {
    sound.preload = "auto";
});

sounds.intro.loop = false;
sounds.intro.volume = 0.45;

let introHasPlayed = false;

const demoQuestions = [
    {
        instruction: "Unscramble the word",
        question: "llohe",
        answer: "hello"
    },
    {
        instruction: "Translate the word",
        question: "Cat",
        answer: "Cat"
    },
    {
        instruction: "What is the opposite of big?",
        question: "",
        answer: "Small"
    },
    {
        instruction: "Spell the word",
        question: "An animal with a trunk",
        answer: "Elephant"
    },
    {
        instruction: "Complete the sentence",
        question: "I ___ to school every day.",
        answer: "go"
    },
    {
        instruction: "Name a colour",
        question: "What colour is the sky on a clear day?",
        answer: "Blue"
    }
];

const game = {
    sourceQuestions: demoQuestions,
    questions: [],
    currentQuestion: null,
    currentTeam: 0,
    teams: [],
    shotsRemaining: 0,
    phase: "setup",
    isOver: false
};

function createBoard() {
    return Array.from(
        { length: BOARD_SIZE * BOARD_SIZE },
        (_, index) => ({
            index,
            shipId: null,
            status: "untouched"
        })
    );
}

function createTeam(name) {
    const team = {
        name,
        board: createBoard(),
        ships: []
    };

    SHIP_LENGTHS.forEach((length, shipId) => {
        placeShip(team, length, shipId);
    });

    return team;
}

function placeShip(team, length, shipId) {
    let placed = false;

    while (!placed) {
        const horizontal = Math.random() < 0.5;
        const row = Math.floor(Math.random() * BOARD_SIZE);
        const column = Math.floor(Math.random() * BOARD_SIZE);

        if (
            horizontal &&
            column + length > BOARD_SIZE
        ) {
            continue;
        }

        if (
            !horizontal &&
            row + length > BOARD_SIZE
        ) {
            continue;
        }

        const positions = [];

        for (let step = 0; step < length; step++) {
            const targetRow = row + (horizontal ? 0 : step);
            const targetColumn = column + (horizontal ? step : 0);

            positions.push(
                targetRow * BOARD_SIZE + targetColumn
            );
        }

        const overlapsShip = positions.some(position => {
            return team.board[position].shipId !== null;
        });

        if (overlapsShip) {
            continue;
        }

        positions.forEach(position => {
            team.board[position].shipId = shipId;
        });

        team.ships.push({
            id: shipId,
            length,
            positions,
            sunk: false
        });

        placed = true;
    }
}

function startGame() {
    playIntroMusicOnce();
    playSound(sounds.openBoard);
    sounds.intro.pause()

    game.questions = game.sourceQuestions.map(question => ({
        ...question,
        used: false
    }));

    game.teams = [
        createTeam("Team Blue"),
        createTeam("Team Red")
    ];

    game.currentTeam = 0;
    game.shotsRemaining = 0;
    game.currentQuestion = null;
    game.phase = "question";
    game.isOver = false;

    winnerOverlay.hidden = true;
    rewardOverlay.hidden = true;

    setupScreen.hidden = true;
    mainScreen.hidden = false;

    updateGameScreen();
}

function updateGameScreen() {
    updateTeamLabels();
    renderBoards();
    renderQuestionGrid();
    updateTurnMessage();
}

function updateTeamLabels() {
    game.teams.forEach((team, index) => {
        const shipsRemaining = team.ships.filter(ship => {
            return !ship.sunk;
        }).length;

        teamNames[index].textContent = team.name;

        shipsRemainingLabels[index].textContent =
            `Ships remaining: ${shipsRemaining}`;
        renderMissileRacks();
    });
}

function updateTurnMessage() {
    if (game.isOver) {
        return;
    }

    if (game.phase === "attack") {
        const defender = getDefendingTeamIndex();

        turnMessage.textContent =
            `${game.teams[game.currentTeam].name}, fire at ` +
            `${game.teams[defender].name}'s board. ` +
            `${game.shotsRemaining} shot` +
            `${game.shotsRemaining === 1 ? "" : "s"} remaining.`;

        return;
    }

    turnMessage.textContent =
        `${game.teams[game.currentTeam].name}, ` +
        "choose a question card.";
}

function renderBoards() {
    game.teams.forEach((team, teamIndex) => {
        const boardElement = boards[teamIndex];

        boardElement.innerHTML = "";

        const corner = document.createElement("div");
        corner.className = "board-corner";
        boardElement.appendChild(corner);

        for (let column = 0; column < BOARD_SIZE; column++) {
            const columnLabel = document.createElement("div");

            columnLabel.className = "column-label";
            columnLabel.textContent = String.fromCharCode(65 + column);

            boardElement.appendChild(columnLabel);
        }

        for (let row = 0; row < BOARD_SIZE; row++) {
            const rowLabel = document.createElement("div");

            rowLabel.className = "row-label";
            rowLabel.textContent = row + 1;

            boardElement.appendChild(rowLabel);

            for (let column = 0; column < BOARD_SIZE; column++) {
                const index = row * BOARD_SIZE + column;
                const cell = team.board[index];

                const square = document.createElement("button");

                square.type = "button";
                square.className = "board-cell";
                square.dataset.boardIndex = index;

                const coordinate =
                    `${String.fromCharCode(65 + column)}${row + 1}`;

                square.setAttribute(
                    "aria-label",
                    `${team.name}, square ${coordinate}`
                );

                if (cell.status === "hit") {
                    square.classList.add("is-hit");
                    square.setAttribute(
                        "aria-label",
                        `${team.name}, square ${coordinate}: hit`
                    );
                }

                if (cell.status === "miss") {
                    square.classList.add("is-miss");
                    square.setAttribute(
                        "aria-label",
                        `${team.name}, square ${coordinate}: miss`
                    );
                }

                const canAttack =
                    game.phase === "attack" &&
                    teamIndex === getDefendingTeamIndex() &&
                    cell.status === "untouched";

                if (canAttack) {
                    square.classList.add("attackable");

                    square.addEventListener("click", () => {
                        fireAt(teamIndex, index, square);
                    });
                } else {
                    square.disabled = true;
                }

                boardElement.appendChild(square);
            }
        }
        team.ships
            .filter(ship => ship.sunk)
            .forEach(ship => {
                renderSunkShip(boardElement, ship);
            });
    });
}

function renderSunkShip(boardElement, ship) {
    const shipSquares = ship.positions.map(position => {
        return boardElement.querySelector(
            `[data-board-index="${position}"]`
        );
    });

    if (shipSquares.some(square => !square)) {
        return;
    }

    const boardRect = boardElement.getBoundingClientRect();
    const squareRects = shipSquares.map(square => {
        return square.getBoundingClientRect();
    });

    const left = Math.min(...squareRects.map(rect => rect.left));
    const top = Math.min(...squareRects.map(rect => rect.top));
    const right = Math.max(...squareRects.map(rect => rect.right));
    const bottom = Math.max(...squareRects.map(rect => rect.bottom));

    const width = right - left;
    const height = bottom - top;

    const isHorizontal = width >= height;

    const shipOverlay = document.createElement("div");
    const shipImage = document.createElement("img");

    shipOverlay.className = "sunk-ship";

    if (!isHorizontal) {
        shipOverlay.classList.add("is-vertical");
    }

    shipImage.src =
        `/static/images/games/battleship/other/${ship.length}_ship.png`;

    shipImage.alt = `Sunk ${ship.length}-square ship`;

    shipOverlay.style.left = `${left - boardRect.left}px`;
    shipOverlay.style.top = `${top - boardRect.top}px`;
    shipOverlay.style.width = `${width}px`;
    shipOverlay.style.height = `${height}px`;

    if (!isHorizontal) {
        shipImage.style.width = `${height}px`;
        shipImage.style.height = `${width}px`;
    }

    shipOverlay.appendChild(shipImage);
    boardElement.appendChild(shipOverlay);
}

function renderQuestionGrid() {
    QuestionGrid.render({
        container: questionGrid,
        items: game.questions,
        getLabel: (question, index) => index + 1,
        isUsed: question => question.used,
        onSelect: ({ index }) => {
            if (game.phase !== "question" || game.isOver) {
                return;
            }

            openQuestion(index);
        }
    });
}

function openQuestion(index) {
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

    playSound(sounds.questionCard);
    questionOverlay.classList.add("show");

    window.setTimeout(() => {
        playSound(sounds.questionText);
    }, 180);
}

function closeQuestion() {
    questionOverlay.classList.remove("show");
    answerBox.hidden = true;
    game.currentQuestion = null;
    renderQuestionGrid();
}

function markIncorrect() {
    closeQuestion();
    endTurn();
}

async function markCorrect() {
    closeQuestion();

    game.shotsRemaining = randomInteger(1, 5);

    await showRewardScreen();
}

async function showRewardScreen() {
    rewardTitle.textContent = "Missile Reward";

    rewardMessage.hidden = true;

    startAttackButton.hidden = true;
    startAttackButton.disabled = true;

    rewardOverlay.hidden = false;

    createRewardMissiles();

    await playSoundAndWait(sounds.rewardScreen, 500);
    await revealRewardMissiles(game.shotsRemaining);

    rewardMessage.textContent =
        `${game.teams[game.currentTeam].name} earned ` +
        `${game.shotsRemaining} missile` +
        `${game.shotsRemaining === 1 ? "" : "s"}!`;

    rewardMessage.hidden = false;

    playSound(sounds.rewardText);

    startAttackButton.textContent = "Start Attack";
    startAttackButton.disabled = false;
    startAttackButton.hidden = false;
}

function createRewardMissiles() {
    rewardMissileReveal.innerHTML = "";

    for (let index = 0; index < 5; index++) {
        const missile = document.createElement("img");

        missile.className = "reward-missile";
        missile.src = MISSILE_OFF;
        missile.alt = "Missile unavailable";

        rewardMissileReveal.appendChild(missile);
    }
}

async function revealRewardMissiles(numberOfMissiles) {
    const missiles = rewardMissileReveal.querySelectorAll(
        ".reward-missile"
    );

    await wait(350);

    for (let index = 0; index < numberOfMissiles; index++) {
        const missile = missiles[index];

        missile.src = MISSILE_ON;
        missile.alt = "Missile ready";
        missile.style.animationDuration =
            `${getSoundDuration(sounds.missile, 550)}ms`;
        missile.classList.add("is-revealed");

        await playSoundAndWait(sounds.missile, 550);
    }
}

function wait(milliseconds) {
    return new Promise(resolve => {
        window.setTimeout(resolve, milliseconds);
    });
}

function beginAttack() {
    rewardOverlay.hidden = true;
    game.phase = "attack";

    renderMissileRacks();
    renderBoards();
    updateTurnMessage();
}

async function fireAt(
    defenderIndex,
    cellIndex,
    targetElement
) {
    if (
        game.phase !== "attack" ||
        defenderIndex !== getDefendingTeamIndex()
    ) {
        return;
    }

    const defender = game.teams[defenderIndex];
    const cell = defender.board[cellIndex];

    if (cell.status !== "untouched") {
        return;
    }

    const activeMissiles = missileRacks[
        game.currentTeam
    ].querySelectorAll(".is-loaded");

    const missileSource =
        activeMissiles[activeMissiles.length - 1];

    if (!missileSource) {
        console.error("No loaded missile was available to animate.");
        game.phase = "attack";
        renderMissileRacks();
        return;
    }

    game.phase = "resolving";
    game.shotsRemaining--;

    /* The rack instantly turns this missile off. */
    renderMissileRacks();

    /* Its visual copy flies to the chosen square. */
    await animateMissile(missileSource, targetElement);

    let impactSound;

    if (cell.shipId === null) {
        cell.status = "miss";
        impactSound = sounds.miss;
    } else {
        cell.status = "hit";
        checkForSunkShip(defender, cell.shipId);
        impactSound = sounds.hit;
    }

    updateTeamLabels();
    renderBoards();
    playSoundOnNextFrame(impactSound);

    if (teamHasLost(defender)) {
        endGame(game.teams[game.currentTeam].name);
        return;
    }

    if (game.shotsRemaining <= 0) {
        endTurn();
        return;
    }

    game.phase = "attack";

    renderBoards();
    updateTurnMessage();
}

function animateMissile(sourceElement, targetElement) {
    return new Promise(resolve => {
        const missile = document.createElement("img");

        const source = sourceElement.getBoundingClientRect();
        const target = targetElement.getBoundingClientRect();

        const startX = source.left + source.width / 2;
        const startY = source.top + source.height / 2;

        const endX = target.left + target.width / 2;
        const endY = target.top + target.height / 2;

        const angle =
            Math.atan2(endY - startY, endX - startX) *
            (180 / Math.PI) + 90;

        missile.className = "flying-missile";
        missile.src = MISSILE_ON;
        missile.alt = "";

        missile.style.left = `${startX}px`;
        missile.style.top = `${startY}px`;

        missile.style.setProperty(
            "--missile-angle",
            `${angle}deg`
        );

        const flightDuration = getSoundDuration(
            sounds.fly,
            720
        );

        missile.style.transitionDuration =
            `${flightDuration}ms, ${flightDuration}ms`;

        missileLayer.appendChild(missile);

        playSound(sounds.fly);

        requestAnimationFrame(() => {
            missile.style.left = `${endX}px`;
            missile.style.top = `${endY}px`;
        });

        missile.addEventListener("transitionend", () => {
            missile.remove();
            resolve();
        }, { once: true });
    });
}

function playIntroMusicOnce() {
    if (introHasPlayed) {
        return;
    }

    introHasPlayed = true;

    sounds.intro.play().catch(() => {
        /* Browsers may block audio until the first user gesture. */
    });
}

function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;

    sound.play().catch(() => {
        /* Keep the game usable if a browser blocks a sound effect. */
    });
}

function playSoundAndWait(sound, fallbackDuration) {
    playSound(sound);

    return wait(getSoundDuration(sound, fallbackDuration));
}

function playSoundOnNextFrame(sound) {
    window.requestAnimationFrame(() => {
        playSound(sound);
    });
}

function getSoundDuration(sound, fallbackDuration) {
    if (Number.isFinite(sound.duration) && sound.duration > 0) {
        return Math.round(sound.duration * 1000);
    }

    return fallbackDuration;
}

function checkForSunkShip(team, shipId) {
    const ship = team.ships.find(item => item.id === shipId);

    const shipIsSunk = ship.positions.every(position => {
        return team.board[position].status === "hit";
    });

    if (shipIsSunk) {
        ship.sunk = true;
    }
}

function teamHasLost(team) {
    return team.ships.every(ship => ship.sunk);
}

function endTurn() {
    game.phase = "question";
    game.shotsRemaining = 0;
    game.currentTeam = getDefendingTeamIndex();

    if (game.questions.every(question => question.used)) {
        showContinuePrompt();
        return;
    }

    renderBoards();
    renderQuestionGrid();
    updateTurnMessage();
}

function showContinuePrompt() {
    game.phase = "continue";
    continueOverlay.hidden = false;
}

function continueGame() {
    game.questions.forEach(question => {
        question.used = false;
    });

    continueOverlay.hidden = true;
    game.phase = "question";

    renderQuestionGrid();
    updateTurnMessage();
}

function endGame(winnerName) {
    game.isOver = true;
    game.phase = "game-over";

    winnerMessage.textContent = winnerName
        ? `${winnerName} sank every ship and wins the battle!`
        : "All question cards have been used. Start a new game to play again.";

    winnerOverlay.hidden = false;
    renderBoards();
}

function getDefendingTeamIndex() {
    return game.currentTeam === 0 ? 1 : 0;
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function loadLessonPack(event) {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    try {
        const { zip, lessonData } = await LessonLoader.load(file);

        for (const question of lessonData.questions) {
            if (question.image) {
                question.image = await LessonLoader.getObjectUrl(
                    zip,
                    `images/${question.image}`
                );
            }
        }

        game.sourceQuestions = lessonData.questions;

        lessonName.textContent =
            lessonData.name || "Untitled Lesson";

        lessonQuestionCount.textContent =
            lessonData.questions.length;

        lessonInfo.hidden = false;
    } catch (error) {
        console.error(error);
        alert("This lesson pack could not be loaded.");
    } finally {
        lessonFileInput.value = "";
    }
}

function renderMissileRacks() {
    game.teams.forEach((team, teamIndex) => {
        const rack = missileRacks[teamIndex];

        rack.innerHTML = "";

        const availableMissiles =
            teamIndex === game.currentTeam &&
            (game.phase === "attack" ||
                game.phase === "resolving")
                ? game.shotsRemaining
                : 0;

        for (let index = 0; index < 5; index++) {
            const missile = document.createElement("img");

            const isLoaded = index < availableMissiles;

            missile.className = "missile-icon";

            if (isLoaded) {
                missile.classList.add("is-loaded");
            }

            missile.src = isLoaded
                ? MISSILE_ON
                : MISSILE_OFF;

            missile.alt = isLoaded
                ? "Missile ready"
                : "Missile unavailable";

            rack.appendChild(missile);
        }
    });
}

/* Battleship is always a two-team game. */

const teamCountInput = document.getElementById("team-count");

if (teamCountInput) {
    teamCountInput.value = 2;
    teamCountInput.disabled = true;
    teamCountInput.parentElement.hidden = true;
}

startButton.addEventListener("click", startGame);

loadLessonButton.addEventListener("click", () => {
    lessonFileInput.click();
});

lessonFileInput.addEventListener("change", loadLessonPack);

showAnswerButton.addEventListener("click", () => {
    answerBox.hidden = !answerBox.hidden;

    if (!answerBox.hidden) {
        playSound(sounds.showAnswer);
    }
});

incorrectButton.addEventListener("click", markIncorrect);

correctButton.addEventListener("click", markCorrect);

startAttackButton.addEventListener("click", beginAttack);

playAgainButton.addEventListener("click", startGame);

continueGameButton.addEventListener("click", continueGame);

document.addEventListener("pointerdown", playIntroMusicOnce, {
    once: true
});
