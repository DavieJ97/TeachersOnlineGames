(() => {
    "use strict";

    const ROWS = 6;
    const COLS = 7;
    // Centers of the seven columns and six slots in the supplied 16:9 board art.
    const COLUMN_CENTERS = [7.50, 21.60, 35.75, 49.90, 64.10, 78.25, 92.45];
    const ROW_CENTERS = [8.45, 21.8, 35.15, 48.5, 61.85, 75.2];
    const LESSON_IMGS_POSITIONS = [
        { top: "88.55%", left: "7.50%" },
        { top: "88.55%", left: "21.60%" },
        { top: "88.55%", left: "35.75%" },
        { top: "88.55%", left: "49.90%" },
        { top: "88.55%", left: "64.10%" },
        { top: "88.55%", left: "78.25%" },
        { top: "88.55%", left: "92.45%" }
    ];
    const TEAMS = [
        { name: "Yellow", color: "yellow", score: 0 },
        { name: "Red", color: "red", score: 0 }
    ];

    const el = {};
    let board = [];
    let currentTeam = 0;
    let mode = "speed";
    let round = 1;
    let active = false;
    let animating = false;
    let lessonImageUrls = [];

    document.addEventListener("DOMContentLoaded", initialize);

    function initialize() {
        [
            "setup-screen", "main-screen", "start-game-btn", "game-mode",
            "connect-four-board", "puck-layer", "lesson-image-layer",
            "column-controls", "turn-message",
            "scoreboard", "current-team", "round-display", "round-number",
            "reset-game-btn", "end-game-btn", "result-overlay", "result-title",
            "result-message", "result-scores", "play-again-btn", "continue-game-btn",
            "close-result-btn", "load-lesson-btn", "lesson-file", "lesson-info"
        ].forEach(id => el[id] = document.getElementById(id));

        bindLessonPackLoadButton(el["load-lesson-btn"], el["lesson-file"]);
        el["lesson-file"].addEventListener("change", handleLessonLoad);
        el["start-game-btn"].addEventListener("click", startGame);
        el["reset-game-btn"].addEventListener("click", resetGame);
        el["end-game-btn"].addEventListener("click", endGame);
        el["play-again-btn"].addEventListener("click", playAgain);
        el["continue-game-btn"].addEventListener("click", startNextRound);
        el["close-result-btn"].addEventListener("click", closeResult);
        createColumnControls();
        renderBoard();
    }

    async function handleLessonLoad(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const loaded = await LessonLoader.loadLesson(file, "connect_four");
            const lesson = loaded.lessonData;
            await renderLessonImages(lesson.columnHeaders, loaded.zip);
            el["lesson-info"].hidden = false;
            document.getElementById("lesson-grade").textContent = lesson.game || "Connect Four";
            document.getElementById("lesson-name").textContent = lesson.instructions?.name || "Speaking lesson";
            document.getElementById("lesson-question-count").textContent = "Speaking practice";
        } catch (error) {
            console.error("Could not load Connect Four lesson pack:", error);
            window.alert(error.message || "Could not load this lesson pack.");
        } finally {
            event.target.value = "";
        }
    }

    async function renderLessonImages(columnHeaders, zip) {
        if (columnHeaders.length !== COLS) {
            throw new Error(`This lesson pack must contain ${COLS} column prompts.`);
        }

        const nextImageUrls = [];
        const imageLayer = document.createDocumentFragment();

        try {
            for (let col = 0; col < COLS; col += 1) {
                const screenshot = columnHeaders[col]?.screenshot;
                if (!screenshot) {
                    throw new Error(`Column ${col + 1} is missing its lesson image.`);
                }

                const imageUrl = await LessonLoader.getObjectUrl(zip, screenshot);
                nextImageUrls.push(imageUrl);

                const image = document.createElement("img");
                image.className = "lesson-column-image";
                image.src = imageUrl;
                image.alt = `Lesson prompt for column ${col + 1}`;
                image.draggable = false;
                image.style.top = LESSON_IMGS_POSITIONS[col].top;
                image.style.left = LESSON_IMGS_POSITIONS[col].left;
                imageLayer.appendChild(image);
            }
        } catch (error) {
            nextImageUrls.forEach(url => URL.revokeObjectURL(url));
            throw error;
        }

        el["lesson-image-layer"].replaceChildren(imageLayer);
        lessonImageUrls.forEach(url => URL.revokeObjectURL(url));
        lessonImageUrls = nextImageUrls;
    }

    function createColumnControls() {
        el["column-controls"].replaceChildren();
        for (let col = 0; col < COLS; col += 1) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `column-puck ${TEAMS[currentTeam].color}`;
            button.style.left = `calc(${COLUMN_CENTERS[col]}% - var(--puck-half))`;
            button.dataset.column = String(col);
            button.setAttribute("aria-label", `Drop puck in column ${col + 1}`);
            button.appendChild(createPuckImage(currentTeam, button));
            button.addEventListener("click", () => dropPuck(col));
            el["column-controls"].appendChild(button);
        }
    }

    function startGame() {
        const body = document.body;
        body.style.backgroundImage = "linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url('/static/images/games/connect_four/backgrounds/intro_background.png')";
        mode = el["game-mode"].value;
        round = 1;
        TEAMS.forEach(team => team.score = 0);
        currentTeam = 0;
        active = true;
        el["setup-screen"].hidden = true;
        el["main-screen"].hidden = false;
        el["round-display"].hidden = mode !== "infinite";
        el["turn-message"].classList.toggle("infinite", mode === "infinite");
        el["reset-game-btn"].hidden = false;
        el["end-game-btn"].hidden = mode !== "infinite";
        hideResult();
        newBoard();
    }

    function newBoard() {
        board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        animating = false;
        currentTeam = mode === "infinite" ? (round - 1) % 2 : 0;
        el["round-number"].textContent = String(round);
        renderBoard();
        renderScoreboard();
        setTurnMessage(`${TEAMS[currentTeam].name}'s turn. Make a sentence, then choose a column.`);
    }

    async function dropPuck(col) {
        if (!active || animating || !el["result-overlay"].hidden) return;
        let row = ROWS - 1;
        while (row >= 0 && board[row][col] !== null) row -= 1;
        if (row < 0) {
            setTurnMessage(`Column ${col + 1} is full. ${TEAMS[currentTeam].name}, choose another column.`);
            return;
        }

        animating = true;
        el["column-controls"].classList.add("controls-disabled");
        el["reset-game-btn"].disabled = true;
        el["end-game-btn"].disabled = true;
        const puck = createPuckImage(currentTeam);
        puck.classList.add("board-puck");
        puck.alt = "";
        puck.style.left = `calc(${COLUMN_CENTERS[col]}% - var(--puck-half))`;
        puck.style.top = `calc(${ROW_CENTERS[row]}% - var(--puck-height-half))`;
        el["puck-layer"].appendChild(puck);

        const boardHeight = el["connect-four-board"].getBoundingClientRect().height;
        const targetOffset = boardHeight * (ROW_CENTERS[row] / 100);
        const startOffset = -boardHeight * 0.04;
        const distance = targetOffset - startOffset;
        try {
            await puck.animate(
                [{ transform: `translateY(${-distance}px)` }, { transform: "translateY(0)" }],
                { duration: Math.min(850, 350 + distance * 0.45), easing: "cubic-bezier(.42, 0, .78, .2)" }
            ).finished;
        } catch (_) {
            // The final board state is still applied if the animation is interrupted.
        }

        board[row][col] = currentTeam;
        animating = false;
        el["column-controls"].classList.remove("controls-disabled");
        el["reset-game-btn"].disabled = false;
        el["end-game-btn"].disabled = false;

        const winningRun = findWinningRun(row, col, currentTeam);
        if (winningRun && mode !== "full-board") {
            finishConnectFour(currentTeam);
            return;
        }

        if (isBoardFull()) {
            if (mode === "full-board") {
                finishFullBoard();
                return;
            }
            if (mode === "infinite") {
                finishInfiniteTie();
                return;
            }
            // A full board without a winner is a draw. Start a fresh Speed game.
            showResult("It's a draw!", "The board filled before either team connected four.", false, true);
            active = false;
            return;
        }

        currentTeam = 1 - currentTeam;
        renderBoard();
        renderScoreboard();
        setTurnMessage(`${TEAMS[currentTeam].name}'s turn. Make a sentence, then choose a column.`);
    }

    function findWinningRun(row, col, teamIndex) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (const [dr, dc] of directions) {
            let count = 1;
            for (const sign of [-1, 1]) {
                let r = row + dr * sign;
                let c = col + dc * sign;
                while (inside(r, c) && board[r][c] === teamIndex) {
                    count += 1;
                    r += dr * sign;
                    c += dc * sign;
                }
            }
            if (count >= 4) return count;
        }
        return 0;
    }

    function calculateFullBoardScores() {
        const scores = [0, 0];
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (let row = 0; row < ROWS; row += 1) {
            for (let col = 0; col < COLS; col += 1) {
                const team = board[row][col];
                if (team === null) continue;
                for (const [dr, dc] of directions) {
                    const prevRow = row - dr;
                    const prevCol = col - dc;
                    if (inside(prevRow, prevCol) && board[prevRow][prevCol] === team) continue;
                    let length = 0;
                    let r = row;
                    let c = col;
                    while (inside(r, c) && board[r][c] === team) {
                        length += 1;
                        r += dr;
                        c += dc;
                    }
                    if (length >= 4) scores[team] += length - 3;
                }
            }
        }
        return scores;
    }

    function finishConnectFour(teamIndex) {
        if (mode === "infinite") {
            TEAMS[teamIndex].score += 1;
            renderScoreboard();
            active = false;
            showResult(`${TEAMS[teamIndex].name} wins round ${round}!`, `+1 point. ${TEAMS[teamIndex].name} connects four.`, false, false, true);
            return;
        }
        active = false;
        const speed = mode === "speed";
        showResult(`${TEAMS[teamIndex].name} wins!`, speed
            ? "Connect four! The game is over."
            : "Connect four! Final board scores are shown below.", !speed, speed);
        if (!speed) {
            const scores = calculateFullBoardScores();
            TEAMS.forEach((team, index) => team.score = scores[index]);
            renderScoreboard();
            renderResultScores(scores);
            if (scores[0] === scores[1]) {
                el["result-message"].textContent = "Connect four! The board's final connection scores are tied.";
                el["result-title"].textContent = "It's a tie!";
            } else {
                const winner = scores[0] > scores[1] ? TEAMS[0].name : TEAMS[1].name;
                el["result-title"].textContent = `${winner} wins!`;
                el["result-message"].textContent = "The board is full. Final connection scores:";
            }
        }
    }

    function finishFullBoard() {
        active = false;
        const scores = calculateFullBoardScores();
        TEAMS.forEach((team, index) => team.score = scores[index]);
        renderScoreboard();
        renderResultScores(scores);
        if (scores[0] === scores[1]) {
            showResult("It's a tie!", "The board is full and both teams have the same connection score.", true, false);
        } else {
            const winner = scores[0] > scores[1] ? TEAMS[0].name : TEAMS[1].name;
            showResult(`${winner} wins!`, "The board is full. Final connection scores:", true, false);
        }
    }

    function finishInfiniteTie() {
        active = false;
        showResult(`Round ${round} is a tie`, "The board filled without a connection. No point was awarded.", false, false, true);
    }

    function renderBoard() {
        el["puck-layer"].replaceChildren();
        for (let row = 0; row < ROWS; row += 1) {
            for (let col = 0; col < COLS; col += 1) {
                const teamIndex = board[row]?.[col];
                if (teamIndex === null || teamIndex === undefined) continue;
                const puck = createPuckImage(teamIndex);
                puck.classList.add("board-puck");
                puck.style.left = `calc(${COLUMN_CENTERS[col]}% - var(--puck-half))`;
                puck.style.top = `calc(${ROW_CENTERS[row]}% - var(--puck-height-half))`;
                puck.alt = `${TEAMS[teamIndex].name} puck, row ${ROWS - row}, column ${col + 1}`;
                el["puck-layer"].appendChild(puck);
            }
        }

        el["column-controls"].style.setProperty("--turn-color", TEAMS[currentTeam].color);
        el["column-controls"].classList.toggle("turn-red", currentTeam === 1);
        el["column-controls"].querySelectorAll(".column-puck").forEach((button, col) => {
            const full = board[0]?.[col] !== null && board[0]?.[col] !== undefined;
            button.classList.toggle("yellow", currentTeam === 0);
            button.classList.toggle("red", currentTeam === 1);
            const image = button.querySelector("img");
            if (image) {
                button.classList.remove("asset-failed");
                image.hidden = false;
                image.src = puckImageUrl(currentTeam);
            }
            button.disabled = !active || full || animating;
            button.classList.toggle("is-full", full);
            button.setAttribute("aria-label", full
                ? `Column ${col + 1} is full`
                : `Drop a ${TEAMS[currentTeam].name.toLowerCase()} puck in column ${col + 1}`);
        });
    }

    function renderScoreboard() {
        if (!window.Scoreboard) return;
        Scoreboard.render({
            container: el["scoreboard"],
            currentTeamLabel: el["current-team"],
            teams: TEAMS,
            currentTeam
        });
        el["current-team"].textContent = `${TEAMS[currentTeam].name}'s Turn`;
        el["scoreboard"].querySelectorAll(".team-box").forEach((box, index) => {
            box.classList.toggle("team-yellow", index === 0);
            box.classList.toggle("team-red", index === 1);
            box.querySelector("h3").textContent = TEAMS[index].name;
            if (mode === "speed") box.querySelector("p").hidden = true;
        });
    }

    function showResult(title, message, showScores, allowReplay, allowContinue = false) {
        el["result-title"].textContent = title;
        el["result-message"].textContent = message;
        el["result-scores"].hidden = !showScores;
        if (!showScores) el["result-scores"].replaceChildren();
        el["play-again-btn"].hidden = !allowReplay;
        el["continue-game-btn"].hidden = !allowContinue;
        el["close-result-btn"].hidden = allowReplay || allowContinue;
        el["result-overlay"].hidden = false;
    }

    function renderResultScores(scores) {
        const fragment = document.createDocumentFragment();
        TEAMS.forEach((team, index) => {
            const item = document.createElement("div");
            item.className = `result-score ${team.color}`;
            item.textContent = `${team.name}: ${scores[index]} point${scores[index] === 1 ? "" : "s"}`;
            fragment.appendChild(item);
        });
        el["result-scores"].replaceChildren(fragment);
        el["result-scores"].hidden = false;
    }

    function playAgain() {
        TEAMS.forEach(team => team.score = 0);
        round = 1;
        active = true;
        hideResult();
        newBoard();
    }

    function startNextRound() {
        round += 1;
        active = true;
        hideResult();
        newBoard();
    }

    function resetGame() {
        if (!window.confirm("Reset the board and both team scores?")) return;
        TEAMS.forEach(team => team.score = 0);
        round = 1;
        active = true;
        hideResult();
        newBoard();
    }

    function endGame() {
        if (!active && el["result-overlay"].hidden === false) hideResult();
        active = false;
        const scores = TEAMS.map(team => team.score);
        renderResultScores(scores);
        showResult("Game Ended", `Final score after ${round} round${round === 1 ? "" : "s"}:`, true, true);
        el["result-scores"].hidden = false;
    }

    function closeResult() {
        hideResult();
        if (mode === "infinite" && !active) {
            // A round result can be dismissed; the teacher can then end or reset.
            active = false;
        }
    }

    function hideResult() {
        el["result-overlay"].hidden = true;
    }

    function setTurnMessage(message) {
        el["turn-message"].textContent = message;
    }

    function isBoardFull() {
        return board[0].every(cell => cell !== null);
    }

    function inside(row, col) {
        return row >= 0 && row < ROWS && col >= 0 && col < COLS;
    }

    function puckImageUrl(teamIndex) {
        return teamIndex === 0
            ? el["connect-four-board"].dataset.yellowPuck
            : el["connect-four-board"].dataset.redPuck;
    }

    function createPuckImage(teamIndex, fallbackElement = null) {
        const image = document.createElement("img");
        image.classList.add(TEAMS[teamIndex].color);
        image.src = puckImageUrl(teamIndex);
        image.alt = "";
        image.draggable = false;
        image.addEventListener("error", () => {
            const target = fallbackElement || image;
            target.classList.add("asset-failed");
            if (fallbackElement) image.hidden = true;
        }, { once: true });
        return image;
    }

})();
