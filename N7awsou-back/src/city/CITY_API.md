# City API Documentation

## Overview
The City API provides endpoints for managing cities within countries, including CRUD operations, filtering, search, and statistics.

## Base URL
`/cities`

## Endpoints

### 1. Create City
**POST** `/cities`

Creates a new city within a specific country.

**Headers:**
- `Authorization: Bearer <token>` (Required)

**Request Body:**
```json
{
  "name": "Paris",
  "countryId": 1
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Paris",
  "countryId": 1,
  "country": {
    "id": 1,
    "name": "France"
  }
}
```

### 2. Get All Cities
**GET** `/cities`

Retrieves all cities with optional filtering.

**Query Parameters:**
- `search` (optional): Search term for city or country name
- `countryId` (optional): Filter by specific country ID
- `sortBy` (optional): Sort field (`name`, `countryName`, `hotelCount`, `customTourCount`)
- `sortOrder` (optional): Sort order (`asc`, `desc`)

**Example:** `/cities?search=paris&sortBy=name&sortOrder=asc`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paris",
    "countryId": 1,
    "country": {
      "id": 1,
      "name": "France"
    },
    "hotels": [
      {
        "id": 1,
        "name": "Hotel Ritz",
        "rating": 5
      }
    ],
    "_count": {
      "hotels": 15,
      "CustomTour": 8
    }
  }
]
```

### 3. Get City by ID
**GET** `/cities/:id`

Retrieves a specific city with detailed information including hotels and custom tours.

**Parameters:**
- `id` (required): City ID

**Response:**
```json
{
  "id": 1,
  "name": "Paris",
  "countryId": 1,
  "country": {
    "id": 1,
    "name": "France"
  },
  "hotels": [
    {
      "id": 1,
      "name": "Hotel Ritz",
      "rooms": [
        {
          "id": 1,
          "priceLevel": "LUXURY",
          "pricePerNight": 500.0,
          "occupancy": 2
        }
      ],
      "_count": {
        "rooms": 50,
        "customTours": 3
      }
    }
  ],
  "CustomTour": [
    {
      "id": 1,
      "guests": 4,
      "departureDate": "2024-07-01T10:00:00Z",
      "returnDate": "2024-07-07T18:00:00Z",
      "price": 2500.0,
      "duration": 6
    }
  ],
  "_count": {
    "hotels": 15,
    "CustomTour": 8
  }
}
```

### 4. Search Cities by Name
**GET** `/cities/search`

Searches for cities by name (case-insensitive partial match).

**Query Parameters:**
- `name` (required): Search term for city name

**Example:** `/cities/search?name=par`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paris",
    "countryId": 1,
    "country": {
      "id": 1,
      "name": "France"
    },
    "_count": {
      "hotels": 15,
      "CustomTour": 8
    }
  }
]
```

### 5. Get Cities by Country
**GET** `/cities/by-country/:countryId`

Retrieves all cities within a specific country.

**Parameters:**
- `countryId` (required): Country ID

**Response:**
```json
[
  {
    "id": 1,
    "name": "Paris",
    "countryId": 1,
    "country": {
      "id": 1,
      "name": "France"
    },
    "_count": {
      "hotels": 15,
      "CustomTour": 8
    }
  },
  {
    "id": 2,
    "name": "Lyon",
    "countryId": 1,
    "country": {
      "id": 1,
      "name": "France"
    },
    "_count": {
      "hotels": 8,
      "CustomTour": 3
    }
  }
]
```

### 6. Get City Statistics
**GET** `/cities/statistics`

Retrieves statistical information about cities.

**Response:**
```json
{
  "totalCities": 150,
  "topCountriesWithCities": [
    {
      "countryId": 1,
      "countryName": "France",
      "cityCount": 25
    },
    {
      "countryId": 2,
      "countryName": "Italy",
      "cityCount": 20
    }
  ],
  "citiesWithMostHotels": [
    {
      "id": 1,
      "name": "Paris",
      "countryName": "France",
      "hotelCount": 15
    }
  ],
  "citiesWithMostCustomTours": [
    {
      "id": 1,
      "name": "Paris",
      "countryName": "France",
      "customTourCount": 8
    }
  ]
}
```

### 7. Update City
**PATCH** `/cities/:id`

Updates an existing city.

**Headers:**
- `Authorization: Bearer <token>` (Required)

**Parameters:**
- `id` (required): City ID

**Request Body:**
```json
{
  "name": "Updated Paris",
  "countryId": 2
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Updated Paris",
  "countryId": 2,
  "country": {
    "id": 2,
    "name": "Spain"
  }
}
```

### 8. Delete City
**DELETE** `/cities/:id`

Deletes a city and cascades to related records (hotels, custom tours).

**Headers:**
- `Authorization: Bearer <token>` (Required)

**Parameters:**
- `id` (required): City ID

**Response:**
```json
{
  "message": "City with ID 1 has been successfully deleted"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "City name must be at least 2 characters long",
    "Country ID must be a positive number"
  ],
  "error": "Bad Request"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "City with ID 999 not found",
  "error": "Not Found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "City with name 'Paris' already exists in this country",
  "error": "Conflict"
}
```

## Data Models

### City
```typescript
{
  id: number;
  name: string;
  countryId: number;
  country: {
    id: number;
    name: string;
  };
  hotels?: Hotel[];
  CustomTour?: CustomTour[];
  _count: {
    hotels: number;
    CustomTour: number;
  };
}
```

### CreateCityDto
```typescript
{
  name: string;        // Min: 2 chars, Max: 100 chars
  countryId: number;   // Must be positive and exist
}
```

### UpdateCityDto
```typescript
{
  name?: string;       // Min: 2 chars, Max: 100 chars
  countryId?: number;  // Must be positive and exist
}
```

### CityFilterDto
```typescript
{
  search?: string;     // Min: 1 char
  countryId?: number;  // Must be positive
  sortBy?: 'name' | 'countryName' | 'hotelCount' | 'customTourCount';
  sortOrder?: 'asc' | 'desc';
}
```

## Usage Examples

### Create a city in France
```bash
curl -X POST http://localhost:3000/cities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Nice",
    "countryId": 1
  }'
```

### Search for cities containing "par"
```bash
curl "http://localhost:3000/cities/search?name=par"
```

### Get all cities in France with filtering
```bash
curl "http://localhost:3000/cities?countryId=1&sortBy=hotelCount&sortOrder=desc"
```

### Get city statistics
```bash
curl "http://localhost:3000/cities/statistics"
```
