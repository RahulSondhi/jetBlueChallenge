from flask import Flask
import mysql.connector

app = Flask(__name__)
app.config.from_object("config")

from app.views import analysis

db = mysql.connector.connect(
  host="104.198.70.198",
  user="root",
  passwd="",
  database="jetBlue"
);

print(1)
mycursor = db.cursor()
print(2)
mycursor.execute("SELECT * FROM Airports")
print(3)
myresult = mycursor.fetchall()
print(4)
for x in myresult:
  print(x)
