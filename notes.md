### 15/09/2020

- Don't ever send password back in response!!!!
- I need to make (most) API routes authenticated routes only... this will happen later 


### 14/09/2020

Back at it. I'm going to be working on the stuff I was doing on Friday of last week.
I'm going to start by spending some time setting up Jest and Puppeteer test suite.

I got `jest-puppeteer` tests up and running.

I also made it such that if the user tries to create an account with an existing username/email it will return 400 status code error. I also added corresponding tests.

I'm going to add some error reporting to the Login/Register page so users know if they've entered an existing username/email or if the password is incorrect. This is implemented!

`Boom.badRequest` is a little annoying, but its all good...

Finally onto Rotation Model.


### 11/09/2020

I somehow managed to get the user authentication stuff (mostly) figured out.

Today I want to:
- figure out how to do automated testing with Jest and Puppeteer.
- Setup Rotation model.
  - rotation name
  - rotation manager
  - I need to be able to list users
    - Users can either be fellow members of the site, or just people with names and emails.
    - Each user needs a history -- have they paid this cycle, and what is their payment history.
  - need a flag to indicate whether the rotation is started
  - Rotation start date
  - Cycle $ amount
  - Cycle period
  - Number of people getting paid out each month
    - Right now the total number of people has to be an integer multiple of the number of people getting paid out each month.
  - Number of cycles at the bottom who don't pay.
  - User order
- Add a rotation test.
- Add a rotation to `populate_dev_db.js`
- Start setting up Dashboard UI


How do I handle the following potential conflict:
- As a rotation manager, I might add some folks by name + email or by name + phone number. What if the person associated with that email goes to create an account?
  - I guess what would happen is that on the backend, we would see that the person already exists, and we would simply update their database entry with a username and password!



Longer Term:
- I need to figure out password recovery.
- I need to figure out username/name conflicts.
- Automated emails, generally.
- I want import from .txt/.csv file in the Rotation Configuration page.


### 10/09/2020

I was surprisingly successful yesterday. I built initial implementations of the Landing, Login, and Registration pages. I even got the SVG icons plugged in.

Here's what I want to do today:

- Build a small test dataset, similar to what I did with the Cacophony app.
  - For today I think I just want this to include users.
- Figure out how to do authentication
  - Figure out how to do user sessions, ie redirect a user who has already signed in to the dashboard.
  - What does my database entry need to look like?
  - I'm going to try to follow the [tutorial](https://hapi.dev/tutorials/auth/?lang=en_US)
- Stretch Objective: Build Dashboard page.

Ugh. This user authentication shit is super confusing.

Gonna go slam some muni and then come back. I want to look through [this](https://auth0.com/blog/hapijs-authentication-secure-your-api-with-json-web-tokens/) tutorial on using JWT with hapijs.

I think I finally understand what the fuck is going on here. I'm going to stick with this JWT thing.

Now I understand how to create a token and send it back to the client.

Because I'm using React router, I think I want to be doing the verification in the client?

I need to create a test suite for the UI:

- If we try to create a user with duplicate username, then we return an error.
- If we try to create a user with duplicate email, then return an error.
- If we enter wrong password, indicate as such.

Testing:
- It looks like I may be able to get away with using Jest + JSDOM.
- Now that I'm thinking about this, I need to be able to start up my server, serve up my HTML and js, and test the whole stack. Maybe I should just use pupeteer?
- [this](https://spin.atomicobject.com/2020/04/22/jest-test-express-react/)
- [jest-puppeteer](https://github.com/smooth-code/jest-puppeteer)

### 09/09/2020

The staging site is due September 22.

Here's what I want to accomplish today:

- Do full walk-through of site. What will the workflow look like for Brandi, or the people involved in the Susu?
- Setup Hapi server.
  - This includes planning all routes.
- Setup main elements of database:
  - User
  - Rotation
- Build Landing page.
- Build Register page
- Build login page
- Figure out user authentication.
- Stretch Objective: Build Dashboard page.

Questions to resolve:
- I'm building a multipage app. How can I use React to accomplish this?
  - There appears to be something called `react-router` and `reach-router`. I'm going to use the latter. I'm going ahead with reach-router. Then I can use React for the whole front end.
- Can I have optional fields in Hapi database entries?
- How do I do user authentication?
- How do I do cookies so a user can stay logged in?
- Change password?
- Reset password?

App Walkthrough:

I go to app webpage. I'm greeted with a landing page. Here I find the app logo in the upper left hand side, and two buttons, Register and Login, in the upper right hand side. In the main area there is a little blurb that briefly states what the app does. Here we can find another button prompting me to sign up.

I haven't yet registered, so I click either "Register" or "Sign Up". This takes me to a new page where I can enter my details; name, email address, and password. Alternatively, I can sign up with my Google account.

If I have registered, I click login. This takes me to a new page where I can use to enter in my details. Alternatively I can continue with my social media account.

Once logged in, I'm greeted with a Dashboard. As I have yet to create any rotations, my Dashboard tells me that I can configure a new rotation. I click "Create New Rotation", which takes me to the Rotation Configuration page. Here I can give my rotation a name, and specify its parameters -- how many people are involved, what is the cycle length, and how much is everyone paying. I can also add new people. If I don't have everyone's information, I can save a partially completed rotation. Returning to the Dashboard, I see my partially completed rotation. I can click on it to add more members. Once I've got everything set up, I can click "Start Rotation" to start the money share. I cannot freely add or remove members, or change the rotation parameters once it has started.


Routes:

- /
  Landing page. If already logged in this redirects to /dashboard
- /register
  Page with a form allowing users to register
- /login
  Page with a form asking users to login
- /dashboard
  This is the main dashboard, where I can see the status of all the money shares I'm managing.
- /rotation/configure  
  This is the rotation configuration page. Before a rotation has started, I can freely set the cycle length, the $ amount and the members.

REST endpoints:

- GET /rotation
  Get a particular rotation
- POST /rotation
  Create a new rotation
- PUT /rotation
  Update an existing rotation
- DELETE /rotation
  Delete an existing rotation

- GET /user
  Get information about a particular user
- POST /user
  Create a new user
- PUT /user
  Update user's information
- DELETE /user
  Delete user from the database


### 08/09/2020

I'm thinking about how to structure this site. I'm going to have a few different pages:

- Landing page
- Login/Registration page (optional)
- Dashboard page with ability to configure and monitor a given money share
- Money share configuration wizard page (optional)
- User page
