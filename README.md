# School Management API

A Node.js API for managing school data with proximity-based sorting functionality.

## Features

- Add new schools with location data
- List schools sorted by proximity to a given location
- Input validation
- MySQL database integration
- CORS enabled
- Error handling

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the database configuration in `config.js` with your MySQL credentials
4. Run the database setup script:
   ```bash
   node db/setup.js
   ```
5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Add School
- **URL**: `/addSchool`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "School Name",
    "address": "School Address",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```

### List Schools
- **URL**: `/listSchools`
- **Method**: `GET`
- **Query Parameters**:
  - `latitude`: User's latitude
  - `longitude`: User's longitude
- **Example**: `/listSchools?latitude=40.7128&longitude=-74.0060`

## Postman Collection

Import the following collection into Postman:

```json
{
  "info": {
    "name": "School Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Add School",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/addSchool",
        "body": {
          "mode": "raw",
          "raw": "{\n    \"name\": \"Example School\",\n    \"address\": \"123 School St\",\n    \"latitude\": 40.7128,\n    \"longitude\": -74.0060\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    },
    {
      "name": "List Schools",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/listSchools",
        "query": [
          {
            "key": "latitude",
            "value": "40.7128"
          },
          {
            "key": "longitude",
            "value": "-74.0060"
          }
        ]
      }
    }
  ]
}
```

## Error Handling

The API includes comprehensive error handling for:
- Invalid input data
- Database connection issues
- Server errors

## Security

- Input validation and sanitization
- SQL injection prevention using parameterized queries
- CORS enabled for cross-origin requests

## License

MIT 