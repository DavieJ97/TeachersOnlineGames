window.LessonLoader = {

    async loadLesson(file, game) {

        if (!file) {
            throw new Error(
                "No lesson pack was selected."
            );
        }

        // -----------------------------
        // Load ZIP
        // -----------------------------
        const zip =
            await JSZip.loadAsync(file);


        // -----------------------------
        // Load lesson.json
        // -----------------------------

        const lessonFile =
            zip.file("lesson.json");

        if (!lessonFile) {

            throw new Error(
                "This ZIP does not contain lesson.json."
            );
        }
        const jsonText = await lessonFile.async("string");
        const lessonData = JSON.parse(jsonText);
        // -----------------------------
        // Verify game
        // -----------------------------

        if (
            lessonData.game !== game
        ) {

            throw new Error(
                `This lesson pack is not for ${game}.`
            );
        }
        // -----------------------------
        // Verify lesson structure
        // -----------------------------

        if (!lessonData.instructions) {

            throw new Error(
                "This lesson pack has no instructions canvas."
            );
        }

        if (!Array.isArray(lessonData.columnHeaders)) {

            throw new Error(
                "This lesson pack has no column headers."
            );
        }

        if (!Array.isArray(lessonData.rowHeaders)) {

            throw new Error(
                "This lesson pack has no row headers."
            );
        }


        // -----------------------------
        // Return lesson
        // -----------------------------

        return {

            lessonData: lessonData,

            zip: zip

        };
    },

    async load(file) {

        if (!file) {
            throw new Error("No lesson pack was selected.");
        }

        const zip = await JSZip.loadAsync(file);

        const lessonFile = zip.file("lesson.json");

        if (!lessonFile) {
            throw new Error(
                "This ZIP does not contain lesson.json."
            );
        }


        const jsonText = await lessonFile.async("string");

        const lessonData = JSON.parse(jsonText);

        if (!Array.isArray(lessonData.questions)) {
            throw new Error(
                "This lesson pack has no questions."
            );
        }

        return {
            zip: zip,
            lessonData: lessonData
        };
    },

    async getBlob(zip, assetPath) {

        const assetFile = zip.file(assetPath);

        if (!assetFile) {
            throw new Error(
                `The lesson pack is missing: ${assetPath}`
            );
        }

        return assetFile.async("blob");
    },

    async getFile(
        zip,
        assetPath,
        fileName = "image",
        mimeType = ""
    ) {

        const blob = await this.getBlob(
            zip,
            assetPath
        );

        return new File(
            [blob],
            fileName,
            {
                type: mimeType || blob.type
            }
        );
    },

    async getObjectUrl(zip, assetPath) {

        const blob = await this.getBlob(
            zip,
            assetPath
        );

        return URL.createObjectURL(blob);
    }
};