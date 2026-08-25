// Data Structure
let lesson = {
    game: "classroom_pirates",

    instructions: {
        id: "instructions",
        name: "Instructions",
        objects: []
    },

    columnHeaders: Array(6).fill(null).map((_, i) => ({
        id: `column_${i}`,
        name: `Column ${i + 1}`,
        objects: []
    })),

    rowHeaders: Array(6).fill(null).map((_, i) => ({
        id: `row_${i}`,
        name: `Row ${i + 1}`,
        objects: []
    }))
};

let selectedCanvas = null;
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

const MIN_WIDTH = 80;
const MIN_HEIGHT = 40;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 300;
const FONT_STEP = 2;
const uploadButton = document.getElementById('upload-lesson-btn');
const saveButton = document.getElementById('save-lesson-btn');
const lessonFileInput = document.getElementById("lesson-file-input");
const addImageButton = document.getElementById('add-img-btn');
const addTextboxButton = document.getElementById('add-textbox-btn');
const fontBiggerButton = document.getElementById('font-bigger-btn');
const fontSmallerButton = document.getElementById('font-smaller-btn')
const clearCellButton = document.getElementById('clear-cell-btn');
const headerRow = document.getElementById('editor-column-headers');
const rowBody = document.getElementById('editor-row-body');
const imageInput = document.getElementById('image-file-input');
const editorCanvas = document.getElementById('editor-canvas');
const editorCanvasPlaceholder =
    document.getElementById('editor-canvas-placeholder');

const progressOverlay = document.getElementById("save-progress-overlay");
const progressBar = document.getElementById("save-progress-bar");
const progressMessage = document.getElementById("save-progress-message");


function initEditor() {

    // Clear the existing grid first
    headerRow.innerHTML = "";
    rowBody.innerHTML = "";


    // ========================================
    // TOP HEADER ROW
    // ========================================

    // ----------------------------------------
    // Instructions cell
    // ----------------------------------------

    const instructionsCell = document.createElement("th");

    instructionsCell.className = "grid-edit-cell";

    instructionsCell.dataset.type = "instructions";
    instructionsCell.dataset.index = "";

    instructionsCell.innerHTML = `
        <div class="cell-content">
            ${lesson.instructions.name}
        </div>
    `;

    instructionsCell.onclick = () =>
        selectCanvas(instructionsCell);

    headerRow.appendChild(instructionsCell);


    // ----------------------------------------
    // Six column headers
    // ----------------------------------------

    for (let i = 0; i < 6; i++) {

        const th = document.createElement("th");

        th.className = "grid-edit-cell";

        th.dataset.type = "column";
        th.dataset.index = i;

        th.innerHTML = `
            <div class="cell-content">
                ${lesson.columnHeaders[i].name}
            </div>
        `;

        th.onclick = () =>
            selectCanvas(th);

        headerRow.appendChild(th);
    }


    // ========================================
    // BODY ROWS
    // ========================================

    for (let i = 0; i < 6; i++) {

        const tr = document.createElement("tr");


        // ----------------------------------------
        // Row header
        // ----------------------------------------

        const rowHeader = document.createElement("td");

        rowHeader.className = "grid-edit-cell";

        rowHeader.dataset.type = "row";
        rowHeader.dataset.index = i;

        rowHeader.innerHTML = `
            <div class="cell-content">
                ${lesson.rowHeaders[i].name}
            </div>
        `;

        rowHeader.onclick = () =>
            selectCanvas(rowHeader);

        tr.appendChild(rowHeader);


        // ----------------------------------------
        // Six empty game cells
        // ----------------------------------------

        for (let j = 0; j < 6; j++) {

            const td = document.createElement("td");

            td.className = "empty-pool";

            tr.appendChild(td);
        }


        rowBody.appendChild(tr);
    }
}

async function saveLesson() {

    const totalCells = 13;
    let cells = 0;
    showProgress(totalCells);

    const zip = new JSZip();
    const imageFolder = zip.folder("images");

    const lessonData = {
        game: lesson.game,
        grade:"",
        name:"",

        instructions: {
            id: lesson.instructions.id,
            name: lesson.instructions.name,
            objects: []
        },

        columnHeaders: [],
        rowHeaders: []
    };


    // --------------------------------
    // Helper function for saving a canvas
    // --------------------------------

    async function saveCanvas(canvas, canvasType, canvasIndex = null) {

        // --------------------------------
        // Temporarily select this canvas
        // --------------------------------

        selectedObject = null;

        if (canvasType === "instructions") {

            selectedCanvas = {
                type: "instructions",
                index: null,
                element: null
            };

        }
        else {

            selectedCanvas = {
                type: canvasType,
                index: canvasIndex,
                element: null
            };

        }

        // Render the correct canvas
        renderCanvas();

        // Give the browser time to actually render it
        await new Promise(resolve =>
            requestAnimationFrame(() => {
                requestAnimationFrame(resolve);
            })
        );

        // --------------------------------
        // Create canvas data
        // --------------------------------

        const canvasData = {
            id: canvas.id,
            name: canvas.name,
            objects: [],
            screenshot: null,
        };

        for (let i = 0; i < canvas.objects.length; i++) {

            const object = canvas.objects[i];

            // -------------------------
            // TEXT OBJECT
            // -------------------------

            if (object.type === "text") {

                canvasData.objects.push({

                    type: "text",

                    text: object.text,

                    x: object.x,
                    y: object.y,

                    width: object.width,
                    height: object.height,

                    fontSize: object.fontSize,

                    locked: object.locked

                });

            }

            // -------------------------
            // IMAGE OBJECT
            // -------------------------

            else if (object.type === "image") {

                const imageName =
                    `${canvasType}_${canvasIndex ?? "instructions"}_image_${i}.png`;

                canvasData.objects.push({

                    type: "image",

                    image: `images/${imageName}`,

                    x: object.x,
                    y: object.y,

                    width: object.width,
                    height: object.height,

                    locked: object.locked

                });

                // Add the actual image file to the ZIP
                imageFolder.file(
                    `${imageName}`,
                    object.file
                );
            }
        }


        const screenshotCanvas = await html2canvas(editorCanvas);

        const imageBlob = await new Promise(resolve =>
            screenshotCanvas.toBlob(resolve)
        );
        if (!imageBlob) {
            throw new Error(
                `Failed to create screenshot for ${canvasType} ${canvasIndex ?? ""}`
            );
        }

        const screenshotName = `${canvasType}_${canvasIndex ?? "instructions"}_screenshot.png`;

        imageFolder.file(screenshotName, imageBlob);

        canvasData.screenshot = `images/${screenshotName}`;

        cells += 1;

        updateProgress(cells, totalCells, "Saving");

        return canvasData;
    }


    // --------------------------------
    // Instructions
    // --------------------------------

    lessonData.instructions =
        await saveCanvas(
            lesson.instructions,
            "instructions"
        );


    // --------------------------------
    // Column Headers
    // --------------------------------

    for (let i = 0; i < lesson.columnHeaders.length; i++) {

        const canvas = lesson.columnHeaders[i];

        const canvasData =
            await saveCanvas(
                canvas,
                "column",
                i
            );

        lessonData.columnHeaders.push(canvasData);
    }


    // --------------------------------
    // Row Headers
    // --------------------------------

    for (let i = 0; i < lesson.rowHeaders.length; i++) {

        const canvas = lesson.rowHeaders[i];

        const canvasData =
            await saveCanvas(
                canvas,
                "row",
                i
            );

        lessonData.rowHeaders.push(canvasData);
    }


    // --------------------------------
    // Add lesson.json
    // --------------------------------

    zip.file(
        "lesson.json",
        JSON.stringify(lessonData, null, 4)
    );


    // --------------------------------
    // Generate ZIP
    // --------------------------------

    try {

        const content =
            await zip.generateAsync({
                type: "blob"
            });

        const downloadLink =
            document.createElement("a");

        const url =
            URL.createObjectURL(content);

        downloadLink.href = url;

        downloadLink.download =
            "classroom_pirates_lesson.zip";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);

        URL.revokeObjectURL(url);

    } catch (error) {

        console.error(
            "Error saving lesson:",
            error
        );

        alert(
            "There was an error saving the lesson."
        );
    }
    hideProgress();
}

async function uploadLesson(file) {

    const totalCells = 13;
    let cells = 0;
    showProgress(totalCells);

    try {

        // --------------------------------
        // Read ZIP
        // --------------------------------

        const zip =
            await JSZip.loadAsync(file);


        // --------------------------------
        // Read lesson.json
        // --------------------------------

        const lessonFile =
            zip.file("lesson.json");

        if (!lessonFile) {

            alert(
                "This ZIP file does not contain lesson.json."
            );

            return;
        }

        const jsonText =
            await lessonFile.async("text");

        const lessonData =
            JSON.parse(jsonText);


        // --------------------------------
        // Verify game
        // --------------------------------

        if (
            lessonData.game !== "classroom_pirates"
        ) {

            alert(
                "This lesson pack is not for Classroom Pirates."
            );

            return;
        }


        // --------------------------------
        // Rebuild instructions
        // --------------------------------

        lesson.instructions = {
            id: lessonData.instructions.id,
            name: lessonData.instructions.name,
            objects: []
        };


        // --------------------------------
        // Rebuild a canvas
        // --------------------------------

        async function loadCanvas(canvasData) {

            const canvas = {

                id: canvasData.id,

                name: canvasData.name,

                objects: []

            };


            for (
                let i = 0;
                i < canvasData.objects.length;
                i++
            ) {

                const object =
                    canvasData.objects[i];


                // -------------------------
                // TEXT
                // -------------------------

                if (object.type === "text") {

                    canvas.objects.push({

                        type: "text",

                        text: object.text,

                        x: object.x,
                        y: object.y,

                        width: object.width,
                        height: object.height,

                        fontSize: object.fontSize,

                        locked: object.locked

                    });

                }


                // -------------------------
                // IMAGE
                // -------------------------

                else if (object.type === "image") {

                    const imagePath =
                        object.image;

                    const imageFile =
                        zip.file(imagePath);

                    if (!imageFile) {

                        console.warn(
                            "Missing image:",
                            imagePath
                        );

                        continue;
                    }

                    const imageBlob =
                        await imageFile.async("blob");


                    const imageFileObject =
                        new File(
                            [imageBlob],
                            imagePath.split("/").pop(),
                            {
                                type: imageBlob.type
                            }
                        );


                    const imageURL =
                        URL.createObjectURL(
                            imageFileObject
                        );


                    canvas.objects.push({

                        type: "image",

                        file: imageFileObject,

                        url: imageURL,

                        x: object.x,
                        y: object.y,

                        width: object.width,
                        height: object.height,

                        locked: object.locked

                    });
                }
            }
            cells += 1;
            updateProgress(cells, totalCells, "Loading");
            return canvas;
        }


        // --------------------------------
        // Load instructions objects
        // --------------------------------

        lesson.instructions =
            await loadCanvas(
                lessonData.instructions
            );


        // --------------------------------
        // Load columns
        // --------------------------------

        lesson.columnHeaders = [];

        for (
            let i = 0;
            i < lessonData.columnHeaders.length;
            i++
        ) {

            const canvas =
                await loadCanvas(
                    lessonData.columnHeaders[i]
                );

            lesson.columnHeaders.push(canvas);
        }


        // --------------------------------
        // Load rows
        // --------------------------------

        lesson.rowHeaders = [];

        for (
            let i = 0;
            i < lessonData.rowHeaders.length;
            i++
        ) {

            const canvas =
                await loadCanvas(
                    lessonData.rowHeaders[i]
                );

            lesson.rowHeaders.push(canvas);
        }


        // --------------------------------
        // Reset editor selection
        // --------------------------------

        selectedCanvas = null;

        selectedObject = null;


        // --------------------------------
        // Render
        // --------------------------------

        renderCanvas();

    } catch (error) {

        console.error(
            "Error uploading lesson:",
            error
        );

        alert(
            "There was an error loading this lesson pack."
        );
    }
    hideProgress();
}

function selectCanvas(element) {
    // 1. Remove 'selected' class from all other cells
    document.querySelectorAll('.grid-edit-cell').forEach(el => el.classList.remove('selected'));
    
    // 2. Add 'selected' class to the clicked cell
    element.classList.add('selected');
    
    // 3. Store the selection
    selectedCanvas = {
        type: element.dataset.type,
        index: element.dataset.index ? parseInt(element.dataset.index) : null,
        element: element
    };
    
    // 4. Update the label
    const label =
        selectedCanvas.type === "instructions"
        ? "Instructions"
        : selectedCanvas.type === "column"
            ? `Column ${selectedCanvas.index + 1}`
            : `Row ${selectedCanvas.index + 1}`;

    document.getElementById('selected-canvas-label').textContent = label;
    console.log("Selected canvas:", selectedCanvas);
    selectedObject = null;
    renderCanvas();
}

function getSelectedCanvas() {

    if (!selectedCanvas) {
        return null;
    }

    if (selectedCanvas.type === "instructions") {
        return lesson.instructions;
    }

    if (selectedCanvas.type === "column") {
        return lesson.columnHeaders[selectedCanvas.index];
    }

    if (selectedCanvas.type === "row") {
        return lesson.rowHeaders[selectedCanvas.index];
    }

    return null;
}

function renderCanvas() {

    // Clear the editor
    editorCanvas.innerHTML = "";

    // Nothing selected
    if (!selectedCanvas) {
        const placeholder = document.createElement("div");

        placeholder.id = "editor-canvas-placeholder";
        placeholder.textContent = "Select a canvas from the grid above.";

        editorCanvas.appendChild(placeholder);

        return;
    }

    // Get the currently selected logical canvas
    const canvas = getSelectedCanvas();

    if (!canvas) {
        return;
    }

    // Render every object belonging to this canvas
    canvas.objects.forEach((object, index) => {

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
    uploadButton.disabled = true;
    saveButton.disabled = true;
    clearCellButton.disabled = true;
    addImageButton.disabled = true;
    addTextboxButton.disabled = true;
    event.stopPropagation();
    const textbox = event.target;
    textbox.contentEditable = true;
    textbox.focus();
    document.execCommand("selectAll", false, null);
}

function finishEditing(event){
    uploadButton.disabled = false;
    saveButton.disabled = false;
    clearCellButton.disabled = false;
    addImageButton.disabled = false;
    addTextboxButton.disabled = false;
    const textbox = event.target;
    textbox.contentEditable = false;
    const index = Number(textbox.dataset.index);
    const canvas = getSelectedCanvas();
    if (!canvas) {
        return
    }
    canvas.objects[index].text = textbox.textContent;
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

    const canvas = getSelectedCanvas();
    if (!canvas){
        return;
    }

    const object = canvas.objects[selectedObject];
    if (!object){
        return;
    }
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
    const canvas = getSelectedCanvas();
    if (!canvas) {
        return;
    }
    const object = canvas.objects[selectedObject];
    if (!object) {
        return;
    }
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
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    draggedElement = event.currentTarget.parentElement;
    selectedObject = Number(draggedElement.dataset.index);
    const canvas = getSelectedCanvas();

    if (!canvas) {
        return;
    }
    const object = canvas.objects[selectedObject];
    if (!object) {
        return;
    }
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
    const canvas = getSelectedCanvas();
    if (!canvas){
        return;
    }
    const object = canvas.objects[selectedObject];
    if (!object){
        return;
    }
   // Calculate new dimensions
    let newWidth =
        startWidth +
        (event.clientX - resizeStartX);

    let newHeight =
        startHeight +
        (event.clientY - resizeStartY);

    // Keep within limits
    newWidth = Math.max(
        MIN_WIDTH,
        Math.min(
            newWidth,
            editorCanvas.clientWidth - object.x
        )
    );

    newHeight = Math.max(
        MIN_HEIGHT,
        Math.min(
            newHeight,
            editorCanvas.clientHeight - object.y
        )
    );

    // Save dimensions
    object.width = newWidth;
    object.height = newHeight;

    // Immediately update the visible object
    draggedElement.style.width =
        `${newWidth}px`;

    draggedElement.style.height =
        `${newHeight}px`;
}

function addTextbox(){
    const width = 250;
    const height = 60;
    const canvas = getSelectedCanvas();
    if (!canvas) {
        alert("Please select a canvas first.");
        return;
    }
    canvas.objects.push({
        type:"text",
        text:"Double-click to edit",
        width,
        height,
        x: (editorCanvas.clientWidth - width) / 2,
        y: (editorCanvas.clientHeight - height) / 2,
        fontSize:32,
        locked: false,
    });
    // Select the newly created textbox
    selectedObject = canvas.objects.length - 1;
    renderCanvas();
}

function deleteSelectedObject(){
    if(selectedObject === null){
        return;
    }
    const canvas = getSelectedCanvas();
    if (!canvas) {
        return;
    }
    const object = canvas.objects[selectedObject];
    if (!object) {
        return;
    }
    canvas.objects.splice(selectedObject, 1);
    selectedObject = null;
    renderCanvas();
}

function increaseFontSize(){
    if(selectedObject === null){
        return;
    }
    const canvas = getSelectedCanvas();
    if (!canvas){
        return;
    }
    const object = canvas.objects[selectedObject];
    if (!object){
        return;
    }
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
    const canvas = getSelectedCanvas();
    if(!canvas){
        return;
    }

    const object = canvas.objects[selectedObject];
    if (!object){
        return;
    }

    if(object.type !== "text"){
        return;
    }

    object.fontSize = Math.max(
        MIN_FONT_SIZE,
        object.fontSize - FONT_STEP
    );

    renderCanvas();

}

function deleteAllCanvasObjects() {

    const canvas = getSelectedCanvas();

    if (!canvas) {
        alert("Please select a canvas first.");
        return;
    }

    if (canvas.objects.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear everything from this canvas?"
    );

    if (!confirmed) {
        return;
    }

    // Remove all objects from the selected canvas
    canvas.objects = [];

    // Clear the current object selection
    selectedObject = null;

    // Redraw the canvas
    renderCanvas();
}

function showProgress(totalQuestions) {

    progressBar.style.width = "0%";

    progressMessage.textContent =
        `Preparing ${totalQuestions} cells${
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
        `${type} cells ${completedQuestions} of ${totalQuestions}...`;
}

function hideProgress() {
    progressOverlay.hidden = true;
}

document.addEventListener("DOMContentLoaded", () => {
    initEditor();
});

addImageButton.addEventListener("click", () => {

    if (!selectedCanvas) {
        alert("Please select a canvas first.");
        return;
    }

    imageInput.click();
});

imageInput.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const canvas = getSelectedCanvas();

    if (!canvas) {
        alert("Please select a canvas first.");
        return;
    }

    const width = 250;
    const height = 200;

    const imageObject = {

        type: "image",

        file: file,

        x: (editorCanvas.clientWidth - width) / 2,
        y: (editorCanvas.clientHeight - height) / 2,

        width: width,
        height: height,

        locked: false
    };

    canvas.objects.push(imageObject);

    // Select the newly added object
    selectedObject = canvas.objects.length - 1;

    // Draw it
    renderCanvas();

    // Reset the file input so selecting the same
    // image again will trigger change
    imageInput.value = "";
});

document.addEventListener("mousemove", event => {

    if(isDragging){

        dragObject(event);

    }

    if(isResizing){

        resizeObject(event);

    }

});

document.addEventListener("mouseup", stopDragging);

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

clearCellButton.addEventListener("click", deleteAllCanvasObjects);

addTextboxButton.addEventListener("click", addTextbox);

fontBiggerButton.addEventListener(
    "click",
    increaseFontSize
);

fontSmallerButton.addEventListener(
    "click",
    decreaseFontSize
);

uploadButton.addEventListener("click", () => {

    lessonFileInput.click();

});

lessonFileInput.addEventListener("change", async (event) => {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    await uploadLesson(file);

    lessonFileInput.value = "";

});

saveButton.addEventListener("click", saveLesson);