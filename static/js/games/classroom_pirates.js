// ==============================
// GAME CONFIGURATION
// ==============================

const GAME_CONFIG = {
    GRID_SIZE: 6,
    REWARD_TYPES: {
        COINS: 'coins',
        SHIPS: 'ships',
        TREASURE: 'treasure',
        FIGHT: 'fight',
        RESET: 'reset'
    },
    REWARD_CHANCES: {
        COINS: 0.40,      // 40% - common
        SHIPS: 0.35,      // 35% - common
        TREASURE: 0.10,   // 10% - rare
        FIGHT: 0.10,      // 10% - rare
        RESET: 0.05       // 5% - very rare
    },
    REWARD_VALUES: {
        COINS_MIN: 1,
        COINS_MAX: 5,
        SHIPS_MIN: 1,
        SHIPS_MAX: 3,
        TREASURE: 6,
    }
};

const FIGHT_SCENARIOS = [
    { key: "STEAL_3", description: "Winner can steal 3 points from the loser" },
    { key: "LOSE_ALL", description: "Loser loses all points" },
    { key: "BONUS_10", description: "Winner gains 10 bonus points" },
    { key: "STEAL_5", description: "Winner can steal 5 points from the loser" },
    { key: "SWAP_SCORES", description: "Winner can swap scores with the loser" }
];

const sounds = {
    coin: "/static/audio/sounds/classroom_pirates/coin.mp3",
    ship_cannon: "/static/audio/sounds/classroom_pirates/ship1.mp3",
    ship_break: "/static/audio/sounds/classroom_pirates/ship2.mp3",
    treasure_song: "/static/audio/sounds/classroom_pirates/treasure1.mp3",
    treasure_coins: "/static/audio/sounds/classroom_pirates/treasure2.mp3",
    fight: "/static/audio/sounds/classroom_pirates/fight.mp3",
    reset: "/static/audio/sounds/classroom_pirates/reset.mp3",
    music: new Audio("/static/audio/music/classroom_pirates/Pirates of The Caribbean- EPIC Music [ ezmp3.cc ].mp3"),
    click: "/static/audio/sounds/classroom_pirates/click_btn.mp3"
}

const backtrack = sounds.music
backtrack.loop = true;
backtrack.volume = 0.45;
// ==============================
// HTML ELEMENTS
// ==============================

const setupScreen = document.getElementById("setup-screen");
const mainScreen = document.getElementById("main-screen");
const scoreboard = document.getElementById("scoreboard");
const currentTeamLabel = document.getElementById("current-team");
const gameGrid = document.getElementById("game-grid");
const columnHeadersContainer = document.getElementById("column-headers");
const animationLayer = document.getElementById("animation-layer");
const instructionsCell = document.getElementById("instructions-cell");

// Reward overlay elements
const rewardOverlay = document.getElementById("reward-overlay");
const rewardWindow = document.getElementById("reward-window");
const rewardContent = document.getElementById("reward-content");
const exitRewardButton = document.getElementById("exit-reward-btn");

// Fight overlay elements
const fightOverlay = document.getElementById("fight-overlay");
const fightWindow = document.getElementById("fight-window");
const cancelFightButton = document.getElementById("cancel-fight-btn");

// Setup screen elements
const startButton = document.getElementById("start-game-btn");
const loadLessonButton = document.getElementById("load-lesson-btn");
const lessonFileInput = document.getElementById("lesson-file");
const lessonInfo = document.getElementById("lesson-info");

// ==============================
// GAME STATE
// ==============================

let game = {
    lesson: null,
    lessonZip: null,
    teams: [],
    currentTeam: 0,
    fightOpponent: null,
    boardState: [], // Track which cells have been clicked
    gameActive: false
};

// ==============================
// FRUIT NAMES FOR DEMO
// ==============================

const FRUIT_NAMES = [
    "Apple", "Banana", "Cherry", "Dragon Fruit", "Elderberry", "Fig",
    "Grape", "Honeydew", "Kiwi", "Lemon", "Mango", "Nectarine"
];

// ==============================
// INITIALIZATION
// ==============================

document.addEventListener("DOMContentLoaded", function() {
    initializeGame();
});

function initializeGame() {
    // Load lesson setup handlers
    loadLessonButton.addEventListener("click", () => {
        lessonFileInput.click();
    });

    lessonFileInput.addEventListener("change", handleLessonLoad);
    startButton.addEventListener("click", startGame);
    exitRewardButton.addEventListener("click", closeRewardOverlay);
}

// ==============================
// LESSON LOADING
// ==============================

async function handleLessonLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const loadedLesson =
            await LessonLoader.loadLesson(
                file,
                "classroom_pirates"
            );

        game.lesson = loadedLesson.lessonData;
        game.lessonZip = loadedLesson.zip;

        displayLessonInfo();
    } catch (error) {
        console.error("Error loading lesson:", error);
        alert("Failed to load lesson pack");
    }
}

function displayLessonInfo() {
    const lesson = game.lesson;
    lessonInfo.hidden = false;
    document.getElementById("lesson-grade").textContent = lesson.game || "-";
    document.getElementById("lesson-name").textContent = lesson.instructions?.name || "-";
    document.getElementById("lesson-question-count").textContent = "6 × 6";
}

// ==============================
// GAME START
// ==============================

async function startGame() {
    backtrack.volume = 0.10
    const teamInput = document.getElementById("team-count");
    const teamCount = parseInt(teamInput.value, 10);
    
    game.teams = Array.from({ length: teamCount }, (_, index) => ({
        name: `Team ${index + 1}`,
        score: 0
    }));

    game.currentTeam = 0;

    // Use loaded lesson or create demo
    if (!game.lesson) {
        game.lesson = createDemoLesson();
    }

    // Initialize board state
    game.boardState = new Array(GAME_CONFIG.GRID_SIZE * GAME_CONFIG.GRID_SIZE).fill(false);
    game.gameActive = true;

    // Switch to main screen
    setupScreen.hidden = true;
    mainScreen.hidden = false;

    // Initialize game board and scoreboard
    await initializeGameBoard();
    renderScoreboard();
}

// ==============================
// DEMO LESSON CREATION
// ==============================

function createDemoLesson() {
    const demoLesson = {
        grade: "Demo",
        name: "Practice Game",
        columnHeaders: [],
        rowHeaders: []
    };

    // Create column headers with fruit names
    for (let i = 0; i < GAME_CONFIG.GRID_SIZE; i++) {
        demoLesson.columnHeaders.push({
            name: FRUIT_NAMES[i % FRUIT_NAMES.length],
            image: null
        });
    }

    // Create row headers with fruit names
    for (let i = 0; i < GAME_CONFIG.GRID_SIZE; i++) {
        demoLesson.rowHeaders.push({
            name: FRUIT_NAMES[(i + GAME_CONFIG.GRID_SIZE) % FRUIT_NAMES.length],
            image: null
        });
    }

    return demoLesson;
}

async function getLessonImage(canvas) {

    if (!canvas?.screenshot) {
        return null;
    }

    return await LessonLoader.getObjectUrl(
        game.lessonZip,
        canvas.screenshot
    );
}

// ==============================
// GAME BOARD SETUP
// ==============================

async function initializeGameBoard() {
    const lesson = game.lesson;

    // Setup instruction
    await setupInstructions(lesson.instructions || []);

    // Setup column headers
    await setupColumnHeaders(lesson.columnHeaders || []);

    // Setup grid rows
    await setupGridRows(lesson.rowHeaders || []);

    // Add click listeners to grid cells
    addGridClickListeners();
}

async function setupInstructions(instructions) {

    if (!instructions?.screenshot) {
        return;
    }

    const img =
        document.createElement("img");

    img.src =
        await LessonLoader.getObjectUrl(
            game.lessonZip,
            instructions.screenshot
        );

    img.alt = "Instructions";

    instructionsCell.innerHTML = "";

    instructionsCell.appendChild(img);
}

async function setupColumnHeaders(columnHeaders) {
    // Keep the permanent top-left instructions cell and replace only the six
    // generated cells. A <th> inside a <div> is invalid table markup and can
    // make browsers lay the grid out unpredictably.
    columnHeadersContainer.querySelectorAll(".dynamic-column-header")
        .forEach(header => header.remove());

        
    for (let i = 0; i < GAME_CONFIG.GRID_SIZE; i++) {
        const header = document.createElement("th");
        header.className = "dynamic-column-header";
        const headerContent = document.createElement("div");
        headerContent.className = "header-cell";
        const canvas = columnHeaders[i];
        
        if (canvas?.screenshot) {
            const img = document.createElement("img");
            img.src = await LessonLoader.getObjectUrl(
                    game.lessonZip,
                    canvas.screenshot
                );
            img.alt = `Column ${i + 1}`;
            headerContent.appendChild(img);
        } else {
            const span = document.createElement("span");
            span.className = "placeholder-text";
            span.textContent = canvas?.name || `Column ${i + 1}`;
            headerContent.appendChild(span);
        }

        header.appendChild(headerContent);
        columnHeadersContainer.appendChild(header);
    }
}

async function setupGridRows(rowHeaders) {
    const tbody = gameGrid.querySelector("tbody");

    // Every row is generated below. Keeping the template row created a blank
    // seventh row before the six playable rows.
    tbody.innerHTML = "";

    for (let row = 0; row < GAME_CONFIG.GRID_SIZE; row++) {
        const tr = document.createElement("tr");
        tr.className = "grid-row";
        tr.id = `grid-row-${row}`;

        // Row header cell
        const rowHeaderTd = document.createElement("td");
        rowHeaderTd.className = "row-header";
        const canvas = rowHeaders[row];

        if (canvas?.screenshot) {
            const img = document.createElement("img");
            img.className = "row-header-img";
            img.src = await LessonLoader.getObjectUrl(
                    game.lessonZip,
                    canvas.screenshot
                );
            img.alt = `Row ${row + 1}`;
            rowHeaderTd.appendChild(img);
        } else {
            const span = document.createElement("span");
            span.className = "placeholder-text";
            span.textContent = canvas?.name || `Row ${row + 1}`;
            rowHeaderTd.appendChild(span);
        }

        tr.appendChild(rowHeaderTd);

        // Grid cells
        for (let col = 0; col < GAME_CONFIG.GRID_SIZE; col++) {
            const td = document.createElement("td");
            td.className = "grid-cell";

            const button = document.createElement("button");
            button.className = "cell-button";
            button.dataset.row = row;
            button.dataset.col = col;
            button.dataset.cellIndex = row * GAME_CONFIG.GRID_SIZE + col;

            const img = document.createElement("img");
            img.src = "/static/images/games/classroom_pirates/buttons/cell_x.png";
            img.alt = "?";

            button.appendChild(img);
            td.appendChild(button);
            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    }
}

function addGridClickListeners() {
    const buttons = gameGrid.querySelectorAll(".cell-button");
    buttons.forEach(button => {
        button.addEventListener("click", handleCellClick);
    });
}

async function handleCellClick(event) {
    if (!game.gameActive) return;
    playSound(sounds.click)
    const button = event.currentTarget;
    const cellIndex = parseInt(button.dataset.cellIndex);

    // Check if already clicked
    if (game.boardState[cellIndex]) {
        return;
    }

    // Mark as clicked and disable
    game.boardState[cellIndex] = true;
    button.disabled = true;
    button.classList.add("clicked");

    // Generate and display reward
    const reward = generateReward();
    await displayReward(reward);
}

// ==============================
// REWARD GENERATION & DISPLAY
// ==============================

function generateReward() {
    const random = Math.random();
    let cumulativeChance = 0;

    for (const [type, chance] of Object.entries(GAME_CONFIG.REWARD_CHANCES)) {
        cumulativeChance += chance;
        if (random <= cumulativeChance) {
            return createRewardObject(type);
        }
    }

    // Fallback to coins
    return createRewardObject('COINS');
}

function createRewardObject(type) {
    const config = GAME_CONFIG.REWARD_VALUES;
    let reward = { type: type };

    switch (type) {
        case 'COINS':
            reward.amount = Math.floor(Math.random() * (config.COINS_MAX - config.COINS_MIN + 1)) + config.COINS_MIN;
            reward.points = reward.amount;
            break;
        case 'SHIPS':
            reward.amount = Math.floor(Math.random() * (config.SHIPS_MAX - config.SHIPS_MIN + 1)) + config.SHIPS_MIN;
            reward.points = -reward.amount;
            break;
        case 'TREASURE':
            reward.points = config.TREASURE;
            break;
        case 'FIGHT':
            reward.points = 0; // Points awarded after choosing target
            break;
        case 'RESET':
            reward.points = 0; // Special handling
            break;
    }

    return reward;
}

async function displayReward(reward) {
    rewardContent.innerHTML = "";

    showRewardOverlay();

    // Give browser a frame to render the overlay
    await new Promise(requestAnimationFrame);

    switch (reward.type) {
        case 'COINS':
            await displayCoinsReward(reward);
            break;
        case 'SHIPS':
            await displayShipsReward(reward);
            break;
        case 'TREASURE':
            await displayTreasureReward(reward);
            break;
        case 'FIGHT':
            await displayFightReward(reward);
            break;
        case 'RESET':
            await displayResetReward(reward);
            break;
    }

}

// ===== COIN ANIMATION =====

async function displayCoinsReward(reward) {
    const container = document.createElement("div");
    container.className = "reward-coins-container";

    const coinsDisplay = document.createElement("div");
    coinsDisplay.className = "coins-display";

    // Wait 1 second before the first ship appears
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < reward.amount; i++) {
        const coin = document.createElement("div");
        const delay = i * 0.30;
        coin.className = "coin";
        coin.style.animationDelay = `${delay}s`;

        const coinImg = document.createElement("img");
        coinImg.src = "/static/images/games/classroom_pirates/other/coin.png";
        coinImg.alt = "Coin";

        coin.appendChild(coinImg);
        coinsDisplay.appendChild(coin);
        // Play sound when this coin starts falling
        setTimeout(() => {
            playSound(sounds.coin);
        }, delay * 1200);
    }

    container.appendChild(coinsDisplay);
    rewardContent.appendChild(container);

    // Wait for the final coin animation to finish
    const totalTime = ((reward.amount - 1) * 0.30 + 0.8) * 1000;
    await new Promise(resolve => setTimeout(resolve, totalTime));

    // Apply points
    applyPoints(reward.points);
}

// ===== SHIP ANIMATION =====

async function displayShipsReward(reward) {
    const container = document.createElement("div");
    container.className = "reward-ships-container";

    const shipsDisplay = document.createElement("div");
    shipsDisplay.className = "ships-display";

    playSound(sounds.ship_cannon);

    // Wait 1 second before the first ship appears
    await new Promise(resolve => setTimeout(resolve, 1000));

    for (let i = 0; i < reward.amount; i++) {
        const ship = document.createElement("div");
        ship.className = "ship";
        const delay = i * 0.90;
        ship.style.animationDelay = `${delay}s`;

        const shipImg = document.createElement("img");
        shipImg.src = "/static/images/games/classroom_pirates/other/minus_img.png";
        shipImg.alt = "Broken Ship";

        ship.appendChild(shipImg);
        shipsDisplay.appendChild(ship);
        setTimeout(() => {
            playSound(sounds.ship_break);
        }, (delay + 0.3) * 1000);
    }

    container.appendChild(shipsDisplay);
    rewardContent.appendChild(container);
   


    // Wait for final ship animation to finish
    const totalTime =
        ((reward.amount - 1) * 0.90 + 0.60) * 1000;

    await new Promise(resolve => setTimeout(resolve, totalTime));

    // Apply points
    applyPoints(reward.points);
}

// ===== TREASURE ANIMATION =====

async function displayTreasureReward(reward) {
    // Wait 1 second before the first ship appears
    await new Promise(resolve => setTimeout(resolve, 1000));
    const container = document.createElement("div");
    container.className = "reward-treasure-container";

    const treasureDisplay = document.createElement("div");
    treasureDisplay.className = "treasure-display";

    // Treasure shine (spinning)
    const shine = document.createElement("div");
    shine.className = "treasure-shine";
    const shineImg = document.createElement("img");
    shineImg.src = "/static/images/games/classroom_pirates/other/treasure_shine.png";
    shineImg.alt = "Shine";
    shine.appendChild(shineImg);

    // Treasure chest (glowing)
    const treasure = document.createElement("div");
    treasure.className = "treasure-chest";
    const treasureImg = document.createElement("img");
    treasureImg.src = "/static/images/games/classroom_pirates/other/treasure.png";
    treasureImg.alt = "Treasure";
    treasure.appendChild(treasureImg);

    treasureDisplay.appendChild(shine);
    treasureDisplay.appendChild(treasure);
    container.appendChild(treasureDisplay);
    rewardContent.appendChild(container);

    playSound(sounds.treasure_song)
    playSound(sounds.treasure_coins);

    // Wait for admiration
    await new Promise(resolve => setTimeout(resolve, 3000));
    

    // Apply points
    applyPoints(reward.points);
}

// ===== FIGHT OVERLAY =====

async function displayFightReward(reward) {
    const fightPromise = new Promise((resolve) => {
        window.fightResolve = resolve;

        // Step 1: Choose opponent
        showFightOpponentSelection();
    });

    await fightPromise;
}

function closeFightOverlay() {
    fightOverlay.classList.add("overlay-hidden");

    fightWindow.innerHTML = "";

    game.fightOpponent = null;
}

function showFightOpponentSelection() {

    fightWindow.innerHTML = `
    
    
        <h3 id="fight-title">Choose your opponent</h3>

        <div id="fight-team-list">
        </div>

        <button id="cancel-fight-btn" class="btn btn-close"></button>
    
    `;

    const fightTeamList = document.getElementById("fight-team-list");

    // Reconnect the cancel button because we just recreated it
    document.getElementById("cancel-fight-btn")
        .addEventListener("click", closeFightOverlay);

    game.teams.forEach((team, index) => {
        // Don't allow current team to fight itself
        if (index === game.currentTeam) return;

        const button = document.createElement("button");

        button.className = "btn btn-steal";
        button.textContent = team.name || `Team ${index + 1}`;

        button.addEventListener("click", () => {
            // Remember who we are fighting
            game.fightOpponent = index;

            // Move to the actual fight
            showFightScreen();
        });

        fightTeamList.appendChild(button);
    });

    fightOverlay.classList.remove("overlay-hidden");
}

function showFightScreen() {

    const currentTeamIndex = game.currentTeam;
    const opponentIndex = game.fightOpponent;

    const currentTeam = game.teams[currentTeamIndex];
    const opponentTeam = game.teams[opponentIndex];

    // Pick a scenario
    const scenario = chooseFightScenario();

    fightWindow.innerHTML = `
        <h2 class="fight-title">CHOOSE THE WINNER!</h2>

        <div class="fight-battle">

            <button class="fight-character" id="fight-team-1">
                <img 
                    src="/static/images/games/classroom_pirates/other/fight_salavan.png"
                    alt="Character 1"
                >
                <span>
                    ${opponentTeam.name || `Team ${opponentIndex + 1}`}
                </span>
            </button>

            <img
                class="fight-image"
                src="/static/images/games/classroom_pirates/other/fight_text.png"
                alt="FIGHT"
            >

            <button class="fight-character" id="fight-team-2">
                <img 
                    src="/static/images/games/classroom_pirates/other/fight_jack.png"
                    alt="Character 2"
                >
                <span>
                    ${currentTeam.name || `Team ${currentTeamIndex + 1}`}
                </span>
            </button>

        </div>

        <button id="cancel-fight-btn" class="btn btn-close">
        </button>
    `;
    const fightTitle = fightWindow.querySelector(".fight-title");
    fightTitle.textContent = scenario.description;

    // Reconnect the cancel button because we just recreated it
    document.getElementById("cancel-fight-btn")
        .addEventListener("click", closeFightOverlay);

    // Opponent wins
    document.getElementById("fight-team-1")
        .addEventListener("click", () => {
            resolveFight(opponentIndex, scenario);
        });

    // Current team wins
    document.getElementById("fight-team-2")
        .addEventListener("click", () => {
            resolveFight(currentTeamIndex, scenario);
        });

    fightOverlay.classList.remove("overlay-hidden");
    playSound(sounds.fight);
}

function resolveFight(winnerIndex, scenario) {

    const loserIndex =
        winnerIndex === game.currentTeam
            ? game.fightOpponent
            : game.currentTeam;


    // Show the result
    showFightResult(winnerIndex, loserIndex, scenario);
}

function chooseFightScenario() {

    const scenarios = [...FIGHT_SCENARIOS];

    // Check whether winner has the lowest score
    const currentScore = game.teams[game.currentTeam].score;

    const isLowest =
        game.teams.every(team => currentScore <= team.score);

    const opponentScore = game.teams[game.fightOpponent].score;

    const isOpponentLowest =
        game.teams.every(team => opponentScore <= team.score);

    // Only allow score swap if winner is lowest
    if (isLowest || isOpponentLowest) {
        scenarios.push(FIGHT_SCENARIOS.find(s => s.key === "SWAP_SCORES"));
    }

    const randomIndex =
        Math.floor(Math.random() * scenarios.length);

    return scenarios[randomIndex];
}

function showFightResult(winnerIndex, loserIndex, scenario) {

    const winner =
        game.teams[winnerIndex]

    const winnerName = winner.name || `Team ${winnerIndex + 1}`;

    const loser =
        game.teams[loserIndex]

    const loserName = loser.name || `Team ${loserIndex + 1}`;

    let resultText = "";

    switch (scenario.key) {

        case "STEAL_3":
            resultText = `
                <h2>
                    <i class="bi bi-trophy-fill"></i>
                    ${winnerName} WINS!
                </h2>
                <p>${winnerName} STEALS 3 POINTS!</p>
            `;
            break;

        case "LOSE_ALL":
            resultText = `
                <h2>
                    <i class="bi bi-trophy-fill"></i>
                    ${winnerName} WINS!
                </h2>
                <p>💀 ${loserName} LOSES ALL POINTS!</p>
            `;
            break;

        case "BONUS_10":
            resultText = `
                <h2>
                    <i class="bi bi-trophy-fill"></i>
                    ${winnerName} WINS!
                </h2>
                <p><i class="bi bi-star-fill"> ${winnerName} GETS 10 POINTS!</i></p>
            `;
            break;

        case "STEAL_5":
            resultText = `
                <h2>
                    <i class="bi bi-trophy-fill"></i>
                    ${winnerName} WINS!
                </h2>
                <p>${winnerName} STEALS 5 POINTS!</p>
            `;
            break;

        case "SWAP_SCORES":
            if (winner.score < loser.score){
                resultText = `
                    <h2>
                        <i class="bi bi-trophy-fill"></i>
                        ${winnerName} WINS!
                    </h2>
                    <p><i class="bi bi-arrow-repeat"></i> SCORES SWAPPED!</p>
                `;
            } else {
                resultText = `
                    <h2>
                        <i class="bi bi-trophy-fill"></i>
                        ${winnerName} WINS!
                    </h2>
                    <p><i class="bi bi-x-octagon"></i> SCORES NOT SWAPPED!</p>
                `;
            }
            break;
    }

    rewardContent.innerHTML = `
        <div class="fight-result">
            ${resultText}
        </div>
    `;

    playSound(sounds.treasure_song)


    applyFightScenario(
        winnerIndex,
        loserIndex,
        scenario
    );
}

// ===== RESET OVERLAY =====

async function displayResetReward(reward) {
    const container = document.createElement("div");
    container.className = "reward-reset-container";

    const resetText = document.createElement("h3");
    resetText.className = "reset-text";
    resetText.textContent = "💥 RESET! All Scores Set to 0!";

    playSound(sounds.reset);

    container.appendChild(resetText);
    rewardContent.appendChild(container);

    // Wait and show effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Reset all scores
    game.teams.forEach(team => {
        team.score = 0;
    });

    applyPoints(reward.points);

    // Wait a bit more before closing
    await new Promise(resolve => setTimeout(resolve, 1000));

}

// ==============================
// POINTS MANAGEMENT
// ==============================

function applyPoints(points) {
    game.teams[game.currentTeam].score += points;
    
    // Move to next team
    game.currentTeam = (game.currentTeam + 1) % game.teams.length;
}

function applyFightScenario(winnerIndex, loserIndex, scenario) {

    const winner = game.teams[winnerIndex];
    const loser = game.teams[loserIndex];

    const STEAL_3 = 3;
    const STEAL_5 = 5;

    switch (scenario.key) {

        case "STEAL_3":

            loser.score -= STEAL_3;
            winner.score += STEAL_3;

            break;


        case "LOSE_ALL":

            loser.score = 0;

            break;


        case "BONUS_10":

            winner.score += 10;

            break;


        case "STEAL_5":

            loser.score -= STEAL_5;
            winner.score += STEAL_5;

            break;


        case "SWAP_SCORES":

            if (winner.score < loser.score) {
                const temp = winner.score;

                winner.score = loser.score;
                loser.score = temp;
            }

            break;

    }

    closeFightOverlay();

    // Move to next team
    game.currentTeam =
        (game.currentTeam + 1) % game.teams.length;

    // Finish the reward
    window.fightResolve?.();

}

// ==============================
// REWARD OVERLAY CONTROL
// ==============================

function showRewardOverlay() {
    rewardOverlay.classList.remove("overlay-hidden");
}


function closeRewardOverlay() {
    playSound(sounds.click);
    rewardOverlay.classList.add("overlay-hidden");
    rewardContent.innerHTML = "";
    renderScoreboard();
}

// ==============================
// SCOREBOARD RENDERING
// ==============================

function renderScoreboard() {
    Scoreboard.render({
        container: scoreboard,
        currentTeamLabel: currentTeamLabel,
        teams: game.teams,
        currentTeam: game.currentTeam
    });
}

// ==============================
// PLAYSOUNDS
// ==============================

function playSound(sound) {
    const audio = new Audio(sound);
    audio.volume = 0.6;

    audio.play().catch(() => {
        /* Keep the game usable if a browser blocks a sound effect. */
    });
}

function playIntroMusic() {
    backtrack.play().catch(() => {
        /* Browsers may block audio until the first user gesture. */
    });
}

document.addEventListener("pointerdown", playIntroMusic);

