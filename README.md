![Logo de mon projet](./logo.svg)


# TakesTwoToFwango_Backend

<p align="center">

<a href="https://github.com//lachiri-ilias/TakesTwoToFwango_Backend/actions" target="_blank"><img src="https://github.com/lachiri-ilias/TakesTwoToFwango_Backend/workflows/Deploy%20to%20Google%20Cloud%20Run/badge.svg" alt="Deploy to Google Cloud Run Status" /></a>
<a href="https://github.com/lachiri-ilias/TakesTwoToFwango_Backend/actions" target="_blank"><img src="https://github.com/lachiri-ilias/TakesTwoToFwango_Backend/workflows/CI/CD%20Pipeline/badge.svg" alt="GitHub Actions Status" /></a>
</p>

</p>

## Deployment

You can access the deployed backend API using the following link:

https://t22f-hvr74qbrvq-ew.a.run.app/


## API Documentation with Swagger

We have documented and visualized the API endpoints using Swagger for your convenience. Swagger provides a user-friendly interface to explore the API and interact with its various routes.

To access the Swagger documentation and test the API, follow these steps:

    1. Click on the following link to open the Swagger documentation:

    https://t22f-hvr74qbrvq-ew.a.run.app/api-docs#/

    2. You will be presented with a list of available API endpoints, along with detailed descriptions and input parameters.

    3. Some endpoints require authentication to access. To obtain the required token for authentication, you may need to simulate a login action using the appropriate authentication route. Once you have the token, you can use it in the "Authorization" header when testing authenticated endpoints.

    4. To test an authenticated endpoint, click on it to expand the details, and then click the "Try it out" button. Ensure that you include the token in the "Authorization" header as required.

    5. Fill in the required parameters and click the "Execute" button to send a request to the API.

    6. Swagger will display the response from the API, making it easy to understand the data returned by each endpoint.


## Description

`TakesTwoToFwango_Backend` is a backend developed using the NestJS framework. (Add more details about what your backend does or any other relevant information).

## Using the Project

To use the project, you can launch it using npm or Docker. Both methods are detailed below:

**Note**: Please be aware that the methods may not work if you don't have the necessary Firestore and GCP keys.


### Installation

```bash
$ npm install
```

### Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Running with Docker

You can also run the project using Docker. Make sure you have Docker installed on your system before proceeding.

#### Build the Docker Image

To build the Docker image for the project, use the following command:

```bash
$ docker build -t TakesTwoToFwango_Backend .
```

### Run the Docker Container

Once the Docker image is built, you can run the project in a Docker container with the following command:

```bash
$ docker run -d -p 8080:8080 TakesTwoToFwango_Backend
```


### Access the Application

The application will be running inside the Docker container. You can access it by opening a web browser and navigating to:

http://localhost:3000


### Stopping the Docker Container

To stop the Docker container, use the following command:

```bash
$ docker stop <container-id>
```

Replace <container-id> with the actual ID or name of the running container. You can get the container ID by running docker ps.



## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Note
 It's important to note that this project may require Firestore and GCP keys to function properly. Make sure you have these keys configured before attempting to run the application.

Feel free to choose the method that suits your development environment, and enjoy using the project!