# Country API Documentation

## Overview
The Country API provides endpoints for managing countries in the travel system. It supports CRUD operations and includes relationships with cities and custom tours.

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
  "name": "France"
}
```

**Validation Rules:**
- `name`: Required, string, 2-100 characters, unique

### 2. Get All Countries
**GET** `/countries`

Retrieves all countries with their cities count and basic city information.

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
      },
      {
        "id": 2,
        "name": "Lyon"
      }
    ],
    "_count": {
      "cities": 2,
      "customTours": 5
    }
  }
]
```

### 3. Get Country by ID
**GET** `/countries/:id`

Retrieves detailed information about a specific country including all cities, hotels, and custom tours.

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
          "name": "Hotel Ritz",
          "rating": 5
        }
      ],
      "_count": {
        "hotels": 1,
        "CustomTour": 3
      }
    }
  ],
  "customTours": [
    {
      "id": 1,
      "guests": 2,
      "departureDate": "2025-07-01T00:00:00Z",
      "returnDate": "2025-07-07T00:00:00Z",
      "price": 1500.00
    }
  ],
  "_count": {
    "cities": 1,
    "customTours": 1
  }
}
```

### 4. Search Countries by Name
**GET** `/countries/search?name=Fra`

Searches for countries by name (case-insensitive, partial match).

**Query Parameters:**
- `name`: String to search in country names

**Response:**
```json
[
  {
    "id": 1,
    "name": "France",
    "cities": [...],
    "_count": {
      "cities": 2,
      "customTours": 5
    }
  }
]
```

### 5. Get Country Statistics
**GET** `/countries/statistics`

Returns statistical information about countries, cities, and tours.

**Response:**
```json
{
  "totalCountries": 25,
  "totalCities": 150,
  "totalCustomTours": 500,
  "countriesWithMostCities": [
    {
      "id": 1,
      "name": "France",
      "citiesCount": 15,
      "customToursCount": 50
    },
    {
      "id": 2,
      "name": "Italy",
      "citiesCount": 12,
      "customToursCount": 45
    }
  ]
}
```

### 6. Update Country
**PATCH** `/countries/:id`

Updates an existing country.

**Request Body:**
```json
{
  "name": "French Republic"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "French Republic"
}
```

### 7. Delete Country
**DELETE** `/countries/:id`

Deletes a country (only if it has no cities or custom tours).

**Response:**
```json
{
  "message": "Country 'France' has been successfully deleted"
}
```

## Error Responses

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Country with ID 1 not found"
}
```

### 409 Conflict (Duplicate Name)
```json
{
  "statusCode": 409,
  "message": "Country with name 'France' already exists"
}
```

### 409 Conflict (Cannot Delete)
```json
{
  "statusCode": 409,
  "message": "Cannot delete country 'France'. It has 5 cities. Please delete all cities first."
}
```

### 400 Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "Country name must be at least 2 characters long",
    "Country name must not exceed 100 characters"
  ],
  "error": "Bad Request"
}
```

## Business Rules

1. **Unique Names**: Country names must be unique across the system
2. **Cascade Protection**: Countries cannot be deleted if they have:
   - Cities (must delete cities first)
   - Custom tours (must delete custom tours first)
3. **Character Limits**: Country names must be 2-100 characters
4. **Case Sensitivity**: Search is case-insensitive

## Relationships

- **One-to-Many with Cities**: A country can have multiple cities
- **One-to-Many with Custom Tours**: A country can be destination for multiple custom tours
- **Indirect relationship with Hotels**: Through cities
- **Indirect relationship with Transports**: Through destination strings

## Usage Examples

### Creating a Complete Country Setup
```bash
# 1. Create Country
POST /countries
{
  "name": "Spain"
}

# 2. Create Cities (separate endpoint needed)
POST /cities
{
  "name": "Madrid",
  "countryId": 1
}

# 3. Create Hotels (separate endpoint needed)
POST /hotels
{
  "name": "Hotel Prado",
  "rating": 4,
  "email": "info@hotelprado.es",
  "phone": "+34123456789",
  "cityId": 1
}
```

## Notes
- All `GET` endpoints are public (no authentication required)
- `POST`, `PATCH`, and `DELETE` endpoints require authentication
- Countries are foundational entities and should be created before cities
- Deletion requires careful consideration of dependencies
