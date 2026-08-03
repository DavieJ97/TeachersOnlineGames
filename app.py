from flask import (
    Flask,
    render_template,
    request,
    send_file,
    jsonify
)
import os
from datetime import datetime
import zipfile
from docx import Document
from io import BytesIO
from docx.shared import Pt
from deep_translator import GoogleTranslator
from generators.unscramble import UnscrambleSection
from generators.fill_blank import FillBlankSection
from generators.translate import TranslationSection
from generators.word_search import WordSearchSection

app = Flask(__name__)

app.secret_key = os.environ.get("FLASK_SECRET_KEY", "development-secret-key")

@app.context_processor
def inject_current_year():
    return {
        "current_year": datetime.now().year
    }

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/games")
def games():
    return render_template("games.html")


@app.route("/games/exploding-kittens")
def exploding_kittens():
    return render_template("exploding_kittens.html")

@app.route("/games/review_questions/<game_name>")
def review_questions(game_name):

    return render_template(
        "review_questions.html",
        game_name=game_name
    )

@app.route("/worksheets")
def worksheet_generator():
    return render_template("worksheet.html")

@app.route("/api/translate", methods=["POST"])
def api_translate():
    payload = request.get_json(silent=True) or {}

    text = (payload.get("text") or "").strip()
    source = payload.get("source", "en")
    target = payload.get("target", "ko")

    if not text:
        return jsonify({"translation": ""})

    try:
        translated = GoogleTranslator(
            source=source,
            target=target
        ).translate(text)

        return jsonify({
            "translation": translated or ""
        })
    except Exception:
        return jsonify({
            "translation": ""
        })


@app.route("/export", methods=["POST"])
def export():

    data = request.get_json()

    title = data["title"]
    headers = data["headers"]
    sections_data = data["sections"]

    sections = []

    # ====================================
    # Create section objects
    # ====================================

    for section in sections_data:

        if section["type"] == "unscramble":

            new_section = UnscrambleSection(
                title=section["title"],
                words=section["words"],
                show_word_bank=section["show_word_bank"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

        elif section["type"] == "fill_blank":

            new_section = FillBlankSection(
                title=section["title"],
                questions=section["questions"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

        elif section["type"] == "translation":

            new_section = TranslationSection(
                title=section.get("title", "Translate"),
                pairs=section.get("pairs", []),
                direction=section.get("direction", "English → Korean"),
                formatting=section.get("formatting", {})
            )

            sections.append(new_section)

        elif section["type"] == "word_search":

            new_section = WordSearchSection(
                title=section["title"],
                difficulty=section["difficulty"],
                grid_size=section["grid_size"],
                instructions=section["instructions"],
                words=section["words"],
                formatting=section["formatting"]
            )

            sections.append(new_section)

    # ====================================
    # CREATE WORKSHEET DOCUMENT
    # ====================================

    doc = Document()

    doc.add_heading(title, level=0)

    if headers:

        header_table = doc.add_table(
            rows=1,
            cols=len(headers) * 2
        )

        col = 0

        for header in headers:

            header_table.rows[0].cells[col].text = (
                f"{header}:"
            )

            header_table.rows[0].cells[col + 1].text = (
                "______________"
            )

            col += 2

    # ====================================
    # CREATE ANSWER DOCUMENT
    # ====================================

    answer_doc = Document()

    answer_doc.add_heading(
        f"{title} - Answer Key",
        level=0
    )

    # ====================================
    # EXPORT SECTIONS
    # ====================================

    for section in sections:

        # Worksheet

        add_formatted_title(
            doc,
            section.get_title(),
            section.formatting
        )

        section.export(doc)

        doc.add_paragraph()

        # Answer Key

        add_formatted_title(
            answer_doc,
            section.get_title(),
            section.formatting
        )

        section.export_answers(answer_doc)

        answer_doc.add_paragraph()

    # ====================================
    # SAVE DOCX FILES TO MEMORY
    # ====================================

    worksheet_stream = BytesIO()
    answer_stream = BytesIO()

    doc.save(worksheet_stream)
    answer_doc.save(answer_stream)

    worksheet_stream.seek(0)
    answer_stream.seek(0)

    # ====================================
    # CREATE ZIP FILE
    # ====================================

    zip_stream = BytesIO()

    with zipfile.ZipFile(
        zip_stream,
        "w",
        zipfile.ZIP_DEFLATED
    ) as zip_file:

        zip_file.writestr(
            f"{title}.docx",
            worksheet_stream.getvalue()
        )

        zip_file.writestr(
            f"{title} Answer Key.docx",
            answer_stream.getvalue()
        )

    zip_stream.seek(0)

    # ====================================
    # SEND ZIP TO USER
    # ====================================

    return send_file(
        zip_stream,
        as_attachment=True,
        download_name=f"{title}.zip",
        mimetype="application/zip"
    )

def add_formatted_title(
        doc,
        text,
        formatting):

    p = doc.add_paragraph()

    run = p.add_run(text)

    run.bold = formatting.get(
        "bold",
        False
    )

    run.italic = formatting.get(
        "italic",
        False
    )

    run.underline = formatting.get(
        "underline",
        False
    )

    run.font.size = Pt(
        formatting.get(
            "font_size",
            16
        )
    )

if __name__ == "__main__":
    app.run(debug=True)