# An online shop

A web shop with vanilla JS, HTML & CSS.

[Basic Auth Web Version](https://kp-market.herokuapp.com/)

[JWT Web Version](https://jwtwebdev66.herokuapp.com/)




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

TODO: describe added files here and give them short descriptions

## The architecture 

TODO: describe the system, important buzzwords include MVC and REST.
UML diagrams would be highly appreciated.

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



## Tests and documentation

TODO: Links to at least 10 of your group's GitLab issues, and their associated Mocha tests and test files.


## Security concerns

TODO: list the security threats represented in the course slides.
Document how your application protects against the threats.
You are also free to add more security threats + protection here, if you will.

XSS - Cross site scripting
We protect the app and its users against xss by validating user input and not representing anything 
straight to the browser. In this app user input is mostly collected in clicks, or such text input that
it gets validated and processed before bringing it back to the front end.

Information leakage
Authentication and Authorization
Are implemented in this task by Basic and JWT-based authentication and requiring authorization in most cases.

Session Management:
 Session fixation
 This threat is handled by not saving any session related id's so that the user could make the system 
 believe they have different authority. All such cookies and tokens should be renewed frequently to 
 prevent fraud from happening.
 
 Session sidejacking
 This threat is handled by using https for the whole interaction with the user.
 
 CSRF - Cross site request forgery
 This threat should be handled by restricting allowed methods and by checking origin. CSRF-tokens 
 are a way to check that the action is actually coming from where it is supposed to come from.
 
NoSQL injections
Can be prevented by validating and sanitizing, never performing a query straight with a user given string.

Directory Traversals
Are prevented in this particular app by allowing only very specific paths to be executed.


