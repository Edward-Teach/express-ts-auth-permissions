# express-ts-auth-permissions

This repository contains a Node.js application that can be easily set up and run using Docker and Docker Compose.

Tech stack:
1. express.js
2. Sequelize
3. Typescript
4. passport.js
5. redis
6. mysql

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

### Clone the Repository

First, clone the repository to your local machine:

```sh
git clone git@github.com:Edward-Teach/express-ts-auth-permissions.git
cd your-repo
docker-compose up --build
```


To stop the application, run:
```sh
docker-compose down
```

to rebuild the application
```sh
docker-compose up --build
```

to remove the containers and volumes:
```sh
docker-compose down -v
```