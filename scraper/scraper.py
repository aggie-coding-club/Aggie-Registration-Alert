import time
import json
import requests
import os
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

import config
import makedirectories


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
    s = webdriver.Chrome(CHROME_DRIVER, options=chrome_options)

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
    print("Search reset.")
    print()
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

def write_json(department, data):
    json_data = {}
    json_data['course'] = []
    prev = str(data[0]['courseNumber'])
    for x in data:
        
        current = str(x['courseNumber'])
        if prev != current:
            with open('courses/' + department + "/" + prev + ".json", 'w+') as outfile:
                json.dump(json_data['course'], outfile)

            prev = current
            json_data['course'] = []
            
        json_data['course'].append(make_course_json(x))
    
    if (data):
        return True
    else:
        return False
    

def get_all_courses(session, sessionID, term):
    '''
    This function will scrape all course data for all departments/subjects. 
    This will take longer to execute and should not be ran very often.
    '''
    
    for department in subjects:
        
        reset_search(session)

        # Make requests for department data
        print()
        print("Getting Data for " + department)
        data = search(session, sessionID, department, '', '202031')
        
        if (write_json(department, data)):
            print("Data Retrieved for " + department)
        else:
            print("No data for " + department)
    
    print("All data retrieved.")

def get_department(session, sessionID, department, term):
    '''
    This function scrapes the data for one department. This will
    update all course data for the department entered.
    '''
    
    reset_search(session)

    # Make requests for department data
    print("Getting Data for " + department)
    data = search(session, sessionID, department, '', '202031')
    
    if (write_json(department, data)):
        print("Data Retrieved for " + department)
    else:
        print("No data for " + department)

def get_course(session, sessionID, department, course, term):
    '''
    This function scrapes the data for one course. 
    This will update data for all sections of one course
    '''
    
    reset_search(session)

    # Make requests for department data
    print()
    print("Getting Data for " + department + course)
    data = search(session, sessionID, department, course, '202031')
    print()
    
    if (write_json(department, data)):
        print("Data Retrieved for " + department)
    else:
        print("No data for " + department)

def makeFolders():
    if (not os.path.isdir(path + "/courses/ACCT")): # checks to see if the directories are already made
        makedirectories.initFolders() # if directories do not exist, create them



# The following is an example of how the program could be ran
# Uncomment the code if you want to test.

"""
# Start session
session, sessionID = start_session()

# Setup term
term = '202031' # 2020 3 1 where 2020 is year, 3 is fall, 1 is location

# Check for folder, make if needed
makeFolders()

# THESE ARE 3 FUNCTIONS THAT GET DATA:
# get_all_courses(session, sessionID, term)               # Example of getting ALL data, this will take about 90 seconds.
# get_department(session, sessionID, 'ACCT', term)        # Example of getting one department's data, this will be quick.
# get_course(session, sessionID, 'CSCE', '221', term)     # Example of getting one course's data, this is the fastest

"""
