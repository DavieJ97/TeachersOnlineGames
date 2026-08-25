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

const question_map = document.getElementById("question_map");

const question_pins = [];
const special_pins = [];

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

    // Future use
    soundsEnabled: true

};

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
    },

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
    },

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
    },

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
    },

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
    },

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

function updateScoreboard() {

    Scoreboard.render({
        container: scoreboard,
        currentTeamLabel: currentTeamLabel,
        teams: game.teams,
        currentTeam: game.currentTeam
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
            pin_drop.addEventListener("click", handlePinClick);
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
            pin_drop.addEventListener("click", handlePinClick);
            special_pins.push(pin_drop)
        };
    };
}

function startGame (){
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

function handlePinClick(){
    console.log("clicked pin drop")
}

startButton.addEventListener("click", startGame);