import json
import requests
import xml.etree.ElementTree
import pathlib

from flask import render_template, request
from app import app
import mysql.connector

# REST Api Constants
HERE_COM_URL = 'https://places.api.here.com/places/v1/discover/explore';
YELP_URL = 'https://api.yelp.com/v3/businesses';
CURRENT_DIRECTORY = pathlib.Path(__file__).absolute().parent;
KEY_FILE_PATH = CURRENT_DIRECTORY.parent.joinpath(pathlib.Path('static/api/api_keys.xml'));

# Constants for Yelp requests
CATEGORIES = ['active','arts','food','tours','localflavor','nightlife','restaurants','shopping'];
RADIUS = 40000; # meters, ~25 miles, max radius
SEARCH_LIMIT = 25;

# Data from last query
exploreData = None;
exploreCoords = [0,0];
infoData = None;
infoCoords = [0,0];
reviewData = None;
reviewCoords = [0,0];

# Api Keys
hereAppId = None;
hereAppCode = None;
yelpApiKey = None;
yelpAuthHeader = None;

# Get api keys and return html for site
@app.route("/")
def startEm():
    # Get Api keys
    root = xml.etree.ElementTree.parse(KEY_FILE_PATH).getroot();
    global hereAppId, hereAppCode, yelpApiKey, yelpAuthHeader;
    hereAppId = root.find('.//*[@name="here_app_id"]').text;
    hereAppCode = root.find('.//*[@name="here_app_code"]').text;
    yelpApiKey = root.find('.//*[@name="yelp_api_key"]').text;
    yelpAuthHeader = {'Authorization': "Bearer " + yelpApiKey};
    return render_template("index.html");

# Find places of interest around the specified location
# Args: x and y coordinates, isAccessible is a bool for wheelchair accessibility
@app.route("/explore")
def FindPlaces():
    # Get Args
    x = request.args.get('lat');
    y = request.args.get('lon');
    isAccessible = request.args.get('isAccessible');

    # Check for repeated coordinates to avoid excessive calls
    global exploreCoords, exploreData;
    if exploreCoords[0] == x and exploreCoords[1] == y:
        return json.dumps(exploreData);

    exploreCoords[0] = x;
    exploreCoords[1] = y;
    categoryString = ','.join(CATEGORIES);
    getVars = {
        'latitude': x,
        'longitude': y,
        'radius': RADIUS,
        'categories': categoryString,
        'limit': SEARCH_LIMIT,
        'sort_by': 'rating'
    };
    if isAccessible:
        getVars['attributes'] = 'wheelchair_accessible';

    exploreData = requests.get(
        YELP_URL + '/search',
        headers=yelpAuthHeader,
        params=getVars
    ).json();
    return json.dumps(exploreData);

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
def GetPlaceInfo():
    # Get Args
    x = request.args.get('lat');
    y = request.args.get('lon');

    # Check for repeated coordinates to avoid excessive calls
    global infoCoords, infoData;
    if infoCoords[0] == x and infoCoords[1] == y:
        return json.dumps(infoData);

    infoCoords[0] = x;
    infoCoords[1] = y;

    getVars = {
        'latitude': x,
        'longitude': y,
        'sort_by': 'distance',
        'limit': 1
    };
    searchInfo = requests.get(
        YELP_URL + '/search',
        headers=yelpAuthHeader,
        params=getVars
    ).json();

    placeId = searchInfo['businesses'][0]['id'];
    infoData = requests.get(
        YELP_URL + '/' + placeId,
        headers=yelpAuthHeader
    ).json();
    return json.dumps(infoData);

# Get reviews for a location
# Args: x and y coordinates
@app.route("/reviews")
def GetPlaceReviews():
    # Get Args
    x = request.args.get('lat');
    y = request.args.get('lon');

    # Check for repeated coordinates to avoid excessive calls
    global reviewCoords, reviewData;
    if reviewCoords[0] == x and reviewCoords[1] == y:
        return json.dumps(reviewData);
    elif not (infoCoords[0] == x and infoCoords[1] == y):
        # need to get place info
        GetPlaceInfo(x,y);

    # Get review data
    reviewCoords[0] = x;
    reviewCoords[1] = y;
    url = '{0}/{1}/reviews'.format(YELP_URL, infoData['id']);
    reviewData = requests.get(url, headers=yelpAuthHeader).json();
    if 'error' in reviewData:
        url = '{0}/{1}/reviews'.format(YELP_URL, reviewData['error']['new_business_id']);
        reviewData = requests.get(url, headers=yelpAuthHeader).json();
    return json.dumps(reviewData);

@app.route("/startPage")
def startEm2():
    return render_template("startPage.html");

@app.route("/start")
def startEm3():
    return render_template("start.html");

@app.route("/airport-description")
def GetAirportDescription():
    code = request.args.get('code')
    db = mysql.connector.connect(
      host="104.198.70.198",
      user="root",
      passwd="",
      database="jetBlue"
    )
    cursor = db.cursor();
    cursor.execute("SELECT * FROM Airports WHERE code='{0}'".format(code))
    myresult = cursor.fetchall()
    serializedData = {}
    serializedData['Code'] = myresult[0][0]
    serializedData['City'] = myresult[0][1]
    serializedData['Name'] = myresult[0][2]
    serializedData['StateCode'] = myresult[0][3]
    serializedData['CountryCode'] = myresult[0][4]
    serializedData['CountryName'] = myresult[0][5]
    serializedData['IsBlueCity'] = myresult[0][6]
    serializedData['IsPreClearedStation'] = myresult[0][7]
    return json.dumps(serializedData)
