import sys
import time
import json
import requests
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

import config


#======================== HOW TO CONSTRUCT 'TERM' ========================#
"""
YEAR + SEMESTER + LOCATION

YEAR = 4 digit year         ie. 2020
SEMESTER = 
    Spring = 1
    Summer = 2
    Fall = 3

Location = 
    College Station = 1
    Galveston = 2
    Qatar = 3
    Half year = 4      (not sure where this is needed yet)


EXAMPLES:
2018 Summer in Galvestor: term = 201822
2016 Spring in Qatar: term = 201613
2020 Fall in College Station: term = 202031
"""

#============================ GLOBAL VARIABLES ============================#

path = os.path.dirname(os.path.realpath(__file__))
CHROME_DRIVER = config.VARIABLES['chrome_driver']
base_url = config.VARIABLES['base_url']
subjects = config.VARIABLES['subjects']




def CompassConstructSearch(dept, course, sessionID, term, pageMaxSize=1000):
    '''Constructs search request url given the inputs.'''
    # Base Compass URL
    base_url = 'compassxe-ssb.tamu.edu'

    # Search URL
    url = 'https://{}/StudentRegistrationSsb/ssb/searchResults/searchResults?txt_subject={}&txt_courseNumber={}&txt_term={}&startDatepicker=&endDatepicker=&uniqueSessionId={}&pageOffset=0&pageMaxSize={}&sortColumn=subjectDescription&sortDirection=asc'.format(base_url, dept, course, term, sessionID, pageMaxSize)
    return url

def start_session():
    '''
    Starts and prepares session for searches.
    This uses selenium to start the session and verify the uniqueSessionID
    that is required for searches. It then switches to a requests session.
    '''
    # Open Headless Selenium
    chrome_options = Options()  
    chrome_options.add_argument("--headless")  
    s = webdriver.Chrome(options=chrome_options)

    # Load page to initialize session
    s.get('https://{}/StudentRegistrationSsb/ssb/term/termSelection?mode=search'.format(base_url))

    # Navigating webpage
    term_area = s.find_element_by_class_name('select2-container')
    term_area.click()

    text_area = s.find_element_by_id('s2id_autogen1_search')
    text_area.send_keys("Fall 2020 - College Station")
    time.sleep(2)
    text_area.send_keys(Keys.ENTER)

    btn = s.find_element_by_xpath('//*[@id="term-go"]')
    btn.click()

    # Use javascript in Chrome console to scrape unique session id from session storage
    javascript = "session_id = window.sessionStorage['xe.unique.session.storage.id']"
    s.execute_script(javascript)

    # Make unique session id into a cookie
    javascript = "document.cookie = 'sid=' + session_id"
    s.execute_script(javascript)

    # Take sessionID cookie and store it in python variable
    sessionID = s.get_cookie('sid')['value']

    # Transfering selenium session to requests session
    headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36"
    }

    session = requests.session()
    session.headers.update(headers)

    for cookie in s.get_cookies():
        c = {cookie['name']: cookie['value']}
        session.cookies.update(c)

    return session, sessionID

def reset_search(session):
    '''Resets search so a new search request can be made'''
    # reset search
    r = session.post('https://{}/StudentRegistrationSsb/ssb/classSearch/resetDataForm'.format(base_url))
    # print("Search reset.")
    # print()
    return r.status_code

def search(session, sessionID, dept, course, term):
    '''Sends search request to and returns the data'''
    resp = session.get(CompassConstructSearch(dept, course, sessionID, term))
    data = resp.json()['data']
    return data

def make_course_json(course_data):
    '''Takes course data and returns object that can be written to a json file'''
    x = {
        "courseTitle": str(course_data['courseTitle']),
        "subject": str(course_data['subject']),
        "courseNumber": str(course_data['courseNumber']),
        "sequenceNumber": str(course_data['sequenceNumber']),
        "professor": "",
        "professorEmail": "",
        "id": str(course_data['id']),
        "term": str(course_data['term']),
        "campusDescription": str(course_data['campusDescription']),
        "maximumEnrollment": str(course_data['maximumEnrollment']),
        "enrollment": str(course_data['enrollment']),
        "seatsAvailable": str(course_data['seatsAvailable']),
    }

    if (course_data['faculty']): # since faculty is not always completed, this is checked for separately
        x['professor'] = course_data['faculty'][0]['displayName']
        x['professorEmail'] = course_data['faculty'][0]['emailAddress']

    return x

    
def get_course_and_section(session, sessionID, department, course, section, term):
    reset_search(session)

    # Make requests for department data
    # print()
    # print("Getting Data for " + department + course + section)
    data = search(session, sessionID, department, course, '202031')
    # print()

    # binary search for class
    # print(data)
    low = 0
    high = len(data) - 1
    while low <= high:
        mid = (low + high) // 2
        current_section = data[mid]['sequenceNumber']
        if current_section == section:
            seats_available = data[mid]['maximumEnrollment'] - data[mid]['enrollment']
            print(seats_available) # sending this back to NodeJS
            sys.stdout.flush()
            break
        elif current_section < section:
            low = mid + 1
        else:
            high = mid - 1


# Start session
session, sessionID = start_session()

# Setup term
term = '202031' # 2020 3 1 where 2020 is year, 3 is fall, 1 is location

# get_course_and_section(session, sessionID, 'CSCE', '221', '504', term)
# print(str(sys.argv))
get_course_and_section(session, sessionID, sys.argv[1], sys.argv[2], sys.argv[3], term)
# print(sys.argv[1], sys.argv[2], sys.argv[3])
# sys.stdout.flush()
