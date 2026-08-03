window.GameUI = {

    showOnly(elementToShow, elementsToHide = []) {

        elementToShow.hidden = false;

        elementsToHide.forEach(element => {
            element.hidden = true;
        });
    }
};