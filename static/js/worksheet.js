let activeTextField = null;

document.getElementById("export")
.addEventListener("click", exportWorksheet);

document.getElementById("add-section").addEventListener("click", () => {
    document.getElementById("add-section-modal").classList.remove("hidden");
});

document.querySelectorAll(".type-btn, .add-choice").forEach(button => {
    button.addEventListener("click", () => {
        const type = button.dataset.sectionType;

        const creators = {
            unscramble: addUnscrambleSection,
            fill_blank: addFillBlankSection,
            translation: addTranslationSection,
            word_search: addWordSearchSection
        };

        const createSection = creators[type];

        if (createSection) {
            const section = createSection();

            if (section) {
                focusSection(section);
            }
        }

        const modal = document.getElementById("add-section-modal");
        if (modal) modal.classList.add("hidden");
    });
});

document.querySelector(".close-overlay")?.addEventListener("click", () => {
    document.getElementById("add-section-modal").classList.add("hidden");
});

document.getElementById("add-section-modal")?.addEventListener("click", (event) => {
    if (event.target.id === "add-section-modal") {
        event.target.classList.add("hidden");
    }
});

document.addEventListener("click", (event) => {
    const section = event.target.closest(".section");

    if (!section) return;

    document.querySelectorAll(".section").forEach(item => {
        item.classList.remove("is-selected");
    });

    section.classList.add("is-selected");
    syncOutlineSelection();
});


document.addEventListener("focusin", (event) => {

    if (!event.target.matches("input[type='text']")) {
        return;
    }

    // Ignore content inputs
    if (
        event.target.classList.contains("unscramble-word") ||
        event.target.classList.contains("translation-word") ||
        event.target.classList.contains("wordsearch-word") ||
        event.target.classList.contains("question-input")
    ) {
        activeTextField = null;
        setToolbarEnabled(false);
        return;
    }

    setToolbarEnabled(true);

    activeTextField = event.target;

    const currentSize = parseInt(
        window.getComputedStyle(activeTextField).fontSize
    );

    document.getElementById("font-size").value =
        currentSize;

});

document.getElementById("bold-btn")
    .addEventListener("click", () => {

        if (!activeTextField) return;

        activeTextField.classList.toggle("bold");

        activeTextField.dataset.bold =
            activeTextField.classList.contains("bold");
    });

document.getElementById("italic-btn")
    .addEventListener("click", () => {

        if (!activeTextField) return;

        activeTextField.classList.toggle("italic");

        activeTextField.dataset.italic =
            activeTextField.classList.contains("italic");
    });

document.getElementById("underline-btn")
    .addEventListener("click", () => {

        if (!activeTextField) return;

        activeTextField.classList.toggle("underline");

        activeTextField.dataset.underline =
            activeTextField.classList.contains("underline");
    });

document.getElementById("font-size")
    .addEventListener("change", () => {

        if (!activeTextField) return;

        const size =
            document.getElementById("font-size").value;

        activeTextField.style.fontSize =
            size + "px";

        activeTextField.dataset.fontSize = size;

    });


function createOutlineItem(section) {
    const outline = document.getElementById("section-outline");
    if (!outline) return;

    if (!section.dataset.uid) {
        section.dataset.uid = `section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }

    const item = document.createElement("li");
    item.classList.add("outline-item");
    item.dataset.uid = section.dataset.uid;

    const sectionTitle =
        section.querySelector(".section-title")?.value ||
        "Untitled Section";

    item.textContent = sectionTitle;

    item.addEventListener("click", () => {
        focusSection(section);
        syncOutlineSelection();
    });

    outline.appendChild(item);

    const emptyState = outline.querySelector(".outline-empty");
    if (emptyState) emptyState.remove();

    return item;
}

function syncOutlineSelection() {
    const activeSection = document.querySelector(".section.is-selected");
    const outlineItems = document.querySelectorAll(".outline-item");

    outlineItems.forEach(item => {
        item.classList.remove("is-active");
    });

    if (!activeSection) return;

    const sectionTitle = activeSection.querySelector(".section-title")?.value;

    outlineItems.forEach(item => {
        if (item.textContent.trim() === (sectionTitle || "Untitled Section")) {
            item.classList.add("is-active");
        }
    });
}

function syncOutlineOrder() {
    const outline = document.getElementById("section-outline");
    if (!outline) return;

    const sections = [...document.querySelectorAll(".section")];
    const items = [...outline.querySelectorAll(".outline-item")];

    const itemMap = new Map();
    items.forEach(item => itemMap.set(item.dataset.uid, item));

    const orderedItems = sections
        .map(section => itemMap.get(section.dataset.uid))
        .filter(Boolean);

    orderedItems.forEach(item => outline.appendChild(item));
}

async function exportWorksheet() {

    const data = {

        title: document.querySelector(".title-input").value,

        headers: [],

        sections: []
    };


    // Collect headers

    document.querySelectorAll(
        ".header-options input:checked"
    ).forEach(box => {

        const label =
            box.parentElement.innerText.trim();

        data.headers.push(label);

    });


    // Collect sections

    document.querySelectorAll(".section")
        .forEach(section => {

            const type = section.dataset.type;


            // ==========================
            // UNSCRAMBLE SECTION
            // ==========================

            if (type === "unscramble") {

                const words = [];

                section.querySelectorAll(".unscramble-word")
                    .forEach(input => {

                        const word =
                            input.value.trim();

                        if (word !== "") {

                            words.push(word);

                        }

                    });

                const titleField =
                    section.querySelector(".section-title");

                const titleFormatting = {

                    bold: titleField.classList.contains("bold"),

                    italic: titleField.classList.contains("italic"),

                    underline: titleField.classList.contains("underline"),

                    font_size: parseInt(
                        titleField.style.fontSize
                    ) || 12
                };

                data.sections.push({

                    type: "unscramble",

                    title: titleField.value,

                    formatting: titleFormatting,

                    show_word_bank:
                        section.querySelector(
                            ".word-bank"
                        ).checked,

                    words: words

                });
            }


            // ==========================
            // FILL BLANK SECTION
            // ==========================

             else if (type === "fill_blank") {

                const questions = [];

                section.querySelectorAll(
                    ".question-list li"
                ).forEach(item => {

                    questions.push(
                        item.dataset.original
                    );

                });

                const titleField =
                    section.querySelector(".section-title");

                const titleFormatting = {

                    bold: titleField.classList.contains("bold"),

                    italic: titleField.classList.contains("italic"),

                    underline: titleField.classList.contains("underline"),

                    font_size: parseInt(
                        titleField.style.fontSize
                    ) || 12
                };

                data.sections.push({

                    type: "fill_blank",

                    title: titleField.value,

                    formatting: titleFormatting,

                    questions: questions

                });
            }

            // ==========================
            // TRANSLATION SECTION
            // ==========================

            else if (type === "translation") {

                const pairs = [];

                section.querySelectorAll(".translation-pair-row").forEach(row => {
                    const source = row.querySelector(".translation-source")?.value.trim() || "";
                    const target = row.querySelector(".translation-target")?.value.trim() || "";

                    if (source || target) {
                        pairs.push({ source, target });
                    }
                });

                const titleField =
                    section.querySelector(".section-title");

                const titleFormatting = {

                    bold: titleField.classList.contains("bold"),

                    italic: titleField.classList.contains("italic"),

                    underline: titleField.classList.contains("underline"),

                    font_size: parseInt(
                        titleField.style.fontSize
                    ) || 12
                };


                data.sections.push({

                    type: "translation",

                    title: titleField.value,

                    formatting: titleFormatting,

                    direction: section.querySelector(
                        ".translation-direction"
                    ).value,

                    pairs: pairs

                });
            }

            // ==========================
            // WORD SEARCH SECTION
            // ========================== 
            else if (type === "word_search") {

                const words = [];

                section.querySelectorAll(".wordsearch-word")
                    .forEach(input => {

                        const word = input.value.trim();

                        if (word !== "") {
                            words.push(word);
                        }

                    });

                const titleField =
                    section.querySelector(".section-title");

                const titleFormatting = {

                    bold: titleField.classList.contains("bold"),

                    italic: titleField.classList.contains("italic"),

                    underline: titleField.classList.contains("underline"),

                    font_size: parseInt(
                        titleField.style.fontSize
                    ) || 12
                };

                data.sections.push({

                    type: "word_search",

                    title: titleField.value,

                    formatting: titleFormatting,

                    grid_size: section.querySelector(
                        ".wordsearch-size"
                    ).value,

                    difficulty: section.querySelector(
                        ".wordsearch-difficulty"
                    ).value,

                    instructions: section.querySelector(
                        ".wordsearch-instructions"
                    ).value,

                    words: words

                });
            }
        });


    // Send data to Flask

    const response = await fetch("/export", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });


    const blob = await response.blob();

    const url =
        window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "TeachersOnlineWorksheet.zip";

    document.body.appendChild(a);

    a.click();

    a.remove();

}

function focusSection(section) {
    document.querySelectorAll(".section").forEach(item => {
        item.classList.remove("is-selected");
    });

    section.classList.add("is-selected");

    const canvas = document.querySelector(".worksheet-canvas");
    if (!canvas) return;

    const targetTop = Math.max(section.offsetTop - 12, 0);
    canvas.scrollTo({
        top: targetTop,
        behavior: "smooth"
    });
}

function addUnscrambleSection() {

    const container =
        document.getElementById("sections-container");


    const section = document.createElement("div");

    section.classList.add("section");
    section.dataset.type = "unscramble";


    section.innerHTML = `
        <div class="section-card">
            <div class="section-card__header">
                <span class="section-card__badge">Unscramble</span>

                <input
                    type="text"
                    class="section-title"
                    value="Unscramble the Words"
                >

                <div class="section-card__actions">
                    <button class="move-up" type="button" aria-label="Move section up">↑</button>
                    <button class="move-down" type="button" aria-label="Move section down">↓</button>
                    <button class="delete-section" type="button">Delete</button>
                </div>
            </div>

            <div class="section-card__body">
                <label class="toggle-row">
                    <input type="checkbox" class="word-bank" checked>
                    <span>Show word bank</span>
                </label>

                <div class="word-list-toolbar">
                    <span class="section-card__meta">Words</span>
                    <button class="add-word-row" type="button">+ Add word</button>
                </div>

                <div class="word-list">
                    ${createUnscrambleWordRow("")}
                    ${createUnscrambleWordRow("")}
                    ${createUnscrambleWordRow("")}
                </div>
            </div>
        </div>
    `;


    section.querySelector(".delete-section")
        .addEventListener("click", () => {

            section.remove();
            removeSection(section);

        });

    section.querySelector(".move-up")
        .addEventListener("click", () => {

            moveSectionUp(section);

        });


    section.querySelector(".move-down")
        .addEventListener("click", () => {

            moveSectionDown(section);

        });

    section.querySelector(".add-word-row").addEventListener("click", () => {
        const list = section.querySelector(".word-list");
        list.appendChild(createWordRowElement(""));
    });

    section.querySelectorAll(".word-row .remove-word").forEach(button => {
        button.addEventListener("click", () => {
            const row = button.closest(".word-row");
            if (row) row.remove();
        });
    });

    
    section.dataset.uid = `section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    container.appendChild(section);
    const outlineItem = createOutlineItem(section);
    if (outlineItem) {
        outlineItem.dataset.sectionId = section.dataset.type;
        outlineItem.dataset.uid = section.dataset.uid;
    }
    return section;
}

function createUnscrambleWordRow(value = "") {
    return `
        <div class="word-row">
            <input
                type="text"
                class="unscramble-word"
                maxlength="12"
                placeholder="word"
                value="${value}"
            >
            <button
                type="button"
                class="remove-word"
                aria-label="Remove word"
            >
                ×
            </button>
        </div>
    `;
}

function createWordRowElement(value = "") {
    const row = document.createElement("div");
    row.classList.add("word-row");

    const input = document.createElement("input");
    input.type = "text";
    input.className = "unscramble-word";
    input.maxLength = 12;
    input.placeholder = "word";
    input.value = value;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-word";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Remove word");

    removeButton.addEventListener("click", () => {
        row.remove();
    });

    row.appendChild(input);
    row.appendChild(removeButton);

    return row;
}

function generateWordInputs() {

    let html = "";

    for (let i = 0; i < 12; i++) {

        html += `
            <input
                type="text"
                class="unscramble-word"
                maxlength="12"
                placeholder="word"
            >
        `;
    }

    return html;
}

function addFillBlankSection() {

    const container =
        document.getElementById("sections-container");


    const section = document.createElement("div");

    section.classList.add("section");
    section.dataset.type = "fill_blank";


    section.innerHTML = `
        <div class="section-card">
            <div class="section-card__header">
                <span class="section-card__badge">Fill in the blanks</span>

                <input
                    type="text"
                    class="section-title"
                    value="Fill in the Blanks"
                >

                <div class="section-card__actions">
                    <button class="move-up" type="button" aria-label="Move section up">↑</button>
                    <button class="move-down" type="button" aria-label="Move section down">↓</button>
                    <button class="delete-section" type="button">Delete</button>
                </div>
            </div>

            <div class="section-card__body">
                <div class="question-entry">
                    <label class="question-entry__label">Sentence</label>
                    <input
                        type="text"
                        class="question-input"
                        placeholder="Type a sentence with the answer in parentheses..."
                    >
                </div>

                <button class="add-question" type="button">Add Question</button>

                <div class="section-card__meta">
                    <span>Questions</span>
                </div>

                <ul class="question-list"></ul>
            </div>
        </div>
    `;


    // Delete section
    section.querySelector(".delete-section")
        .addEventListener("click", () => {

            section.remove();
            removeSection(section);

        });

    section.querySelector(".move-up")
        .addEventListener("click", () => {

            moveSectionUp(section);

        });


    section.querySelector(".move-down")
        .addEventListener("click", () => {

            moveSectionDown(section);

        });


    // Add question button
    section.querySelector(".add-question")
        .addEventListener("click", () => {

            addQuestion(section);

        });


    section.dataset.uid = `section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    container.appendChild(section);
    const outlineItem = createOutlineItem(section);
    if (outlineItem) {
        outlineItem.dataset.sectionId = section.dataset.type;
        outlineItem.dataset.uid = section.dataset.uid;
    }
    return section;
}

function addQuestion(section) {

    const input =
        section.querySelector(".question-input");

    const list =
        section.querySelector(".question-list");


    const text = input.value.trim();

    if (text === "") {
        return;
    }


    // Replace answers with blanks
    const preview =
        text.replace(/\((.*?)\)/g, "_____");

    const item = document.createElement("li");
    item.classList.add("question-item");

    const previewText = document.createElement("span");
    previewText.textContent = preview;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-question";
    removeButton.setAttribute("aria-label", "Delete question");
    removeButton.title = "Delete question";
    removeButton.textContent = "🗑";
    removeButton.addEventListener("click", () => {
        item.remove();
    });

    item.appendChild(previewText);
    item.appendChild(removeButton);

    // Store original sentence for export later
    item.dataset.original = text;


    list.appendChild(item);

    input.value = "";
}

function addTranslationSection() {
    const container = document.getElementById("sections-container");

    const section = document.createElement("div");
    section.classList.add("section");
    section.dataset.type = "translation";

    section.innerHTML = `
        <div class="section-card">
            <div class="section-card__header">
                <span class="section-card__badge">Translate</span>

                <input
                    type="text"
                    class="section-title"
                    value="Translate the Words"
                >

                <div class="section-card__actions">
                    <button class="move-up" type="button" aria-label="Move section up">↑</button>
                    <button class="move-down" type="button" aria-label="Move section down">↓</button>
                    <button class="delete-section" type="button">Delete</button>
                </div>
            </div>

            <div class="section-card__body">
                <div class="translation-options">
                    <label class="translation-label">
                        Direction:
                        <select class="translation-direction">
                        <option value="auto|ko">English → Korean</option>
                        <option value="auto|en">Autodetect → English</option>
                        <option value="auto|ja">English → Japanese</option>
                        <option value="auto|fr">English → French</option>
                        <option value="auto|es">English → Spanish</option>
                        </select>
                    </label>
                </div>

                <div class="translation-toolbar">
                    <span class="section-card__meta">Pairs</span>
                    <button class="add-translation-pair" type="button">+ Add pair</button>
                </div>

                <div class="translation-pairs">
                    ${createTranslationPairRow("", "")}
                    ${createTranslationPairRow("", "")}
                    ${createTranslationPairRow("", "")}
                </div>
            </div>
        </div>
    `;

    const directionSelect = section.querySelector(".translation-direction");

    section.querySelectorAll(".translation-pair-row").forEach((row) => {
        attachTranslationPairBehavior(row, directionSelect);
    });

    section.querySelector(".add-translation-pair").addEventListener("click", () => {
        const list = section.querySelector(".translation-pairs");
        const row = createTranslationPairElement("", "");
        list.appendChild(row);
        attachTranslationPairBehavior(row, directionSelect);
    });


    section.querySelector(".delete-section").addEventListener("click", () => {
        removeSection(section);
    });

    section.querySelector(".move-up").addEventListener("click", () => {
        moveSectionUp(section);
    });

    section.querySelector(".move-down").addEventListener("click", () => {
        moveSectionDown(section);
    });

    const titleInput = section.querySelector(".section-title");

    directionSelect.addEventListener("change", () => {
        titleInput.value = `Translate the Words (${directionSelect.value})`;
    });

    section.dataset.uid = `section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    container.appendChild(section);

    const outlineItem = createOutlineItem(section);
    if (outlineItem) {
        outlineItem.dataset.sectionId = section.dataset.type;
        outlineItem.dataset.uid = section.dataset.uid;
    }

    return section;
}

function createTranslationPairRow(source = "", target = "") {
    return `
        <div class="translation-pair-row">
            <input
                type="text"
                class="translation-word translation-source"
                placeholder="word"
                value="${source}"
            >
            <span class="translation-arrow">→</span>
            <input
                type="text"
                class="translation-word translation-target"
                placeholder="translation"
                value="${target}"
            >
            <button type="button" class="remove-translation-pair" aria-label="Remove pair">×</button>
        </div>
    `;
}

function createTranslationPairElement(source = "", target = "") {
    const row = document.createElement("div");
    row.classList.add("translation-pair-row");

    const sourceInput = document.createElement("input");
    sourceInput.type = "text";
    sourceInput.className = "translation-word translation-source";
    sourceInput.placeholder = "word";
    sourceInput.value = source;

    const arrow = document.createElement("span");
    arrow.className = "translation-arrow";
    arrow.textContent = "→";

    const targetInput = document.createElement("input");
    targetInput.type = "text";
    targetInput.className = "translation-word translation-target";
    targetInput.placeholder = "translation";
    targetInput.value = target;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-translation-pair";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", "Remove pair");

    row.appendChild(sourceInput);
    row.appendChild(arrow);
    row.appendChild(targetInput);
    row.appendChild(removeButton);

    return row;
}

function attachTranslationPairBehavior(row, directionSelect) {
    const sourceInput = row.querySelector(".translation-source");
    const targetInput = row.querySelector(".translation-target");
    const removeButton = row.querySelector(".remove-translation-pair");

    if (!sourceInput || !targetInput) return;

    let requestToken = 0;

    sourceInput.addEventListener("input", async () => {
        const text = sourceInput.value.trim();

        if (!text) {
            targetInput.value = "";
            return;
        }
        const [sourceLang, targetLang] = (directionSelect.value || "auto|ko").split("|");
        const currentToken = ++requestToken;

        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify({
                text,
                source: sourceLang,
                target: targetLang
                })
            });

            const data = await response.json();

            if (currentToken !== requestToken) return;

            if (data.translation) {
                targetInput.value = data.translation;
            }
        } catch (error) {
            console.error("Translation request failed:", error);
        }
    });

    if (removeButton) {
        removeButton.addEventListener("click", () => {
            row.remove();
        });
    }
}

function addWordSearchSection() {

    const container =
        document.getElementById(
            "sections-container"
        );

    const section =
        document.createElement("div");

    section.classList.add("section");

    section.dataset.type =
        "word_search";

    section.innerHTML = `
        <div class="section-card">
            <div class="section-card__header">
                <span class="section-card__badge">Word search</span>

                <input
                    type="text"
                    class="section-title"
                    value="Find the Words"
                >

                <div class="section-card__actions">
                    <button class="move-up" type="button" aria-label="Move section up">↑</button>
                    <button class="move-down" type="button" aria-label="Move section down">↓</button>
                    <button class="delete-section" type="button">Delete</button>
                </div>
            </div>

            <div class="section-card__body">
                <div class="word-search-options">
                    <label class="wordsearch-option">
                        Difficulty:
                        <select class="wordsearch-difficulty">
                            <option>Beginner</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </label>

                    <label class="wordsearch-option">
                        Grid Size:
                        <select class="wordsearch-size">
                            <option>Small (8 x 8)</option>
                            <option>Medium (12 x 12)</option>
                            <option>Large (15 x 15)</option>
                            <option>Extra Large (20 x 20)</option>
                        </select>
                    </label>
                </div>

                <div class="instructions-block">
                    <label class="question-entry__label">Instructions</label>
                    <input
                        type="text"
                        class="wordsearch-instructions"
                        value="The words can be ➡⬇"
                    >
                </div>

                <div class="section-card__meta">
                    <span>Words</span>
                </div>

                <div class="word-grid">
                    ${generateWordSearchInputs()}
                </div>
            </div>
        </div>
    `;


    section.querySelector(".delete-section")
        .addEventListener("click", () => {

            section.remove();
            removeSection(section);
        });

    section.querySelector(".move-up")
        .addEventListener("click", () => {

            moveSectionUp(section);

        });


    section.querySelector(".move-down")
        .addEventListener("click", () => {

            moveSectionDown(section);

        });


    const difficultySelect =
        section.querySelector(
            ".wordsearch-difficulty"
        );

    const instructionInput =
        section.querySelector(
            ".wordsearch-instructions"
        );


    difficultySelect.addEventListener(
        "change",
        () => {

            if (
                difficultySelect.value ===
                "Beginner"
            ) {

                instructionInput.value =
                    "The words can be ➡⬇";

            }

            else if (
                difficultySelect.value ===
                "Medium"
            ) {

                instructionInput.value =
                    "The words can be ➡⬇↗↘";

            }

            else {

                instructionInput.value =
                    "The words can be ➡⬅⬆⬇↗↘↙↖";

            }

        }
    );


    section.dataset.uid = `section-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    container.appendChild(section);
    const outlineItem = createOutlineItem(section);
    if (outlineItem) {
        outlineItem.dataset.sectionId = section.dataset.type;
        outlineItem.dataset.uid = section.dataset.uid;
    }
    return section;
}

function generateWordSearchInputs() {

    let html = "";

    for (let i = 0; i < 9; i++) {

        html += `

            <input
                type="text"
                class="wordsearch-word"
                maxlength="20"
                placeholder="word"
            >

        `;
    }

    return html;
}

function moveSectionUp(section) {

    const previous =
        section.previousElementSibling;

    if (previous) {

        section.parentNode.insertBefore(
            section,
            previous
        );
        syncOutlineOrder();

    }
}

function moveSectionDown(section) {

    const next =
        section.nextElementSibling;

    if (next) {

        section.parentNode.insertBefore(
            next,
            section
        );
        syncOutlineOrder();

    }
}

function removeSection(section) {
    if (!section) return;

    const outlineItem = document.querySelector(`.outline-item[data-uid="${section.dataset.uid}"]`);
    if (outlineItem) outlineItem.remove();

    section.remove();

    if (document.querySelectorAll(".section").length === 0) {
        const outline = document.getElementById("section-outline");
        if (outline && !outline.querySelector(".outline-empty")) {
            const empty = document.createElement("li");
            empty.classList.add("outline-empty");
            empty.textContent = "No sections yet";
            outline.appendChild(empty);
        }
    }
}

function setToolbarEnabled(enabled) {

    document.getElementById("font-size").disabled =
        !enabled;

    document.getElementById("bold-btn").disabled =
        !enabled;

    document.getElementById("italic-btn").disabled =
        !enabled;

    document.getElementById("underline-btn").disabled =
        !enabled;
}