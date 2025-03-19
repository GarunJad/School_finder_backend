# School Finder System Backend

This repository contains the backend code for the **School Finder System**, a web-based service designed to help users find nearby schools based on their geographic location. The backend APIs handle school data management, including adding new schools to the database and retrieving a list of schools sorted by proximity to the user's location.

## Overview

The backend of this system is built using **Node.js** and **Express.js**, with a **PostgreSQL** database to store and manage school information. The APIs provided by this system allow users to:

- Find schools within a specified radius based on latitude and longitude.
- Add new schools to the database.

### Core Features:
1. **List Nearby Schools**: Users can query the system for nearby schools by providing their latitude and longitude. The API will return a list of schools within a specified radius, sorted by distance from the user's location.
  
2. **Add New Schools**: Administrators or authorized users can add new schools to the system by sending school details through a `POST` request. This allows the system to grow and keep its database up-to-date.

## API Endpoints

### `GET /listSchools`

This endpoint allows users to retrieve a list of schools that are within a certain radius of the provided latitude and longitude.

#### Request:
- **Method**: `GET`
- **URL**: `/listSchools?latitude={latitude}&longitude={longitude}`
  
#### Query Parameters:
- `latitude` (required): The latitude of the user's current location.
- `longitude` (required): The longitude of the user's current location.

#### Response:
- **200 OK**: Returns a list of nearby schools sorted by distance, with the following information:
  ```json
  [
    {
      "id": 1,
      "name": "Blue Ridge Academy",
      "address": "456 Ridge Rd, Rivertown",
      "latitude": 38.898,
      "longitude": -77.0366,
      "distance": 0.0059
    },
    {
      "id": 2,
      "name": "Sunset Elementary School",
      "address": "789 Sunset Blvd, Sunnyvale",
      "latitude": 37.7749,
      "longitude": -122.419,
      "distance": 3918.768
    }
  ]
  ```
## POST /addSchool

This endpoint allows authorized users to add a new school to the database.

### Request:
- **Method:** POST
- **URL:** `/addSchool`
- **Request Body (JSON):**
  ```json
  {
    "name": "New School Name",
    "address": "123 School St, Town",
    "latitude": 35.1234,
    "longitude": -80.9876
  }
  ```
  ### Response Codes

- **201 Created**: Returns a confirmation message if the school is successfully added.
  ```json
  {
    "message": "School added successfully"
  }
  ```
  
- **400 Bad Request**: Returns an error if the request body is missing required fields.

- **500 Internal Server Error**: Returns an error if something went wrong with the database insertion.

### Error Handling:
-**400 Bad Request**: Returns an error if latitude or longitude is missing.

-**500 Internal Server Error**: Returns an error if something went wrong with the database query.

### How to Run the Project:

1.Clone the repository:
```json
git clone https://github.com/yourusername/school-finder-backend.git
cd school-finder-backend
```
2.Install dependencies:
```json
npm install
```
3.reate a .env file in the root directory and add your PostgreSQL database credentials:
```json
SUPABASE_DB_URL=your_supabase_URL
```
4.Run the project:
```json
node index.js
```
