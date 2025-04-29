# Attendance System API Documentation

## Overview

This API provides endpoints for user management, authentication, and password
management in an attendance tracking system. It supports different user roles
(Admin, Facilitator, and User) with varying levels of permissions.


## Authentication

The API uses JWT (JSON Web Token) for authentication. After successful login,
include the token in the Authorization header for protected endpoints:

Authorization: Bearer {your_jwt_token}


## Endpoints

### Authentication and User Management

#### Create Admin User

**Method:** `POST api/auth/create-admin`

Creates a new admin user in the system.

**Request Body:**

```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "admin@example.com"
}
```
**Response:**

- Status: 200 OK
- Body: "User created successfully"

**Notes:**
- A temporary password will be generated and sent to the provided email.
- The user will be required to reset their password on first login.

#### User Login

**Method:** `POST api/auth/login`

Authenticates a user and returns a JWT token.

Request Body:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "passwordResetRequired": false,
  "role": "ADMIN"
}
```
#### Request Password Reset

**Method:** `POST api/auth/reset-password-request?email=user@example.com`

Initiates the password reset process by sending a reset token to the user's email.

**Query Parameters:**
- email: The email address of the user requesting password reset

**Response:**
- Status: 200 OK
- Body: "Password reset code sent to your email address"

#### Reset Password

**Method:** `POST api/auth/reset-password?email=user@example.com&token=reset_token_here`

Resets a user's password using the token sent to their email.

**Query Parameters:**
- email: The email address of the user
- token: The reset token received via email

**Request Body:**


```json
{
  "password": "NewP@ssword123",
  "confirmPassword": "NewP@ssword123"
}
```
**Response:**
- Status: 200 OK
- Body: "Password reset successful"

#### First-time Password Reset

**Method:** `POST api/auth/first-password-reset?email=user@example.com`

Allows users to reset their temporary password after first login.

**Query Parameters:**
- email: The email address of the user

**Request Body:**

```json
{
  "password": "NewP@ssword123",
  "confirmPassword": "NewP@ssword123"
}
```
**Response:**
- Status: 200 OK
- Body: "Password reset successful"

### Admin Operations

These endpoints require admin privileges.

#### Register Regular User

**Method:** `POST api/admin/create-nsp`

Creates a new regular user.

**Request Body:**

```json
{
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}
```
**Response:**
- Status: 200 OK
- Body: "User registered successfully"

#### Create Facilitator

**Method:** `POST api/admin/create-facilitator`

Creates a new facilitator user.

**Request Body:**


```json
{
  "firstName": "Robert",
  "middleName": "James",
  "lastName": "Johnson",
  "email": "robert.johnson@example.com"
}
```
**Response:**
- Status: 200 OK
- Body: "User created successfully"


#### Get User by Email

**Method:** `GET api/admin/users?email={email}`

Retrieves a user's information by their email address.

**Query Parameters:**

-   `email`: The email address of the user to retrieve.

**Response:**

-   Status: 200 OK

-   Body:

    ```json
    {
      "id": 123,
      "firstName": "John",
      "middleName": "Michael",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "NSP"
    }
    ```

-   Status: 404 Not Found
-   Body:

    ```json
    {
      "error": "User not found"
    }
    ```

#### Get All Regular Users (NSPs)

**Method:** `GET api/admin/users/nsps?page={page}&size={size}`

Retrieves a paginated list of all regular users (NSPs).

**Query Parameters:**

-   `page`: The page number to retrieve (default: 1).
-   `size`: The number of users per page (default: 10).

**Response:**

-   Status: 200 OK

-   Body:

    ```json
    {
      "content": [
        {
          "id": 1,
          "firstName": "Jane",
          "middleName": "Marie",
          "lastName": "Smith",
          "email": "jane.smith@example.com",
          "role": "NSP"
        },
        {
          "id": 2,
          "firstName": "Peter",
          "middleName": "David",
          "lastName": "Jones",
          "email": "peter.jones@example.com",
          "role": "NSP"
        }
      ],
      "pageable": {
        "sort": {
          "empty": false,
          "sorted": true,
          "unsorted": false
        },
        "offset": 0,
        "pageNumber": 0,
        "pageSize": 2,
        "paged": true,
        "unpaged": false
      },
      "last": true,
      "totalPages": 1,
      "totalElements": 2,
      "size": 2,
      "number": 0,
      "sort": {
        "empty": false,
        "sorted": true,
        "unsorted": false
      },
      "first": true,
      "numberOfElements": 2,
      "empty": false
    }
    ```

#### Get All Facilitators

**Method:** `GET api/admin/users/facilitators?page={page}&size={size}`

Retrieves a paginated list of all facilitators.

**Query Parameters:**

-   `page`: The page number to retrieve (default: 0).
-   `size`: The number of facilitators per page (default: 10).

**Response:**

-   Status: 200 OK

-   Body:

    ```json
    {
      "content": [
        {
          "id": 3,
          "firstName": "Alice",
          "middleName": "Grace",
          "lastName": "Brown",
          "email": "alice.brown@example.com",
          "role": "FACILITATOR"
        }
      ],
      "pageable": {
        "sort": {
          "empty": false,
          "sorted": true,
          "unsorted": false
        },
        "offset": 0,
        "pageNumber": 0,
        "pageSize": 10,
        "paged": true,
        "unpaged": false
      },
      "last": true,
      "totalPages": 1,
      "totalElements": 1,
      "size": 10,
      "number": 0,
      "sort": {
        "empty": false,
        "sorted": true,
        "unsorted": false
      },
      "first": true,
      "numberOfElements": 1,
      "empty": false
    }
    ```

#### Get Early Attendees

**Method:** `GET api/admin/early-attendees?startDate={startDate}&endDate={endDate}&page={page}&size={size}`

Retrieves a paginated list of attendees who checked in early within a specified date range.

**Query Parameters:**

-   `startDate`: The start date for the search range (format: YYYY-MM-DD).
-   `endDate`: The end date for the search range (format: YYYY-MM-DD).
-   `page`: The page number to retrieve (default: 0).
-   `size`: The number of attendees per page (default: 100).

**Response:**

-   Status: 200 OK

-   Body:

    ```json
    {
      "content": [
        {
          "id": 1,
          "checkInTime": "2024-01-20T07:25:00",
          "checkOutTime": null,
          "userId": 123,
          "date": "2024-01-20"
        }
      ],
      "pageable": {
        "sort": {
          "empty": true,
          "sorted": false,
          "unsorted": true
        },
        "offset": 0,
        "pageNumber": 0,
        "pageSize": 100,
        "paged": true,
        "unpaged": false
      },
      "last": true,
      "totalPages": 1,
      "totalElements": 1,
      "size": 100,
      "number": 0,
      "sort": {
        "empty": true,
        "sorted": false,
        "unsorted": true
      },
      "first": true,
      "numberOfElements": 1,
      "empty": false
    }
    ```

#### Grant Reception Privilege

**Method:** `POST api/admin/grant-reception-privilege/{email}`

Grants reception privilege to a facilitator user.

**Path Parameters:**

-   `email`: The email address of the facilitator user.

**Response:**

-   Status: 200 OK
-   Body: `"Reception privilege granted"`

#### Revoke Reception Privilege

**Method:** `POST api/admin/revoke-reception-privilege/{email}`

Revokes reception privilege from a receptionist user.

**Path Parameters:**

-   `email`: The email address of the receptionist user.

**Response:**

-   Status: 200 OK
-   Body: `"Reception privilege revoked"`


#### Update User

**Method:** `PUT api/admin/users/{userId}`

Updates a user's information.

**Path Parameters:**
- userId: The ID of the user to update

**Request Body:**

```json
{
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Smith-Johnson",
  "email": "jane.smith@example.com"
}
```
Response:

```json
{
  "id": 1,
  "firstName": "Jane",
  "middleName": "Marie",
  "lastName": "Smith-Johnson",
  "email": "jane.smith@example.com",
  "passwordResetRequired": false,
  "createdAt": "2023-05-15",
  "role": "USER"
}
```
#### Delete User

**Method:** `DELETE api/admin/users/{userId}`

Deletes a user from the system.

**Path Parameters:**
- userId: The ID of the user to delete

**Response:**
- Status: 200 OK
- Body: "User deleted successfully"

## Error Responses

- **404 Not Found:** "User not found"
- **403 Forbidden:** "You are not authorized to perform this action"

## Data Validation

### User Registration/Creation
- **firstName:** Required, 3-50 characters
- **lastName:** Required, 3-50 characters
- **email:** Required, must be a valid email format

### Password Reset
- **password:** Required, minimum 8 characters, must contain at least one special character
- **confirmPassword:** Required, must match password

### Session Management

#### Generate QR Code for Attendance Session

**Method:** `POST api/session/generate-qrcode?width={width}&height={height}`

Generates a QR code for an attendance session. This endpoint is protected and requires the admin or reception privilege.

**Request Body:**

```json
{
  "startTime": "2025-04-26T09:00:00",
  "endTime": "2025-04-26T17:00:00"
}
```

### Attendance Tracking

These endpoints are available to users with either the 'NSP' or 'FACILITATOR' role.

#### Check-In

**Method:** `POST api/attendance/check-in?session-code={sessionCode}`

Records the user's check-in time for a specific attendance session.

**Query Parameters:**

-   `session-code`: The session code for the attendance session. This code is generated when creating a new session.

**Response:**

-   Status: 200 OK
-   Body:
    *   `"Attendance recorded successfully"` - If the check-in was successful.
    *   `"Attendance already recorded for today"` - If the user has already checked in today.

#### Check-Out

**Method:** `PUT api/attendance/check-out?session-code={sessionCode}`

Records the user's check-out time for a specific attendance session.

**Query Parameters:**

-   `session-code`: The session code for the attendance session.

**Response:**

-   Status: 200 OK
-   Body:
    *   `"Checked out successfully"` - If the check-out was successful.
    *   `"Cannot check out before minimum work period (8 hours)"` - If the user attempts to check out less than 8 hours after checking in.


**Error Responses:**

-   404 Not Found: "Session not found" - If the provided session code does not exist.
-   400 Bad Request: "Session invalid or expired" - If the session is not active.
-   404 Not Found: "No check-in record found for today" - If the user tries to check out without checking in first.





## Error Handling

The API returns appropriate HTTP status codes and error messages:

| Status Code | Description                                      |
| ----------- | ------------------------------------------------ |
| 400         | Bad Request - Validation errors or invalid input |
| 401         | Unauthorized - Authentication failure            |
| 403         | Forbidden - Insufficient permissions             |
| 404         | Not Found - Resource not found                   |
| 500         | Internal Server Error - Server-side errors       |

For validation errors, the response will include specific error messages for each invalid field.

## Notes

- New users are created with a temporary password that must be reset on first login.
- Password reset tokens have a limited validity period.
- All endpoints that modify data require authentication.
- Admin operations require specific admin privileges.


