# Northcoders News API

This page is best viewed as a preview: Ctrl + Shift + V or Command + Shift + V

# Hosted Version: https://nc-news-application.onrender.com/

# Project Summary:

This project is the result of a solo back-end project week which allowed me to demonstrate the skills I have gained on the Northcoders Software Development Bootcamp. The back-end project required setting up nine RESTful endpoints with Express, the implementation of which was driven by thorough integration testing using SuperTest.

# Cloning:

1. navigate, using the terminal, to the folder you want to clone the repo into
2. enter into terminal: git clone https://github.com/aimeemuter/nc-news-backend-project.git
3. open the repo in your code editor

# Setup:

1. create a .env.development file and a .env.test in the root of the project
2. add your development and test database names in the following format to each of the files respectively: PGDATABASE=database_name_here
3. update the /db/setup.sql file and replace the current database names with your database names if you have chosen different names
4. open a terminal and enter the following commands:
   - `npm i`
   - `npm run setup-dbs`
   - `npm run seed`

# Running Tests:

Type the following command into the terminal: `npm run test`

# Minimum Versions:

Node.js: v20.8.0
Postgres: v8.7.3
