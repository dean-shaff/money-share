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
