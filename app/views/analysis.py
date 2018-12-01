from flask import render_template, request

from app import app

@app.route("/")
def startEm():
    return render_template("index.html");
