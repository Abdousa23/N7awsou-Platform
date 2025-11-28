# Enhanced Country API Documentation

## Overview
The Country API provides comprehensive endpoints for managing countries in the travel system. It supports advanced filtering, CRUD operations, and includes relationships with cities, custom tours, and transport systems.

## Base URL
```
/countries
```

## Endpoints

### 1. Create Country
**POST** `/countries`

Creates a new country.

**Request Body:**
```json
{
  "name": "France"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "France",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

### 2. Get All Countries (Simple)
**GET** `/countries`

Get all countries with basic city information.

**Response:**
```json
[
  {
    "id": 1,
    "name": "France",
    "cities": [
      {
        "id": 1,
        "name": "Paris"
      }
    ],
    "_count": {
      "cities": 1,
      "customTours": 3
    }
  }
]
```

### 3. Get Countries with Advanced Filtering
**GET** `/countries/filter`

Get countries with comprehensive filtering and search capabilities.

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `search` | string | Search in country name or city names | - |
| `countryName` | string | Filter by country name (partial match) | - |
| `cityName` | string | Filter by city name (partial match) | - |
| `transportTypes` | string[] | Filter by transport types (BUS, TRAIN, FLIGHT, CAR) | - |
| `transportId` | number | Filter by specific transport ID | - |
| `sortBy` | enum | Sort by: name, citiesCount, customToursCount, createdAt | name |
| `sortOrder` | enum | Sort order: asc, desc | asc |
| `includeTransport` | boolean | Include transport details | false |
| `includeCities` | boolean | Include cities details | true |
| `includeCustomTours` | boolean | Include custom tours details | false |
| `limit` | number | Limit results | 50 |
| `offset` | number | Offset for pagination | 0 |

**Example Request:**
```
GET /countries/filter?search=france&includeTransport=true&transportTypes=FLIGHT,TRAIN&sortBy=citiesCount&sortOrder=desc&limit=10
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "France",
      "cities": [
        {
          "id": 1,
          "name": "Paris",
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ],
      "customTours": [
        {
          "id": 1,
          "guests": 2,
          "departureDate": "2025-02-01T00:00:00.000Z",
          "returnDate": "2025-02-07T00:00:00.000Z",
          "price": 1500.00,
          "duration": 7,
          "departureLocation": "New York",
          "destinationLocation": "Paris",
          "transport": {
            "id": 1,
            "type": ["FLIGHT"],
            "capacity": 200,
            "destination": "Paris Charles de Gaulle",
            "price": 800.00
          }
        }
      ],
      "_count": {
        "cities": 1,
        "customTours": 3
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### 4. Get Countries by Transport Type
**GET** `/countries/transport/:type`

Get all countries that have custom tours using a specific transport type.

**Parameters:**
- `type`: Transport type (bus, train, flight, car) - case insensitive

**Example:** `GET /countries/transport/flight`

**Response:**
```json
[
  {
    "id": 1,
    "name": "France",
    "cities": [
      {
        "id": 1,
        "name": "Paris"
      }
    ],
    "customTours": [
      {
        "id": 1,
        "price": 1500.00,
        "duration": 7,
        "transport": {
          "id": 1,
          "type": ["FLIGHT"],
          "capacity": 200,
          "destination": "Paris Charles de Gaulle",
          "price": 800.00
        }
      }
    ],
    "_count": {
      "cities": 1,
      "customTours": 3
    }
  }
]
```

### 5. Get Country by ID with Enhanced Details
**GET** `/countries/:id`

Get a specific country with detailed information including optional transport details.

**Parameters:**
- `id`: Country ID

**Query Parameters:**
- `includeTransport`: Include transport details (true/false)

**Example:** `GET /countries/1?includeTransport=true`

**Response:**
```json
{
  "id": 1,
  "name": "France",
  "cities": [
    {
      "id": 1,
      "name": "Paris",
      "hotels": [
        {
          "id": 1,
          "name": "Hotel de Luxe",
          "rating": 5
        }
      ],
      "_count": {
        "hotels": 1,
        "CustomTour": 2
      }
    }
  ],
  "customTours": [
    {
      "id": 1,
      "guests": 2,
      "departureDate": "2025-02-01T00:00:00.000Z",
      "returnDate": "2025-02-07T00:00:00.000Z",
      "price": 1500.00,
      "duration": 7,
      "departureLocation": "New York",
      "destinationLocation": "Paris"
    }
  ],
  "transports": {
    "all": [
      {
        "id": 1,
        "type": ["FLIGHT"],
        "capacity": 200,
        "destination": "Paris Charles de Gaulle",
        "price": 800.00
      }
    ],
    "byType": {
      "FLIGHT": [
        {
          "id": 1,
          "type": ["FLIGHT"],
          "capacity": 200,
          "destination": "Paris Charles de Gaulle",
          "price": 800.00
        }
      ]
    }
  },
  "_count": {
    "cities": 1,
    "customTours": 3
  }
}
```

### 6. Search Countries by Name
**GET** `/countries/search?name=:name`

Search countries by name with case-insensitive partial matching.

**Query Parameters:**
- `name`: Country name to search for

**Response:**
```json
[
  {
    "id": 1,
    "name": "France",
    "cities": [
      {
        "id": 1,
        "name": "Paris"
      }
    ],
    "_count": {
      "cities": 1,
      "customTours": 3
    }
  }
]
```

### 7. Get Country Statistics
**GET** `/countries/statistics`

Get comprehensive statistics about countries, cities, and custom tours.

**Response:**
```json
{
  "totalCountries": 10,
  "totalCities": 25,
  "totalCustomTours": 150,
  "countriesWithMostCities": [
    {
      "id": 1,
      "name": "France",
      "citiesCount": 5,
      "customToursCount": 15
    }
  ]
}
```

### 8. Update Country
**PATCH** `/countries/:id`

Update a country's information.

**Parameters:**
- `id`: Country ID

**Request Body:**
```json
{
  "name": "Updated France"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated France",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T12:00:00.000Z"
}
```

### 9. Delete Country
**DELETE** `/countries/:id`

Delete a country (only if it has no cities or custom tours).

**Parameters:**
- `id`: Country ID

**Response:**
```json
{
  "message": "Country 'France' has been successfully deleted"
}
```

## Advanced Usage Examples

### Example 1: Find countries with cities containing "paris" and flight transport
```bash
GET /countries/filter?search=paris&transportTypes=FLIGHT&includeTransport=true&includeCustomTours=true
```

### Example 2: Get top 5 countries by number of cities
```bash
GET /countries/filter?sortBy=citiesCount&sortOrder=desc&limit=5&includeCities=true
```

### Example 3: Find countries with specific transport and sort by custom tours
```bash
GET /countries/filter?transportTypes=TRAIN,BUS&sortBy=customToursCount&sortOrder=desc&includeTransport=true
```

### Example 4: Search for countries and cities with pagination
```bash
GET /countries/filter?search=europe&limit=20&offset=0&includeCities=true
```

### Example 5: Get all countries accessible by flight
```bash
GET /countries/transport/flight
```

### Example 6: Get detailed country information with transport grouping
```bash
GET /countries/1?includeTransport=true
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "Country name must be at least 2 characters long"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Country with ID 1 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Country with name 'France' already exists",
  "error": "Conflict"
}
```

## Validation Rules

### Create/Update Country
- `name`: Required, string, 2-100 characters, unique

### Filter Parameters
- `search`: Optional, string, minimum 1 character
- `countryName`: Optional, string, minimum 1 character
- `cityName`: Optional, string, minimum 1 character
- `transportTypes`: Optional, array of valid transport types (BUS, TRAIN, FLIGHT, CAR)
- `transportId`: Optional, positive integer
- `sortBy`: Optional, enum (name, citiesCount, customToursCount, createdAt)
- `sortOrder`: Optional, enum (asc, desc)
- `limit`: Optional, positive integer, maximum 100
- `offset`: Optional, non-negative integer

## Transport Types
- `BUS`: Bus transportation
- `TRAIN`: Train transportation  
- `FLIGHT`: Flight transportation
- `CAR`: Car transportation

## Relationships
- **Countries** have many **Cities**
- **Countries** have many **Custom Tours**
- **Custom Tours** belong to **Transport**
- **Cities** have many **Hotels**
- **Hotels** have many **Rooms**

## Performance Notes
- Use pagination (`limit` and `offset`) for large datasets
- Filter results as specifically as possible to improve performance
- The `includeTransport` option adds additional database queries
- Transport details are grouped by type for easier consumption
