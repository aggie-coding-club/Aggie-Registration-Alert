import os
import config

def initFolders():
    subjects = config.VARIABLES['subjects']
    path = os.path.dirname(os.path.realpath(__file__))
    os.mkdir(path + '/courses')

    for dept in subjects:
        os.mkdir(path + '/courses' + '/' + dept)

