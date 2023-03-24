### SETTING UP THE PROJECT

- If you have docker installed, make sure you are in the same directory as the ```docker-compose.yml``` file and run ```docker-compose up --build```.

- if you do not have docker installed but want to run the project using docker, follow [https://docs.docker.com/engine/install/] to install it.

- If you do not want to user docker, follow the following steps:
    * Create a .env with variable names such as the ones in .env.api file
    * Make sure your postgres is running if you are using the local one
    * Run ```npm install``` to install dependencies
    * Run ```npx prisma migrate dev``` to apply migrations and create tables
    * Run ```npm run dev``` to get your application started
    * You can open another terminal and make sure you are in the spark folder, then run ```npx prisma studio``` to get a graphical view of your database.

# THINGS TO KNOW
1. The root folder contains a ```rest.http``` file that has all the available endpoints in the application.
2. Endpoints that are labelled with ```must be authenticated```, you have to be logged in to access them. With that, you need to use postman or other interfaces.
3. Endpoints that are labelled with ```must be authenticated and autorized```, you have to be logged in and be an admin to access them. With that, you need to use postman or other interfaces.
4. In order for the email feature to work:
    * Update the ```EMAIL_USER, EMAIL_PASS, EMAIL_SERVICE``` with the approraite details
    * Comment out line ```103 to 111```  and lines ```168 to 174``` in auth.route.js file in the routes folder

### ADDITIONAL TIME
- If I had additional time, I would have written some test cases for some features.