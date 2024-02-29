# DevOps

School DevOps project.

Consists of two servers communicating with eachother through http and RabbitMQ. Monitor service is used for logging. API-gateway is used to control the application.

• Building tools

Docker is used to create a container for each service.
Docker Compose is used to define and run multi-container Docker application and start the app with a
single command.
npm is used to manage project dependencies and scripts.
GitLab CI/CD allows for automated building, testing, and deployment of the application.

• Testing; tools and test cases

The tests use Jest as the testing framework and Supertest for testing HTTP servers and API endpoints.
Test cases:

GET /messages: Expects a 200 status code and a content type of 'text/plain; charset=utf-8'.

PUT /state: Expects a 200 status code, a content type of 'text/plain; charset=utf-8', and a response body
containing 'State changed to PAUSED'.

GET /state: Expects a 200 status code, a content type of 'text/plain; charset=utf-8', and a response body of
'PAUSED'.

GET /run-log: Expects a 200 status code, a content type of 'text/plain; charset=utf-8', and a non-empty
response body.

Monitor service: Expects a 200 status code and a content type of 'text/plain'.

Service1: Expects a 400 status code and a response body of ‘Invalid state’.

• Packing

Each service is containerized using Docker including the tests. Docker-compose.yml file at the root of the
project is used to define and run a multi-container Docker application. It specifies how to build and run each
of the services, and also defines dependencies between the services. Docker images are built with dockercompose build and run with docker-compose up.

• Deployment

The application is deployed automatically to the hosting environment by running “docker-compose up” if
the pipeline passes.

• Operating; monitoring

When the application is running it can be operated with curl commands or with postman by sending
requests to the api-gateway endpoints. The monitoring features are GET/ messages, GET /state and GET
/run-log. These give information about state, state changes or messages registered with the monitor
service.
Operating features are accessed by using the PUT /state endpoint in the api-gateway. Available payloads are
“INIT” (set to initial state and start sending again), 
“PAUSED” (Service 1 does not send messages),
“RUNNING” (Service 2 sends messages).

The system can be tested locally with following steps:

docker-compose build

docker-compose up -d

To execute the tests:

docker-compose run --no-deps tests npm test

To execute ESLint:

docker-compose run --no-deps api-gateway npm run lint

curl or postman can also be used to test the api-gateway methods.
