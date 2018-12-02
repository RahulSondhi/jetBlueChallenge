from flask import Flask
import mysql.connector

app = Flask(__name__)
app.config.from_object("config")

from app.views import analysis
