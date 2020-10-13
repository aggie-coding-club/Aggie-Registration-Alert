# Scraper

The scraper.py script scrapes data from Banner.

## Usage

Configure settings in config.py if any of your settings are different from the default. Please check the config.py before implementing.

Directories should be made automatically. If you run the program in it's default state, it will create all directories will be made automatically. Each department folder will be filled with the appropriate json files containing course data.

The term variable can be constructed using the information given in scraper.py.

There are three main functions in scraper.py:

get_all_courses retrieves all data for every course at the university.
get_department retrieves data for all courses within the given department. 
get_course retrieves data for all sections of a course given.


Look at the function declarations in scraper.py if more information is needed.

## Output

Currently, all data will be written to the corresponding department directory within the courses directory. 

This needs to be adjusted to write directly to the database.
