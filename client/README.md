# Pensa Club

## Table of Contents
- [Project Description](#project-description)
- [Features](#features)
- [Current State of the Project](#current-state-of-the-project)
- [Technologies Used](#technologies-used)
- [Installation and Configuration](#installation-and-configuration)
- [Target Audience](#target-audience)
- [Contribution](#contribution)
- [License](#license)
- [Acknowledgements](#acknowledgements)
-
## Project Description
Pensa Club is an innovative platform designed to help elderly people integrate more easily into the technological world. The primary feature of the platform is an interactive map, called Pensa Map, which marks every registered user. By clicking on a marker, brief information about the user appears along with a button leading to a detailed menu that includes the user's profile and their ads. The platform aims to facilitate communication and assistance among the elderly by allowing users to share help or services and find assistance through map filters based on interests, skills, and profession. The page with ads is referred to as "Community."

The project is deployed at [Pensa Club](https://digital-literacy-wellbeing-60-plus-1.onrender.com/).

## Features
- **Interactive Map (Pensa Map):** 
  - **User Markers:** Visualizes users' locations with clickable markers that show brief information and a link to detailed user profiles and ads.
  - **Filters:** Users can filter based on skills, interests, and profession. If no filter is selected, all users are shown.
  - **Marker Information:** Clicking on a marker shows a small window with brief user information and a "Read More" button.
  - **Sidebar Menu:** The "Read More" button opens a sidebar menu with detailed user information, including personal details, skills, profession, interests, and ads.
  
  - **Zoom Control:** Users can zoom in and out of the map using `Ctrl + Scroll`. A modal appears when attempting to zoom without holding `Ctrl`.
  - **Language Support:** The map supports English translations using i18next.
  
- **User Profiles:** Detailed user profiles including personal information and ads.

- **Login and Registration:** Secure authentication with email and password requirements. 
  - **Password:** Must contain at least one uppercase letter, one number, and a minimum of 8 characters.
  - **Email:** Must contain at least 9 characters, an `@` symbol, and Latin letters.
  - **Full Access:** Every registered user will gain full access to the platform.
- **Forgot Password:** Users can reset their passwords via email.

- **Profile Page:**
  - **Personal Information:** Users can fill in their address, phone number, birth date, and upload a profile picture.
  - **Profile Completion Reminder:** An exclamation mark next to the navigation menu reminds users to complete their profile if not already done.
  - **Ads Management:** Users can create and manage ads to offer help or services, visible on their profile and through the map.
  - **Password Management:** Users can change their password securely.
  - **Profile Picture:** Users can upload and change their profile picture.
  
- **Ads Functionality (Community):** Users can create and share ads for services or help.
  - **Creating Ads:** Users can create ads to offer help or services. Ads include a title, description, and an optional image.
  - **Viewing Ads:** Users can view ads created by other users on their profiles or through the map markers.
  - **Ad Management:** Users can edit or delete their ads at any time from their profile page.
  - **Ad Categories:** Ads can be categorized based on the type of service or help being offered.
  - **Community Interaction:** The Community page allows users to browse and search for ads based on their needs.

- **Language Support:** The platform supports English translations using i18next.

## Current State of the Project
- **Home Page and Pensa Map:** Fully developed with interactive map functionality.
- **Profile Page:** Allows users to complete their profiles and update personal data.
- **Interactive Map:** Users can filter based on skills, interests, and profession.
- **Login and Registration:** Implemented with validation.
- **Password Reset:** Functional password reset via email.
- **Language Support:** English translation available.

## Technologies Used

#### Frontend
[![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org)
[![Redux](https://img.shields.io/badge/Redux-764ABC?style=flat&logo=redux&logoColor=white)](https://redux.js.org)
[![i18next](https://img.shields.io/badge/i18next-26A69A?style=flat&logo=i18next&logoColor=white)](https://www.i18next.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Fortawesome](https://img.shields.io/badge/Fortawesome-1789FC?style=flat&logo=font-awesome&logoColor=white)](https://fortawesome.com)
[![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)](https://reactrouter.com)
[![Create React App](https://img.shields.io/badge/Create_React_App-09D3AC?style=flat&logo=create-react-app&logoColor=white)](https://create-react-app.dev)
[![EmailJS](https://img.shields.io/badge/EmailJS-2E77BC?style=flat&logo=email&logoColor=white)](https://www.emailjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=white)](https://firebase.google.com)
[![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io)

## Installation and Configuration
To get started with the project, follow these steps:

# Clone the repository from GitHub
```bash
git clone https://github.com/yourusername/your-repository.git
```
# Navigate to the client directory
cd your-repository/client

# Install the necessary packages
```bash
npm install   
```
# Start the project
```bash
npm start
```
## Target Audience
The main goal is to improve and facilitate communication among elderly people on the internet, allowing them to share and seek help easily and quickly. Pensa Club is primarily targeted towards elderly individuals who need assistance in integrating with the digital world. The platform aims to enhance communication and make it easier for them to find and offer help within their community. By providing an easy-to-use interface and intuitive features, Pensa Club helps bridge the gap between the elderly and modern technology, making digital interactions more accessible and effective.

## Contribution
We welcome contributions to improve Pensa Club. Please follow the standard GitHub workflow for contributing to this project.

## License
This project is licensed under the MIT License - see the LICENSE file for details.