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

const progressOverlay = document.getElementById("save-progress-overlay");
const progressBar = document.getElementById("save-progress-bar");
const progressMessage = document.getElementById("save-progress-message");

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


    const object =
        lesson.questions[currentQuestion].objects[selectedObject];

    if(object.locked){

        return;

    }

    isResizing = true;

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

    object.width = Math.max(
        MIN_WIDTH,
        Math.min(
            object.width,
            editorCanvas.clientWidth - object.x
        )
    );

    object.height = Math.max(
        MIN_HEIGHT,
        Math.min(
            object.height,
            editorCanvas.clientHeight - object.y
        )
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
    showProgress(lesson.questions.length);

    saveCurrentQuestion();

    const zip = new JSZip();

    const imageFolder = zip.folder("images");

    const lessonData = {

        game: lesson.game,

        questions: []

    };

    const questionBeforeSaving = currentQuestion;

    for(let i = 0; i < lesson.questions.length; i++){

        currentQuestion = i;

        loadQuestion();

        // Give the browser a frame to finish drawing
        await new Promise(resolve =>
            requestAnimationFrame(resolve)
        );

        const question = lesson.questions[i];

        // Save the editable object data.
        const savedObjects = [];

        for (
            let objectIndex = 0;
            objectIndex < question.objects.length;
            objectIndex++
        ) {

            const object = question.objects[objectIndex];

            // Ignore the locked screenshot used by old lesson packs.
            if (
                object.type === "image" &&
                object.isLegacyPreview
            ) {
                continue;
            }

            const savedObject = {
                type: object.type,
                x: object.x,
                y: object.y,
                width: object.width,
                height: object.height,
                locked: object.locked
            };

            if (object.type === "text") {

                savedObject.text = object.text;
                savedObject.fontSize = object.fontSize;

            } else if (object.type === "image") {

                // An image file cannot be stored directly in JSON.
                // Put the original file inside the ZIP instead.
                if (!object.file) {
                    continue;
                }

                const assetPath =
                    `editor-assets/question${i + 1}-object${objectIndex + 1}`;

                zip.file(assetPath, object.file);

                savedObject.asset = assetPath;
                savedObject.fileName = object.file.name;
                savedObject.mimeType = object.file.type;
            }

            savedObjects.push(savedObject);
        }

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

            image: imageName,

            objects: savedObjects

        });

        updateProgress(i + 1, lesson.questions.length, "Saving");

    }

    // Return the teacher to the question they were editing.
    currentQuestion = questionBeforeSaving;
    loadQuestion();

    zip.file(

        "lesson.json",

        JSON.stringify(lessonData, null, 4)

    );

    const blob = await zip.generateAsync({

        type: "blob"

    });

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = `${lesson.game} lesson pack.zip`;

    link.click();

    URL.revokeObjectURL(link.href);

    hideProgress()

}

async function loadLessonPack(){

    const file = lessonFileInput.files[0];

    if(!file) return;

    try{

        const zip = await JSZip.loadAsync(file);

        const lessonFile = zip.file("lesson.json");

        if (!lessonFile) {
            throw new Error("This ZIP does not contain lesson.json.");
        }

        const jsonText = await lessonFile.async("string");

        const lessonData = JSON.parse(jsonText);

        if (!Array.isArray(lessonData.questions)) {
            throw new Error("This lesson pack has no questions.");
        }

        showProgress(lessonData.questions.length)

        lesson.game = lessonData.game || GAME_NAME;

        lesson.questions = [];

        for(let i = 0; i < lessonData.questions.length; i++){
            const savedQuestion = lessonData.questions[i];

            const newQuestion = {

                instruction: savedQuestion.instruction || "",

                answer: savedQuestion.answer || "",

                objects: []

            };

            if (Array.isArray(savedQuestion.objects)) {

                for (const savedObject of savedQuestion.objects) {

                    if (savedObject.type === "text") {

                        newQuestion.objects.push({
                            type: "text",
                            text: savedObject.text || "",
                            x: savedObject.x,
                            y: savedObject.y,
                            width: savedObject.width,
                            height: savedObject.height,
                            fontSize: savedObject.fontSize,
                            locked: savedObject.locked ?? false
                        });

                    } else if (savedObject.type === "image") {

                        const assetFile =
                            zip.file(savedObject.asset);

                        if (!assetFile) {
                            continue;
                        }

                        const imageFile =
                            await LessonLoader.getFile(
                                zip,
                                savedObject.asset,
                                savedObject.fileName || "image",
                                savedObject.mimeType
                            );

                        newQuestion.objects.push({
                            type: "image",
                            file: imageFile,
                            x: savedObject.x,
                            y: savedObject.y,
                            width: savedObject.width,
                            height: savedObject.height,
                            locked: savedObject.locked ?? false
                        });
                    }
                }

            /*
             * Old lesson packs:
             * They only contain a screenshot, so it cannot be
             * restored as individually editable objects.
             */
            } else if (savedQuestion.image) {

                const screenshotFile = zip.file(
                    "images/" + savedQuestion.image
                );

                if (screenshotFile) {

                    const screenshotImage =
                        await LessonLoader.getFile(
                            zip,
                            "images/" + savedQuestion.image,
                            savedQuestion.image
                        );

                    newQuestion.objects.push({
                        type: "image",
                        file: screenshotImage,
                        x: 0,
                        y: 0,
                        width: editorCanvas.clientWidth,
                        height: editorCanvas.clientHeight,
                        locked: true,
                        isLegacyPreview: true

                    });
                }

            }
            updateProgress(i + 1, lessonData.questions.length, "Loading")
            await new Promise(resolve =>
                requestAnimationFrame(resolve)
            );

            lesson.questions.push(newQuestion);

        }

        currentQuestion = 0;

        selectedObject = null;

        loadQuestion();

    } catch (error){
        console.error(error);
        alert(
            "We could not open this lesson pack. " +
            "Please make sure you selected a valid lesson ZIP file."  
        );
    }

    hideProgress()

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

function showProgress(totalQuestions) {

    progressBar.style.width = "0%";

    progressMessage.textContent =
        `Preparing ${totalQuestions} question${
            totalQuestions === 1 ? "" : "s"
        }...`;

    progressOverlay.hidden = false;
}

function updateProgress(
    completedQuestions,
    totalQuestions, 
    type
) {

    const percent = Math.round(
        (completedQuestions / totalQuestions) * 100
    );

    progressBar.style.width = `${percent}%`;

    progressMessage.textContent =
        `${type} question ${completedQuestions} of ${totalQuestions}...`;
}

function hideProgress() {
    progressOverlay.hidden = true;
}

document.addEventListener("keydown", event=>{
    const activeElement = document.activeElement;

    if (
        activeElement.matches(
            "input, textarea, [contenteditable='true']"
        )
    ) {
        return;
    }

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