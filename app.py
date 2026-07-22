from flask import Flask, render_template

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/exploding-kittens")
def exploding_kittens():
    return render_template("exploding_kittens.html")

@app.route("/review_questions/<game_name>")
def review_questions(game_name):

    return render_template(
        "review_questions.html",
        game_name=game_name
    )


if __name__ == "__main__":
    app.run(debug=True)