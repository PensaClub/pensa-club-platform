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

    Permissions:
      `create_record`: Can create new records.
      `read_record`: Can read/view records.
      `update_record`: Can update existing records.
      `delete_record`: Can delete records.
      `approve_record`: Can approve records.

    Admin : Create, Read, Delete, Approve;
    User: Create, Read, Delete, Update;
    Guest: Read;

- **_userController_** :

  - **/auth/register** : Responsible for registering a new user. It requires user details like email, password and rePassword.
  - **/auth/login** : Responsible for registering a new user. It requires user details like email, and password.
  - **/auth/logout** : Responsible for logging out the user from the system.
  - **/auth/request-reset-password** : Used to request a password reset. It expects an email address and sends a password reset link to that email.
  - **/auth/reset-password**: Used to reset user's password and supports two types of tokens: a reset token obtained via email and a JSON Web Token (JWT). It requires old password (mandatory only for JWT), new password, confirmation of new password, token type ('reset' or 'jwt'), and the token.

- **_userDetailsController_** :

  - **/user/details** : Used to create a user's details post-registration. It allows adding additional information such as place of residence, city, profession and others.
  - **/user/all-users** : This endpoint fetches a list of all registered users in the system.
  - **/user/update-details** : This endpoint updates an existing user's profile. It requires the specific field to be updated, for example, `"workOptions": ["Doctor", "Lawyer"]` to update the work options of the user.
  - **/user/single-user** : This endpoint fetches a single registered user in the system.

- **_adsController_** :

  - **/ads/ad-create** : Used to create an advertisement with all the necessary details. It allows users to input comprehensive information about the ad, such as the title, description, category, region, subregion, town, and images.

    Example of successful ad creation via postman:

    ```json
    {
      "adId": "random uuid number",
      "summary": "Sofa",
      "category": "sell",
      "description": "Very nice and comfy",
      "adTown": "Varna",
      "adAddress": "Botev 49",
      "images": [
        {
          "imageURL": "http://example.com/path/to/image.jpg",
          "firebaseImagePath": "path/in/firebase/storage"
        },
        {
          "imageURL": "http://example.com/path/to/image2.jpg",
          "firebaseImagePath": "path/in/firebase/storage"
        }
      ],
      "extraFields": {
          "price": number,
          "eventStartDate": "YYYY-MM-DD",
          "eventEndDate": "YYYY-MM-DD"
        }
    }
    ```

  - **/ads/:adStatus-ads/:adId?** : Used to retrieve ads based on their status ('approved', 'pending', 'denied'). If adId is provided, it fetches the specific ad. Requires user to be authenticated and to have Admin permissions.
  - **/ads/adById/:adId** : Used to retrieve a single ad by its ID.
  - **/ads/ads-user** : Retrieves all ads created by the authenticated user.
  - **/ads/ad-update-status :** : Used to update the status of ad by providing its id in the request body and the new status as 'newStatus'. Requires admin permissions.
  - **/ads/ad-delete** : Used to delete an ad by providing its id in the request body. This endpoint can be accessed by admins and the ad's creator only.
  - **/ads/ad-edit** : Used to edit an ad by providing its id and the fields to be edited with their new values in the request body. Status cannot be changed through this endpoint and after every successful edit the ad status is updated to pending (for review). This endpoint can be accessed by any authenticated users. If the new status is denied, it also requires an admin comment as 'adminComment' (text explanation why the ad is denied). This endpoint can be accessed by admins only.
  - **/ads/ads-search**: This endpoint provides search functionality.

    Date must be in YYYY-MM-DD format, category must be one of the following - `'recommend', 'donate', 'sell', 'work', 'courses', 'health', 'initiatives_projects', 'tours', 'games', 'arbitration'`.
    How does tags work ? It looks for any record that contains the tag word. For example if the tags are furniture and sofa it will look for every record that contains either of those.
    Errors returns a message which filter didn`t work and why.

    You can perform searches using the following criteria: Creation Date, Expiration Date, Tags, Category, Summary, Region: adRegion, adSubregion (Note: adSubregion can only be searched if adRegion is specified), adTown (Note: adTown can only be searched if both adRegion and adSubregion are specified), startDate/endDate for all ads, eventStartDate/eventEndDate for specific events with custom dates, limit (limit of records, default 10), page(pulls specific range of records based on provided limit - default is 10), order (ASC or DESC - ordered by updatedAt)

    <p style="color:red;"><strong>Important:</strong></p> 
    To test the function with unapproved ads, set the following in the adsController/ads-search to <strong>pending</strong>:

    ```json
    whereCondition.status = approved;
    ```

    Example of successful query via postman - http://localhost:8080/ads/ads-search?category=work&adRegion=3&adTown=10&adSubregion=5 and the return data:

    ```json
    "result": [
        {
            "summary": "Divan4",
            "category": "work",
            "adRegion": "3",
            "adSubregion": "5",
            "adTown": "10",
            "adId": "1",
            "images": [
                {
                    "imageURL": "random url",
                    "firebaseImagePath": "random path"
                }
            ],
            "approved": false,
            "street": "Madjarov",
            "extraFields": {
                "price": 50.5,
                "eventEndDate": "2025-11-12",
                "eventStartDate": "2025-10-10"
            },
            "creationDate": "2024-07-14",
            "expirationDate": "2024-08-13",
            "tags": [
                "mebel",
                "random",
                "random2"
            ],
            "account": {
                "email": "test@test.com",
                "details": {
                    "username": "TestUser",
                    "firstName": "TestName",
                    "lastName": "TestSurname",
                    "imageURL": "https://firebasestorage.googleapis.com/v0/b/pensaclub-909e0.appspot.com/o/profile-image%2F680555ff-22d4-4fad-8cc7-2b51dfb545de?alt=media&token=ab616f26-8eda-49e5-b1c9-2694540ec972"
                }
            }
        }
    ],
    "errors": {}
    ```

  - **/ads/update-expiration-date/:adId**: This endpoint sets the expiration date of an AD to 30 days from the current date. It requires the user to be logged in and the AD's ID to be provided in the URL path. Example: http://localhost:8080/ads/update-expiration-date/123 - sets the expiration date to 30 days from the current date on ad with id 123.

- **_adminController_** :

  - **/admin/change-role** : Responsible for changing account's role. This endpoint can be accessed by admins only.

## Testing

Testing is planned and will be documented in the future.
