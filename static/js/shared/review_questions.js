/*=====================================
ELEMENTS
=====================================*/

const uploadLessonButton = document.getElementById("upload-lesson-btn");
const saveLessonButton = document.getElementById("save-lesson-btn");
const deleteQuestionButton = document.getElementById("delete-question-btn");
const lessonFileInput = document.getElementById("lesson-file-input");
const addImageButton = document.getElementById("add-img-btn");
const addTextboxButton = document.getElementById("add-textbox-btn");
const fontSmallerButton = document.getElementById("font-smaller-btn");
fontSmallerButton.disabled = true;
const fontBiggerButton = document.getElementById("font-bigger-btn");
fontBiggerButton.disabled = true;

const previousButton = document.getElementById("previous-question-btn");
const nextButton = document.getElementById("next-question-btn");
const addQuestionButton = document.getElementById("add-question-btn");

const instructionInput = document.getElementById("instruction-input");
const answerInput = document.getElementById("answer-input");

const questionCounter = document.getElementById("question-counter");

const imageFileInput = document.getElementById("image-file-input");
const editorCanvas = document.getElementById("editor-canvas");
const editorCanvasPlaceholder = document.getElementById("canvas-placeholder");

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 96;
const FONT_STEP = 2;
/*=====================================
LESSON
=====================================*/

const lesson = {

    game: GAME_NAME,

    questions: [

        {

            instruction: "",

            answer: "",

            objects: []

        }

    ]

};

let currentQuestion = 0;
let selectedObject = null;
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isResizing = false;
let resizeStartX = 0;
let resizeStartY = 0;
let startWidth = 0;
let startHeight = 0;
let draggedElement = null;

function loadQuestion(){

    const question = lesson.questions[currentQuestion];

    selectedObject = null;

    instructionInput.value = question.instruction;

    answerInput.value = question.answer;

    renderCanvas();

    questionCounter.textContent =
        `Question ${currentQuestion + 1} of ${lesson.questions.length}`;


}

function saveCurrentQuestion(){

    const question = lesson.questions[currentQuestion];

    question.instruction = instructionInput.value;

    question.answer = answerInput.value;

}

function uploadImage(){

    const file = imageFileInput.files[0];

    if(!file) return;

    const width = 250;
    const height = 200;

    const x = (editorCanvas.clientWidth / 2) - (width / 2);
    const y = (editorCanvas.clientHeight / 2) - (height / 2);

    lesson.questions[currentQuestion].objects.push({

        type: "image",

        file: file,

        width,

        height,

        x: x,

        y: y,

        locked: false,

    });

    renderCanvas();

    }

function renderCanvas(){

    editorCanvas.innerHTML = "";

    const question = lesson.questions[currentQuestion];

    editorCanvasPlaceholder.hidden =
        question.objects.length === 0;

    const selected = question.objects[selectedObject];

    if(selected && selected.type === "text"){

        fontBiggerButton.disabled = false;
        fontSmallerButton.disabled = false;

    }
    else{

        fontBiggerButton.disabled = true;
        fontSmallerButton.disabled = true;

    }

    question.objects.forEach((object, index) => {

        let element;

        if(object.type === "image"){

            element = document.createElement("img");

            element.src = URL.createObjectURL(object.file);

            element.className = "canvas-image";

        }
        else{

            element = document.createElement("div");

            element.className = "canvas-textbox";

            element.contentEditable = false;

            element.textContent = object.text;

            element.style.fontSize = object.fontSize + "px";

        }

        element.dataset.index = index;

        const wrapper = document.createElement("div");

        wrapper.className = "canvas-object";
        wrapper.dataset.index = index;
        wrapper.style.left = object.x + "px";
        wrapper.style.top = object.y + "px";
        wrapper.style.width = object.width + "px";
        wrapper.style.height = object.height + "px";

        if(index === selectedObject){

            const resizeHandle = document.createElement("div");

            resizeHandle.className = "resize-handle";

            wrapper.appendChild(resizeHandle);

            wrapper.classList.add("selected");

            resizeHandle.addEventListener("mousedown", startResizing);

        }

        wrapper.appendChild(element);

        editorCanvas.appendChild(wrapper);

        makeSelectable(wrapper);

        if(object.type === "text"){

            element.addEventListener("dblclick", startEditing);

        }
        element.addEventListener("blur", finishEditing);

    });

}

function startEditing(event){

    uploadLessonButton.disabled = true;
    saveLessonButton.disabled = true;
    deleteQuestionButton.disabled = true;
    addImageButton.disabled = true;
    addTextboxButton.disabled = true;
    previousButton.disabled = true;
    nextButton.disabled = true;
    addQuestionButton.disabled = true;

    event.stopPropagation();

    const textbox = event.target;

    textbox.contentEditable = true;

    textbox.focus();

    document.execCommand("selectAll", false, null);

}

function finishEditing(event){

    uploadLessonButton.disabled = false;
    saveLessonButton.disabled = false;
    deleteQuestionButton.disabled = false;
    addImageButton.disabled = false;
    addTextboxButton.disabled = false;
    previousButton.disabled = false;
    nextButton.disabled = false;
    addQuestionButton.disabled = false;

    const textbox = event.target;

    textbox.contentEditable = false;

    const index = Number(textbox.dataset.index);

    lesson.questions[currentQuestion]
        .objects[index]
        .text = textbox.textContent;

}

function makeSelectable(element){

    element.addEventListener("mousedown", startDragging);

}

function startDragging(event){

    console.log(event.currentTarget);

    if(event.target.contentEditable === "true"){

        return;

    }

    event.preventDefault();

    draggedElement = event.currentTarget;

    isResizing = false;

    if (selectedObject !== Number(event.currentTarget.dataset.index)){

        selectedObject = Number(event.currentTarget.dataset.index);

        renderCanvas();
    };

    

    isDragging = true;

    const object =
        lesson.questions[currentQuestion].objects[selectedObject];

    if(object.locked){

        return;

    }

    const canvasRect =
        editorCanvas.getBoundingClientRect();

    const mouseX = event.clientX - canvasRect.left;

    const mouseY = event.clientY - canvasRect.top;

    dragOffsetX = mouseX - object.x;

    dragOffsetY = mouseY - object.y;

}

function dragObject(event){

    if(!isDragging){

        return;

    }

    console.log("dragging")

    const object =
        lesson.questions[currentQuestion].objects[selectedObject];

    const canvasRect =
        editorCanvas.getBoundingClientRect();

    object.x =
        event.clientX - canvasRect.left - dragOffsetX;

    object.y =
        event.clientY - canvasRect.top - dragOffsetY;

    object.x = Math.max(
        0,
        Math.min(
            object.x,
            editorCanvas.clientWidth - object.width
        )
    );

    object.y = Math.max(
        0,
        Math.min(
            object.y,
            editorCanvas.clientHeight - object.height
        )
    );

    draggedElement.style.left = object.x + "px";
    draggedElement.style.top = object.y + "px";


}

function stopDragging(){

    isDragging = false;
    isResizing = false;

}

function startResizing(event){

    event.stopPropagation();

    isDragging = false;

    draggedElement = event.currentTarget.parentElement;

    selectedObject = Number(draggedElement.dataset.index);


    isResizing = true;

    const object =
        lesson.questions[currentQuestion].objects[selectedObject];

    if(object.locked){

        return;

    }

    resizeStartX = event.clientX;
    resizeStartY = event.clientY;

    startWidth = object.width;
    startHeight = object.height;

}

function resizeObject(event){

    if(!isResizing){

        return;

    }

    const object =
        lesson.questions[currentQuestion].objects[selectedObject];

    object.width =
    startWidth + (event.clientX - resizeStartX);

    object.height =
        startHeight + (event.clientY - resizeStartY);

    object.width = Math.min(
        object.width,
        editorCanvas.clientWidth - object.x
    );

    object.height = Math.min(
        object.height,
        editorCanvas.clientHeight - object.y
    );

    draggedElement.style.width = object.width + "px";
    draggedElement.style.height = object.height + "px";


}



function addTextbox(){

    const width = 250;
    const height = 60;

    lesson.questions[currentQuestion].objects.push({

        type:"text",

        text:"Double-click to edit",

        width,

        height,

        x: (editorCanvas.clientWidth - width) / 2,

        y: (editorCanvas.clientHeight - height) / 2,

        fontSize:32,

        locked: false,

    });

    renderCanvas();

}

async function saveLessonPack(){

    saveCurrentQuestion();

    const zip = new JSZip();

    const imageFolder = zip.folder("images");

    const lessonData = {

        game: lesson.game,

        questions: []

    };

    for(let i = 0; i < lesson.questions.length; i++){

        currentQuestion = i;

        loadQuestion();

        // Give the browser a frame to finish drawing
        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );

        // Take a screenshot of the editor
        const canvas = await html2canvas(editorCanvas);

        const imageBlob = await new Promise(resolve =>
            canvas.toBlob(resolve)
        );

        const imageName = `question${i + 1}.png`;

        imageFolder.file(imageName, imageBlob);

        lessonData.questions.push({

            instruction: lesson.questions[i].instruction,

            answer: lesson.questions[i].answer,

            image: imageName

        });

    }

    zip.file(

        "lesson.json",

        JSON.stringify(lessonData, null, 4)

    );

    const blob = await zip.generateAsync({

        type: "blob"

    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = `${lesson.game}.zip`;

    link.click();

    URL.revokeObjectURL(link.href);

}

async function loadLessonPack(){

    const file = lessonFileInput.files[0];

    if(!file) return;

    const zip = await JSZip.loadAsync(file);

    const jsonText =
        await zip.file("lesson.json").async("string");

    const lessonData = JSON.parse(jsonText);

    lesson.game = lessonData.game;

    lesson.questions = [];

    for(const question of lessonData.questions){

        const newQuestion = {

            instruction: question.instruction,

            answer: question.answer,

            objects: []

        };

        if(question.image){

            const imageBlob =
                await zip.file("images/" + question.image)
                    .async("blob");

            const imageFile = new File(

                [imageBlob],

                question.image,

                {
                    type: imageBlob.type
                }

            );

            newQuestion.objects.push({

                type: "image",

                file: imageFile,

                x: 0,

                y: 0,

                width: editorCanvas.clientWidth,

                height: editorCanvas.clientHeight,

                locked: true,

            });

        }

        lesson.questions.push(newQuestion);

    }

    currentQuestion = 0;

    selectedObject = null;

    loadQuestion();

}

function deleteSelectedObject(){

    if(selectedObject === null){

        return;

    }

    lesson.questions[currentQuestion]
        .objects.splice(selectedObject,1);

    selectedObject = null;

    renderCanvas();

}

function increaseFontSize(){

    if(selectedObject === null){

        return;

    }

    const object =
        lesson.questions[currentQuestion]
        .objects[selectedObject];

    if(object.type !== "text"){

        return;

    }

    object.fontSize = Math.min(

        MAX_FONT_SIZE,

        object.fontSize + FONT_STEP

    );

    renderCanvas();

}

function decreaseFontSize(){

    if(selectedObject === null){

        return;

    }

    const object =
        lesson.questions[currentQuestion]
        .objects[selectedObject];

    if(object.type !== "text"){

        return;

    }

    object.fontSize = Math.max(

        MIN_FONT_SIZE,

        object.fontSize - FONT_STEP

    );

    renderCanvas();

}

document.addEventListener("keydown", event=>{

    if(event.key === "Delete"){

        deleteSelectedObject();

    }

});

uploadLessonButton.addEventListener("click", () => {

    lessonFileInput.click();

});

lessonFileInput.addEventListener("change", loadLessonPack);

nextButton.addEventListener("click",()=>{

    saveCurrentQuestion();

    if(currentQuestion < lesson.questions.length-1){

        currentQuestion++;

        loadQuestion();

    }

});

previousButton.addEventListener("click",()=>{

    saveCurrentQuestion();

    if(currentQuestion>0){

        currentQuestion--;

        loadQuestion();

    }

});

addQuestionButton.addEventListener("click",()=>{

    saveCurrentQuestion();

    lesson.questions.push({

        instruction:"",

        answer:"",

        objects:[]

    });

    currentQuestion = lesson.questions.length-1;

    loadQuestion();

});

deleteQuestionButton.addEventListener("click",()=>{

    if(lesson.questions.length===1){

        return;

    }

    lesson.questions.splice(currentQuestion,1);

    if(currentQuestion>=lesson.questions.length){

        currentQuestion--;

    }

    loadQuestion();

});



addImageButton.addEventListener("click", () => {

    imageFileInput.click();

});

addTextboxButton.addEventListener("click", addTextbox);

document.addEventListener("mousemove", event => {

    if(isDragging){

        dragObject(event);

    }

    if(isResizing){

        resizeObject(event);

    }

});

document.addEventListener("mouseup", stopDragging);

imageFileInput.addEventListener("change", uploadImage);

saveLessonButton.addEventListener("click", saveLessonPack);

fontBiggerButton.addEventListener(
    "click",
    increaseFontSize
);

fontSmallerButton.addEventListener(
    "click",
    decreaseFontSize
);

loadQuestion();