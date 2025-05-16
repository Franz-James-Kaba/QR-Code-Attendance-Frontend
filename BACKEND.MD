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
- Body:
    ```json
    {
      "message": "User created successfully",
      "success": true
    }
    ```

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
- Body:
    ```json
    {
      "message": "Password reset code sent to your email address",
      "success": true
    }
    ```

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
- Body:
    ```json
    {
      "message": "Password reset successful",
      "success": true
    }
    ```

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
- Body:
    ```json
    {
      "message": "Password reset successful",
      "success": true
    }
    ```


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
- Body:
    ```json
    {
      "message": "User registered successfully",
      "success": true
    }
    ```

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
- Body:
    ```json
    {
      "message": "User created successfully",
      "success": true
    }
    ```



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

**Method:** `GET api/admin/early-attendees?date={date}`

Retrieves  list of the first ten (10) attendees who checked in early on the specified date.

**Query Parameters:**

-   `date`: The start date for the search range (format: YYYY-MM-DD).


**Response:**

-   Status: 200 OK

-   Body:

    ```json
    [
    {
        "firstName": "Test",
        "lastName": "Another Test",
        "role": "NSP",
        "checkInTime": "2025-04-29T06:30:00"
    },
    {
        "firstName": "Admin",
        "lastName": "Admin",
        "role": "NSP",
        "checkInTime": "2025-04-29T06:30:03"
    },
    {
        "firstName": "Facilitator",
        "lastName": "Test",
        "role": "FACILITATOR",
        "checkInTime": "2025-04-29T06:55:34"
    },
    {
        "firstName": "Internal",
        "lastName": "Test",
        "role": "NSP",
        "checkInTime": "2025-04-29T07:26:48"
    }
]
    ```

#### Grant Reception Privilege

**Method:** `POST api/admin/grant-reception-privilege/{email}`

Grants reception privilege to a facilitator user.

**Path Parameters:**

-   `email`: The email address of the facilitator user.

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "message": "Reception privilege granted",
      "success": true
    }
    ```

#### Revoke Reception Privilege

**Method:** `POST api/admin/revoke-reception-privilege/{email}`

Revokes reception privilege from a receptionist user.

**Path Parameters:**

-   `email`: The email address of the receptionist user.

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "message": "Reception privilege revoked",
      "success": true
    }
    ```



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
- Body:
    ```json
    {
      "message": "User deleted successfully",
      "success": true
    }
    ```

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

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "message": "QR code generated successfully",
      "qrCodeImage": "<base64-encoded PNG image bytes>"
    }
    ```

#### Get All Sessions

**Method:** `GET /api/session`

Retrieves a list of all attendance sessions.

**Response:**
```json
[
  {
    "id": 1,
    "sessionCode": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "name": "Morning Session",
    "active": true,
    "startTime": "2025-05-03T09:00:00",
    "endTime": "2025-05-03T17:00:00"
  },
  {
    "id": 2,
    "sessionCode": "b2c3d4e5-6789-01bc-defa-2345678901bc",
    "name": "Afternoon Session",
    "active": false,
    "startTime": "2025-05-03T13:00:00",
    "endTime": "2025-05-03T17:00:00"
  }
]
```

#### Get Session by ID

**Method:** `GET /api/session/{sessionId}`

Retrieves details of a specific session by its ID.

**Path Parameters:**
sessionId: The ID of the session.

**Response:**

-   Status: 200 OK
-   Body:
    ```json
    {
      "id": 1,
      "sessionCode": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      "name": "Morning Session",
      "active": true,
      "startTime": "2025-05-03T09:00:00",
      "endTime": "2025-05-03T17:00:00"
    }
    ```

#### Get All Inactive Sessions

**Method:** `GET /api/session/inactive`

Retrieves a list of all inactive sessions.

**Response:**
```json[
  {
    "id": 2,
    "sessionCode": "b2c3d4e5-6789-01bc-defa-2345678901bc",
    "name": "Afternoon Session",
    "active": false,
    "startTime": "2025-05-03T13:00:00",
    "endTime": "2025-05-03T17:00:00"
  }
]
```

#### Get All Active Sessions

**Method:** `GET /api/session/active`

Retrieves a list of all active sessions.

**Response:**

```json[
  {
    "id": 1,
    "sessionCode": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
    "name": "Morning Session",
    "active": true,
    "startTime": "2025-05-03T09:00:00",
    "endTime": "2025-05-03T17:00:00"
  }
]
```

#### Update Session

**Method:** `PUT /api/session/{sessionId}`

Updates the details of a session.

**Path Parameters:**

sessionId: The ID of the session to update.

**Request Body:**

```json{
  "name": "Updated Session Name",
  "startTime": "2025-05-03T10:00:00",
  "endTime": "2025-05-03T18:00:00"
}
```
All fields are optional; only provided fields will be updated.

**Response:**

```json{
  "message": "Session updated successfully",
  "success": true
}
```


#### Delete Session

**Method:** `DELETE /api/session/{sessionId}`

Deletes a session by its ID.

**Path Parameters:**

sessionId: The ID of the session to delete.

**Response:**

```json{
  "message": "Session deleted successfully",
  "success": true
}
```
Notes:

All session endpoints require the qrcode:generate authority.
The session object fields are: id, sessionCode, name, active, startTime, endTime.
Dates and times are in ISO 8601 format.

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
    ```json
    {
      "message": "Attendance recorded successfully",
      "success": true
    }
    ```
    or
    ```json
    {
      "message": "Attendance already recorded for today",
      "success": false
    }
    ```

#### Check-Out

**Method:** `PUT api/attendance/check-out?session-code={sessionCode}`

Records the user's check-out time for a specific attendance session.

**Query Parameters:**

-   `session-code`: The session code for the attendance session.

**Response:**

-   Status: 200 OK
-   Body:
    ```json
    {
      "message": "Checked out successfully",
      "success": true
    }
    ```
    or
    ```json
    {
      "message": "Cannot check out before minimum work period (8 hours)",
      "success": false
    }
    ```


---

### Metrics Endpoints

These endpoints are available to users with the 'FACILITATOR', 'NSP', or 'ADMIN' role.

#### Get Average Check-In Time (Current User)

**Method:** `GET /api/metrics/average-check-in-time?startDate={startDate}&endDate={endDate}`

Retrieves the average check-in time for the currently authenticated user.
Date range is optional; if omitted, the average is calculated over all available data.

**Query Parameters:**

- `startDate` (optional): The start date (format: YYYY-MM-DD)
- `endDate` (optional): The end date (format: YYYY-MM-DD)

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "message": "Average check-in time retrieved for user: user@example.com",
      "data": "08:45:30"
    }
    ```
    - `data` is an ISO time string (`HH:mm:ss`). If no data is available, `data` may be `null`.

---

#### Get Average Check-Out Time (Current User)

**Method:** `GET /api/metrics/average-check-out-time?startDate={startDate}&endDate={endDate}`

Retrieves the average check-out time for the currently authenticated user.
Date range is optional; if omitted, the average is calculated over all available data.

**Query Parameters:**

- `startDate` (optional): The start date (format: YYYY-MM-DD)
- `endDate` (optional): The end date (format: YYYY-MM-DD)

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "message": "Average check-out time retrieved for user: user@example.com",
      "data": "17:15:45"
    }
    ```
    - `data` is an ISO time string (`HH:mm:ss`). If no data is available, `data` may be `null`.

---

#### Get User Profile

**Method:** `GET /api/metrics/user-info`

Retrieves the profile information of the currently authenticated user.

**Response:**
- Status: 200 OK
- Body:
    ```json
    {
      "fullName": "Jane Marie Smith",
      "role": "NSP"
    }
    ```


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


### NSP Average Check-In Time

Retrieves the average check-in time for NSPs within a specified date range.

```
GET /average-check-in-time-nsp
```

#### Request Parameters

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| startDate | Date | Yes | ISO Date (YYYY-MM-DD) | The start date of the date range |
| endDate | Date | Yes | ISO Date (YYYY-MM-DD) | The end date of the date range |

#### Responses

| Status Code | Description | Response Type |
|-------------|-------------|---------------|
| 200 | Success | LocalTime (ISO Time format) |
| 204 | No Content (No data available for the specified date range) | Empty |
| 400 | Bad Request (Invalid parameters) | Error message |

#### Example Request

```
GET /average-check-in-time-nsp?startDate=2025-04-01&endDate=2025-04-28
```

#### Example Response

```
"08:45:30"
```

### NSP Average Check-Out Time

Retrieves the average check-out time for NSPs within a specified date range.

```
GET /average-check-out-time-nsp
```

#### Request Parameters

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| startDate | Date | Yes | ISO Date (YYYY-MM-DD) | The start date of the date range |
| endDate | Date | Yes | ISO Date (YYYY-MM-DD) | The end date of the date range |

#### Responses

| Status Code | Description | Response Type |
|-------------|-------------|---------------|
| 200 | Success | LocalTime (ISO Time format) |
| 204 | No Content (No data available for the specified date range) | Empty |
| 400 | Bad Request (Invalid parameters) | Error message |

#### Example Request

```
GET /average-check-out-time-nsp?startDate=2025-04-01&endDate=2025-04-28
```

#### Example Response

```
"17:15:45"
```

### Facilitator Average Check-In Time

Retrieves the average check-in time for Facilitators within a specified date range.

```
GET /average-check-in-time-facilitator
```

#### Request Parameters

| Parameter | Type | Required | Format | Description |
|-----------|------|----------|--------|-------------|
| startDate | Date | Yes | ISO Date (YYYY-MM-DD) | The start date of the date range |
| endDate | Date | Yes | ISO Date (YYYY-MM-DD) | The end date of the date range |

#### Responses

| Status Code | Description | Response Type |
|-------------|-------------|---------------|
| 200 | Success | LocalTime (ISO Time format) |
| 204 | No Content (No data available for the specified date range) | Empty |
| 400 | Bad Request (Invalid parameters) | Error message |

#### Example Request

```
GET /average-check-in-time-facilitator?startDate=2025-04-01&endDate=2025-04-28
```

#### Example Response

```
"09:00:15"
```

### Facilitator Average Check-Out Time

Retrieves the average check-out time for Facilitators within a specified date range.

```
GET /average-check-out-time-facilitator
```

#### Request Parameters

| Parameter | Type | Required | Format                | Description                      |
|-----------|------|----------|-----------------------|----------------------------------|
| startDate | Date | Yes      | ISO Date (YYYY-MM-DD) | The start date of the date range |
| endDate   | Date | Yes      | ISO Date (YYYY-MM-DD) | The end date of the date range   |

#### Responses

| Status Code | Description                                                 | Response Type               |
|-------------|-------------------------------------------------------------|-----------------------------|
| 200         | Success                                                     | LocalTime (ISO Time format) |
| 204         | No Content (No data available for the specified date range) | Empty                       |
| 400         | Bad Request (Invalid parameters)                            | Error message               |

#### Example Request

```
GET /average-check-out-time-facilitator?startDate=2025-04-01&endDate=2025-04-28
```

#### Example Response

```
"16:45:20"
```

## Error Handling

All endpoints follow the same error handling pattern:

- If the date parameters are invalid (e.g., endDate before startDate), a 400 Bad Request response is returned with an appropriate error message.
- If no data is available for the specified date range, a 204 No Content response is returned.
- Internal server errors will result in a 500 Internal Server Error response.

## Implementation Notes

- All time values are returned as ISO-formatted time strings (HH:MM:SS).
- Date parameters must be provided in ISO date format (YYYY-MM-DD).
- The date range is inclusive of both the start and end dates.
- Time calculations are handled by the underlying metricsService.
