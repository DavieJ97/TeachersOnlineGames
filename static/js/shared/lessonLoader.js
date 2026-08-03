window.LessonLoader = {

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