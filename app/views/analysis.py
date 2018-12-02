import requests
import xml.etree.ElementTree
import pathlib

from flask import render_template, request

from app import app

# REST Api URL's
HERE_COM_URL = 'https://places.api.here.com/places/v1/discover/explore';
YELP_URL = 'https://api.yelp.com/v3/businesses/search';
CURRENT_DIRECTORY = pathlib.Path(__file__).absolute().parent;
KEY_FILE_PATH = CURRENT_DIRECTORY.parent.joinpath(pathlib.Path('static/api/api_keys.xml'));

RADIUS = 1000

# Api Keys
hereAppId = None;
hereAppCode = None;
yelpApiKey = None;

@app.route("/")
def startEm():
    # Get Api keys
    root = xml.etree.ElementTree.parse(pathlib.PurePath(KEY_FILE_PATH)).getroot();
    global hereAppId, hereAppCode, yelpApiKey;
    hereAppId = root.find('.//*[@name="here_app_id"]').text;
    hereAppCode = root.find('.//*[@name="here_app_code"]').text;
    yelpApiKey = root.find('.//*[@name="yelp_api_key"]').text;
    return render_template("index.html");

@app.route("/explore")
def FindPlaces(x, y):
    authHeader = {'Authorization': "Bearer " + yelpApiKey};
    getVars = {'latitude': x, 'longitude': y, 'radius': RADIUS};
    return requests.get(YELP_URL, headers=authHeader, params=getVars).json();

# HERE.com Api
#@app.route("/explore")
#def FindPlaces(x, y):
#    combinedCoord = "{0},{1}".format(x,y);
#    getVars = {'app_id': hereAppId, 'app_code': hereAppCode, 'at': combinedCoord, 'drilldown': 'true'};
#    return requests.get(HERE_COM_URL, params=getVars).json();

@app.route("/info")
def GetPlaceInfo(x, y):
    authHeader = {'Authorization': "Bearer " + yelpApiKey};
    getVars = {'latitude': x, 'longitude': y, 'sort_by': 'distance'};
    return requests.get(YELP_URL, headers=authHeader, params=getVars).json();
