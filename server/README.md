# Table of Contents

- [Title and Description](#title-and-description)
- [Technologies](#technologies-used)
- [Environment](#environment)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Demo User](#demo-user)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)

## Title and Description:

Title: “PensaClub Backend API”  
Description: A versatile and scalable back-end server designed to support the PensaClub front-end application. It offers a robust set of APIs for user management, authentication, and data retrieval, and is built to be easily adaptable for various front-end services.

## Technologies used

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com)
[![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![dotenv](https://img.shields.io/badge/dotenv-6cc24a?style=flat&logo=npm)](https://www.npmjs.com/package/dotenv)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=flat&logo=sequelize&logoColor=white)](https://sequelize.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![bcrypt](https://img.shields.io/badge/bcrypt-563d7c?style=flat&logo=npm)](https://www.npmjs.com/package/bcrypt)
[![TomTom](https://img.shields.io/badge/TomTom-ff6c00?style=flat)](https://developer.tomtom.com)
[![Zoho](https://img.shields.io/badge/Zoho-CC2927?style=flat&logo=zoho&logoColor=white)](https://www.zoho.com)

## Environment

For development the file must be .env.development and for production .env.production

```plaintext
PORT - The port on which the server runs (default: 8080)
SECRET - A secret key used for JWT token generation
FRONTEND_SERVER - The URL of the front-end server
DB_URL - The connection string for the PostgreSQL database
DB_NAME - The name of the database
DB_USER - The username for database access
DB_PASSWORD - The password for database access

TOMTOM_API_KEY - The API key for TomTom services

ZOHO_ACCOUNT_ID - The unique identifier for your Zoho account
ZOHO_CLIENT_ID - The client ID obtained from Zoho API Console for OAuth authentication
ZOHO_CLIENT_SECRET - The client secret paired with the client ID for secure API access
ZOHO_REFRESH_TOKEN - The token used to refresh the access token without user intervention
ZOHO_ACCESS_TOKEN - The token that grants temporary access to the user's Zoho account
```

## Installation

**Use the terminal to navigate to the project directory.**

1. Navigate to server:

```bash
cd server
```

2. Install all the necessary dependencies by running the following command in your terminal:

```bash
npm install
```

3. Ensure the .env.development file is correctly set up.

4. Run the server:

**Development**

```bash
npm run start:dev
```

or

**Production**

```bash
npm run start
```

## Database Setup

The database is pre-configured to connect using the environment variables provided. No additional setup is required for connecting to the database. However, here’s an overview of the migrations that have been applied to define the database schema:

1. Initial User Account Migration: Sets up the user_account table with fields for user authentication and account status.

2. User Details Migration: Establishes the user_details table with comprehensive user information, including contact details and personal attributes.

## Demo User

When the server starts for the first time in a development environment, a demo user account is automatically created if it does not already exist. This allows developers to immediately start testing and interacting with the application without needing to manually set up a test account.

**Credentials for the Demo User:**

- **Email:** test@test.com
- **Password:** Test1234

## Project Structure

- **_/server/src_**: Contains the application built with Express.

  - **/config**: Configuration files for the server.

  - **/controllers**: Controllers handling the business logic.

  - **/middlewares**: Guards for authentication, authorization, error handling, and others.

  - **/sequelize**: Sequelize ORM configuration and models for the database.

    - **/config**: Sequelize configuration files that utilize environment variables for different environments (development, production).

    - **/migrations**: Migration files that define the changes to the database schema over time.

    - **/models**: Model files that represent the tables in the database, defining the schema and relationships.

    - **/test-connections**: Scripts to test database connectivity and ensure that the configuration is correct.

  - **/utils**: Utility functions and helper modules.

  - **/router**: Express routes for handling API requests.

## Api Endpoints

- **_userController_** :

  - **/auth/register** : Responsible for registering a new user. It requires user details like email, password and rePassword.
  - **/auth/login** : Responsible for registering a new user. It requires user details like email, and password.
  - **/auth/logout** : Responsible for logging out the user from the system.
  - **/auth/request-reset-password** : Used to request a password reset. It expects an email address and sends a password reset link to that email.
  - **/auth/reset-password** : Used to reset the password. It requires the new password, a repeated new password for confirmation, and the reset token received by email.

- **_userDetailsController_** :

  - **/user/details** : Used to create a user's details post-registration. It allows adding additional information such as place of residence, city, profession and others.
  - **/user/all-users** : This endpoint fetches a list of all registered users in the system.
  - **/user/update-details** : This endpoint updates an existing user's profile. It requires the specific field to be updated, for example, `"workOptions": ["Doctor", "Lawyer"]` to update the work options of the user.
  - **/user/single-user** : This endpoint fetches a single registered user in the system.

## Testing

Testing is planned and will be documented in the future.
