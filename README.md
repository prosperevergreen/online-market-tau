# A demo online shop

A Fullstack web app that works as an a sample online shop with vanilla JS, HTML & CSS.

Link to app site below
1. [JWT Web Version](https://jwtwebdev66.herokuapp.com/)
2. [Basic Auth Web Version](https://kp-market.herokuapp.com/)

<img src="https://gitlab.com/prosperevergreen/online-market-jwt/-/raw/jwt/documentation/online-market-screenshot.png" style="float: right;" width="800px" alt="Online Shop Screenshot">


### The project structure

```
.
├── index.js                --> home for the server
├── package.json            --> dependencies, scripts etc. for Node and JS
├── routes.js               --> request handling with api endpoints
├── auth                    --> authentication of the user
│   └──  auth.js            --> there is also the implementation for the JWT-token based authentication
├── controllers             --> controllers for the mongoose models
│   ├──  ...                -->   ...
│   └── users.js            --> controller for the user model
├── models                  --> 
│                               mongoose models
├── public                  --> 
│   ├── img                 --> 
│   ├── js                  --> 
│   └── css                 --> 
├── utils                   --> functions for handling requests, and forming and sending responses
│   ├──                     --> responseUtils are for creating uniform responses
│   └──                     --> requestUtils are for handling requests
└── test                    --> tests
│   ├── auth                --> 
│   ├── controllers         --> tests for the controllers
└── └── own                 --> tests implemented by the students to provide coverage


```

## The architecture 

This system is a web application based on RESTful architechture and there fore is versatile and easy to 
modify. Being built on such constraints gives freedom for the developer to add new but well managed functions to the app,
without having to fundamentally rebuild the system. It is like a tree trunck to grow new branches and leaves on.
Basis is really clear. You have a place where all requests go through. Allowed requests and methods are defined specifically which helps
with error handling and security. Well defined responses make the work flow more fluent and implementations on the front more uniform. 

MVC is a great way of implementing RESTful software. Controllers are easy to build on well defined models and specific constraints in 
the architechture define user friendly basis for views to be offered. In this case Mongoose provided great validation and easy 
datapersistence.

Also while making this project functional programming was endrosed. Functional programming sits with this style of RESTful developing, for
it aims for clear, constrained way of coding that eliminates the issues that rise from mutability. It provides tools to create readable, 
unambiguous code.
