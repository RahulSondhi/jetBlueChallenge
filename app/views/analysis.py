import requests
import xml.etree.ElementTree
import pathlib

from flask import render_template, request
from app import app

# REST Api Constants
HERE_COM_URL = 'https://places.api.here.com/places/v1/discover/explore';
YELP_URL = 'https://api.yelp.com/v3/businesses/search';
CURRENT_DIRECTORY = pathlib.Path(__file__).absolute().parent;
KEY_FILE_PATH = CURRENT_DIRECTORY.parent.joinpath(pathlib.Path('static/api/api_keys.xml'));

# Constants for Yelp requests
CATEGORIES = ['active','arts','food','tours','localflavor','nightlife','restaurants','shopping']
RADIUS = 40000 # meters, ~25 miles, max radius
SEARCH_LIMIT = 25

# Data from last query
exploreData = None;
exploreCoords = [0,0];
infoData = None;
infoCoords = [0,0];

# Api Keys
hereAppId = None;
hereAppCode = None;
yelpApiKey = None;

# Get api keys and return html for site
@app.route("/")
def startEm():
    # Get Api keys
    root = xml.etree.ElementTree.parse(pathlib.PurePath(KEY_FILE_PATH)).getroot();
    global hereAppId, hereAppCode, yelpApiKey;
    hereAppId = root.find('.//*[@name="here_app_id"]').text;
    hereAppCode = root.find('.//*[@name="here_app_code"]').text;
    yelpApiKey = root.find('.//*[@name="yelp_api_key"]').text;
    return render_template("index.html");

# Find places of interest around the specified location
# Args: x and y coordinates
@app.route("/explore")
def FindPlaces(x, y):
    # Check for repeated coordinates to avoid excessive calls
    if exploreCoords[0] == x and exploreCoords[1] == y:
        return exploreData;
    exploreCoords[0] = x;
    exploreCoords[1] = y;

    categoryString = ',',join(CATEGORIES);
    authHeader = {'Authorization': "Bearer " + yelpApiKey};
    getVars = {
        'latitude': x,
        'longitude': y,
        'radius': RADIUS,
        'categories': categoryString,
        'limit': SEARCH_LIMIT,
        'sort_by': 'rating'
    };
    return requests.get(YELP_URL, headers=authHeader, params=getVars).json();

# HERE.com Api
#@app.route("/explore")
#def FindPlaces(x, y):
#    combinedCoord = "{0},{1}".format(x,y);
#    getVars = {
#       'app_id': hereAppId,
#       'app_code': hereAppCode,
#       'at': combinedCoord,
#       'drilldown': 'true'
#    };
#    return requests.get(HERE_COM_URL, params=getVars).json();

# Get detailed information about a location
# Args: x and y coordinates of the business
@app.route("/info")
def GetPlaceInfo(x, y):
    # Check for repeated coordinates to avoid excessive calls
    if infoCoords[0] == x and infoCoords[1] == y:
        return infoData;
    infoCoords[0] = x;
    infoCoords[1] = y;

    authHeader = {'Authorization': "Bearer " + yelpApiKey};
    getVars = {
        'latitude': x,
        'longitude': y,
        'sort_by': 'distance',
        'limit': 1
    };
    searchInfo = requests.get(YELP_URL, headers=authHeader, params=getVars).json();
    placeId = searchInfo['businesses'][0]['id']
    return requests.get(YELP_URL.replace('search', placeId), headers=authHeader).json();
