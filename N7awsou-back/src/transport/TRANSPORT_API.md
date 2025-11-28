# Transport API Documentation

## Overview
The Transport API provides endpoints for managing transportation options in the custom tour system. It supports CRUD operations and various filtering capabilities.

## Base URL
```
/transport
```

## Endpoints

### 1. Create Transport
**POST** `/transport`

Creates a new transport option.

**Request Body:**
```json
{
  "type": ["BUS", "TRAIN", "FLIGHT", "CAR"],
  "capacity": 50,
  "destination": "Paris",
  "price": 150.00
}
```

**Response:**
```json
{
  "id": 1,
  "type": ["BUS", "TRAIN"],
  "capacity": 50,
  "destination": "Paris",
  "price": 150.00,
  "createdAt": "2025-06-27T10:00:00Z",
  "updatedAt": "2025-06-27T10:00:00Z"
}
```

### 2. Get All Transports
**GET** `/transport`

Retrieves all available transports.

**Response:**
```json
[
  {
    "id": 1,
    "type": ["BUS"],
    "capacity": 50,
    "destination": "Paris",
    "price": 150.00,
    "createdAt": "2025-06-27T10:00:00Z",
    "updatedAt": "2025-06-27T10:00:00Z"
  }
]
```

### 3. Get Transport by ID
**GET** `/transport/:id`

Retrieves a specific transport by ID, including related custom tours.

**Response:**
```json
{
  "id": 1,
  "type": ["BUS"],
  "capacity": 50,
  "destination": "Paris",
  "price": 150.00,
  "customTours": [...],
  "createdAt": "2025-06-27T10:00:00Z",
  "updatedAt": "2025-06-27T10:00:00Z"
}
```

### 4. Update Transport
**PATCH** `/transport/:id`

Updates an existing transport.

**Request Body:**
```json
{
  "price": 175.00,
  "capacity": 60
}
```

### 5. Delete Transport
**DELETE** `/transport/:id`

Deletes a transport (only if not used in any custom tours).

**Response:**
```json
{
  "message": "Transport with ID 1 has been successfully deleted"
}
```

### 6. Get Transport Types
**GET** `/transport/types`

Returns all available transport types.

**Response:**
```json
["BUS", "TRAIN", "FLIGHT", "CAR"]
```

### 7. Get Transports by Type
**GET** `/transport/by-type/:type`

Filters transports by a specific type.

**Parameters:**
- `type`: One of BUS, TRAIN, FLIGHT, CAR

### 8. Get Transports by Destination
**GET** `/transport/by-destination?destination=Paris`

Filters transports by destination (case-insensitive search).

**Query Parameters:**
- `destination`: String to search in destinations

### 9. Get Transports by Capacity
**GET** `/transport/by-capacity?minCapacity=40`

Filters transports by minimum capacity.

**Query Parameters:**
- `minCapacity`: Minimum capacity required

### 10. Get Transports by Price Range
**GET** `/transport/by-price-range?minPrice=100&maxPrice=200`

Filters transports by price range.

**Query Parameters:**
- `minPrice`: Minimum price
- `maxPrice`: Maximum price

### 11. Get Transport Statistics
**GET** `/transport/statistics`

Returns statistical information about transports.

**Response:**
```json
{
  "total": 25,
  "byType": [
    {
      "type": ["BUS"],
      "_count": {
        "id": 10
      }
    }
  ],
  "averagePrice": 145.50,
  "averageCapacity": 42.3
}
```

## Transport Types Enum
- `BUS`: Bus transportation
- `TRAIN`: Train transportation
- `FLIGHT`: Flight transportation
- `CAR`: Car transportation

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Transport with ID 1 not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Cannot delete transport. It is being used in 3 custom tour(s)."
}
```

### 400 Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "type must be an array of valid transport types",
    "capacity must be a number",
    "price must be a number"
  ],
  "error": "Bad Request"
}
```

## Notes
- All `GET` endpoints are public (no authentication required)
- `POST`, `PATCH`, and `DELETE` endpoints require authentication
- Transports cannot be deleted if they are being used in custom tours
- Price should be provided as a floating-point number
- Capacity should be a positive integer
- Type field accepts an array of transport types for multi-modal transport options
