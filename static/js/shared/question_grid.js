// static/js/shared/question_grid.js

window.QuestionGrid = {
    render({
        container,
        items,
        onSelect,
        getLabel = (item, index) => index + 1,
        isUsed = (item) => item.used === true,
        usedClass = "used-card",
        cardClass = "question-card",
        clickSound = null
    }) {
        container.innerHTML = "";

        items.forEach((item, index) => {
            const card = document.createElement("div");
            card.classList.add(cardClass);

            card.textContent = getLabel(item, index);
            card.dataset.index = index;

            if (isUsed(item)) {
                card.classList.add(usedClass);
            }

            card.addEventListener("click", () => {
                if (clickSound) {
                    clickSound.play();
                }

                if (isUsed(item)) {
                    return;
                }

                onSelect({
                    item,
                    index,
                    card
                });
            });

            container.appendChild(card);
        });
    },

    refresh({
        container,
        items,
        onSelect,
        getLabel,
        isUsed,
        usedClass,
        cardClass,
        clickSound
    }) {
        this.render({
            container,
            items,
            onSelect,
            getLabel,
            isUsed,
            usedClass,
            cardClass,
            clickSound
        });
    }
};