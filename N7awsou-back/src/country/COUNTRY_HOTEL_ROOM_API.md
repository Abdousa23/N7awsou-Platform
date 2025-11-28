# Country API Documentation - Updated with Hotel & Room Filtering

## Overview
The Country API provides comprehensive functionality for managing countries, cities, hotels, rooms, and their relationships with custom tours and transport options. This API supports advanced filtering, sorting, and pagination capabilities including hotel and room filtering.

## Base URL
```
/countries
```

## New Hotel & Room Filtering Features

### Enhanced Filter Parameters
The `/countries/filter` endpoint now supports additional hotel and room filtering:

#### Hotel Filtering
- `hotelName` (string): Filter by hotel name
- `hotelId` (number): Filter by specific hotel ID
- `minRating` (number): Minimum hotel rating (1-5)
- `maxRating` (number): Maximum hotel rating (1-5)

#### Room Filtering
- `priceLevels` (string[]): Filter by room price levels (LOW, MEDIUM, HIGH)
- `roomId` (number): Filter by specific room ID
- `minRoomPrice` (number): Minimum room price per night
- `maxRoomPrice` (number): Maximum room price per night
- `minRoomOccupancy` (number): Minimum room occupancy
- `maxRoomOccupancy` (number): Maximum room occupancy

#### Include Options
- `includeHotels` (boolean): Include hotels information
- `includeRooms` (boolean): Include rooms information

#### Enhanced Sorting
- `hotelsCount`: Sort by total number of hotels
- `roomsCount`: Sort by total number of rooms

## New Endpoints

### 1. Get Countries by Hotel Rating
**GET** `/countries/hotels/rating`

Retrieves countries with hotels within specified rating range.

**Query Parameters:**
- `minRating` (number): Minimum hotel rating (1-5)
- `maxRating` (number): Maximum hotel rating (1-5)

**Example:** 
```bash
GET /countries/hotels/rating?minRating=4&maxRating=5
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Spain",
    "cities": [
      {
        "name": "Madrid",
        "hotels": [
          {
            "id": 1,
            "name": "Hotel Madrid Palace",
            "rating": 5,
            "email": "info@madridpalace.com",
            "phone": "+34 91 360 8000",
            "_count": {
              "rooms": 50
            }
          }
        ]
      }
    ],
    "_count": {
      "cities": 1,
      "customTours": 0
    }
  }
]
```

### 2. Get Countries by Room Price Level
**GET** `/countries/rooms/price-level/:level`

Retrieves countries with rooms of specific price level.

**Parameters:**
- `level` (string): Price level (LOW, MEDIUM, HIGH)

**Example:**
```bash
GET /countries/rooms/price-level/HIGH
```

### 3. Get Countries by Room Price Range
**GET** `/countries/rooms/price-range`

Retrieves countries with rooms within specified price range.

**Query Parameters:**
- `minPrice` (number): Minimum room price per night
- `maxPrice` (number): Maximum room price per night

**Example:**
```bash
GET /countries/rooms/price-range?minPrice=100&maxPrice=300
```

### 4. Get Rooms by Country
**GET** `/countries/:id/rooms`

Retrieves all rooms in hotels within a specific country.

**Parameters:**
- `id` (number): Country ID

**Example:**
```bash
GET /countries/1/rooms
```

**Response:**
```json
{
  "id": 1,
  "name": "Spain",
  "cities": [
    {
      "id": 1,
      "name": "Madrid",
      "hotels": [
        {
          "id": 1,
          "name": "Hotel Madrid Palace",
          "rating": 5,
          "email": "info@madridpalace.com",
          "phone": "+34 91 360 8000",
          "rooms": [
            {
              "id": 1,
              "occupancy": 2,
              "priceLevel": "HIGH",
              "pricePerNight": 250.00
            },
            {
              "id": 2,
              "occupancy": 1,
              "priceLevel": "MEDIUM",
              "pricePerNight": 150.00
            }
          ],
          "_count": {
            "rooms": 2
          }
        }
      ]
    }
  ],
  "_count": {
    "cities": 1,
    "customTours": 0
  }
}
```

## Enhanced Filtering Examples

### 1. Advanced Hotel & Room Search
```bash
# Get countries with luxury hotels and rooms
GET /countries/filter?minRating=4&priceLevels=HIGH&includeHotels=true&includeRooms=true&sortBy=hotelsCount&sortOrder=desc
```

### 2. Price Range Filtering
```bash
# Get countries with mid-range accommodations
GET /countries/filter?minRating=3&maxRating=4&minRoomPrice=80&maxRoomPrice=200&priceLevels=MEDIUM&includeHotels=true&includeRooms=true
```

### 3. Comprehensive Search
```bash
# Search with multiple criteria
GET /countries/filter?search=madrid&hotelName=palace&minRating=4&priceLevels=HIGH,MEDIUM&includeHotels=true&includeRooms=true&includeTransport=true
```

### 4. Occupancy-based Filtering
```bash
# Get countries with rooms for couples
GET /countries/filter?minRoomOccupancy=2&maxRoomOccupancy=2&includeRooms=true
```

## Updated Data Models

### Hotel
```json
{
  "id": 1,
  "name": "Hotel Madrid Palace",
  "rating": 5,
  "email": "info@madridpalace.com",
  "phone": "+34 91 360 8000",
  "cityId": 1
}
```

### Room
```json
{
  "id": 1,
  "occupancy": 2,
  "priceLevel": "HIGH",
  "pricePerNight": 250.00,
  "hotelId": 1
}
```

## Enums

### PriceLevel
- `LOW`: Budget-friendly rooms (typically under $100/night)
- `MEDIUM`: Mid-range rooms (typically $100-250/night)
- `HIGH`: Luxury rooms (typically over $250/night)

## Usage Scenarios

### 1. Travel Planning
```bash
# Find luxury destinations
GET /countries/filter?minRating=5&priceLevels=HIGH&includeHotels=true&includeRooms=true

# Find budget-friendly options
GET /countries/filter?maxRating=3&priceLevels=LOW&maxRoomPrice=100&includeHotels=true&includeRooms=true
```

### 2. Business Travel
```bash
# Find professional accommodations
GET /countries/filter?minRating=4&priceLevels=MEDIUM,HIGH&includeHotels=true&includeRooms=true&sortBy=rating&sortOrder=desc
```

### 3. Group Travel
```bash
# Find accommodations for groups
GET /countries/filter?minRoomOccupancy=2&includeRooms=true&sortBy=roomsCount&sortOrder=desc
```

## Error Handling

### Invalid Price Level
```json
{
  "statusCode": 404,
  "message": "Invalid price level: INVALID_LEVEL",
  "error": "Not Found"
}
```

### Invalid Rating Range
```json
{
  "statusCode": 400,
  "message": "Hotel rating must be between 1 and 5",
  "error": "Bad Request"
}
```

## Performance Notes

- Hotel and room filtering with complex criteria may take longer to execute
- When sorting by `hotelsCount` or `roomsCount`, the system performs post-processing which may affect response time
- For optimal performance, limit the number of include options when not needed
- Use pagination with `limit` and `offset` for large result sets

## Migration Notes

If you're upgrading from the previous version:

1. **New Parameters**: `hotelName`, `hotelId`, `minRating`, `maxRating`, `priceLevels`, `roomId`, `minRoomPrice`, `maxRoomPrice`, `minRoomOccupancy`, `maxRoomOccupancy`
2. **New Include Options**: `includeHotels`, `includeRooms`
3. **New Sort Options**: `hotelsCount`, `roomsCount`
4. **New Endpoints**: Hotel rating, room price level, room price range, and country rooms endpoints
5. **Updated Search**: The `search` parameter now also searches hotel names

All existing functionality remains backward compatible.
