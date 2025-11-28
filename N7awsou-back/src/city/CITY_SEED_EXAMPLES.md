# City Seed Data Examples

## Sample JSON Data for Testing

### Creating Countries First (Dependencies)
```json
[
  {
    "name": "France"
  },
  {
    "name": "Italy"
  },
  {
    "name": "Spain"
  },
  {
    "name": "Germany"
  },
  {
    "name": "United Kingdom"
  }
]
```

### Creating Cities (After Countries Exist)
```json
[
  {
    "name": "Paris",
    "countryId": 1
  },
  {
    "name": "Lyon",
    "countryId": 1
  },
  {
    "name": "Marseille",
    "countryId": 1
  },
  {
    "name": "Rome",
    "countryId": 2
  },
  {
    "name": "Milan",
    "countryId": 2
  },
  {
    "name": "Florence",
    "countryId": 2
  },
  {
    "name": "Madrid",
    "countryId": 3
  },
  {
    "name": "Barcelona",
    "countryId": 3
  },
  {
    "name": "Seville",
    "countryId": 3
  },
  {
    "name": "Berlin",
    "countryId": 4
  },
  {
    "name": "Munich",
    "countryId": 4
  },
  {
    "name": "Hamburg",
    "countryId": 4
  },
  {
    "name": "London",
    "countryId": 5
  },
  {
    "name": "Manchester",
    "countryId": 5
  },
  {
    "name": "Edinburgh",
    "countryId": 5
  }
]
```

### Sample Hotels (After Cities Exist)
```json
[
  {
    "name": "Hotel Ritz Paris",
    "rating": 5,
    "email": "info@ritzparis.com",
    "phone": "+33-1-4316-3000",
    "cityId": 1
  },
  {
    "name": "Hotel George V",
    "rating": 5,
    "email": "info@georgev.com",
    "phone": "+33-1-4952-7000",
    "cityId": 1
  },
  {
    "name": "Hotel Excelsior Rome",
    "rating": 5,
    "email": "info@excelsiorrome.com",
    "phone": "+39-06-4708-1",
    "cityId": 4
  },
  {
    "name": "Hotel Arts Barcelona",
    "rating": 5,
    "email": "info@hotelartsbarcelona.com",
    "phone": "+34-93-221-1000",
    "cityId": 8
  },
  {
    "name": "The Savoy London",
    "rating": 5,
    "email": "info@thesavoylondon.com",
    "phone": "+44-20-7836-4343",
    "cityId": 13
  }
]
```

## Prisma Seed Script Example

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCities() {
  console.log('🌍 Seeding cities...');

  // First, create countries
  const countries = await Promise.all([
    prisma.country.upsert({
      where: { name: 'France' },
      update: {},
      create: { name: 'France' },
    }),
    prisma.country.upsert({
      where: { name: 'Italy' },
      update: {},
      create: { name: 'Italy' },
    }),
    prisma.country.upsert({
      where: { name: 'Spain' },
      update: {},
      create: { name: 'Spain' },
    }),
    prisma.country.upsert({
      where: { name: 'Germany' },
      update: {},
      create: { name: 'Germany' },
    }),
    prisma.country.upsert({
      where: { name: 'United Kingdom' },
      update: {},
      create: { name: 'United Kingdom' },
    }),
  ]);

  console.log('✅ Countries created:', countries.map(c => c.name));

  // Then create cities
  const cities = await Promise.all([
    // France
    prisma.city.upsert({
      where: { name_countryId: { name: 'Paris', countryId: countries[0].id } },
      update: {},
      create: { name: 'Paris', countryId: countries[0].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Lyon', countryId: countries[0].id } },
      update: {},
      create: { name: 'Lyon', countryId: countries[0].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Marseille', countryId: countries[0].id } },
      update: {},
      create: { name: 'Marseille', countryId: countries[0].id },
    }),
    
    // Italy
    prisma.city.upsert({
      where: { name_countryId: { name: 'Rome', countryId: countries[1].id } },
      update: {},
      create: { name: 'Rome', countryId: countries[1].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Milan', countryId: countries[1].id } },
      update: {},
      create: { name: 'Milan', countryId: countries[1].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Florence', countryId: countries[1].id } },
      update: {},
      create: { name: 'Florence', countryId: countries[1].id },
    }),
    
    // Spain
    prisma.city.upsert({
      where: { name_countryId: { name: 'Madrid', countryId: countries[2].id } },
      update: {},
      create: { name: 'Madrid', countryId: countries[2].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Barcelona', countryId: countries[2].id } },
      update: {},
      create: { name: 'Barcelona', countryId: countries[2].id },
    }),
    
    // Germany
    prisma.city.upsert({
      where: { name_countryId: { name: 'Berlin', countryId: countries[3].id } },
      update: {},
      create: { name: 'Berlin', countryId: countries[3].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Munich', countryId: countries[3].id } },
      update: {},
      create: { name: 'Munich', countryId: countries[3].id },
    }),
    
    // United Kingdom
    prisma.city.upsert({
      where: { name_countryId: { name: 'London', countryId: countries[4].id } },
      update: {},
      create: { name: 'London', countryId: countries[4].id },
    }),
    prisma.city.upsert({
      where: { name_countryId: { name: 'Edinburgh', countryId: countries[4].id } },
      update: {},
      create: { name: 'Edinburgh', countryId: countries[4].id },
    }),
  ]);

  console.log('🏙️ Cities created:', cities.map(c => `${c.name} (${countries.find(country => country.id === c.countryId)?.name})`));

  return { countries, cities };
}

async function main() {
  try {
    await seedCities();
    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

## Testing the City API

### 1. Create a new city
```bash
curl -X POST http://localhost:3000/cities \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Nice",
    "countryId": 1
  }'
```

### 2. Get all cities
```bash
curl http://localhost:3000/cities
```

### 3. Get cities by country
```bash
curl http://localhost:3000/cities/by-country/1
```

### 4. Search cities
```bash
curl "http://localhost:3000/cities/search?name=par"
```

### 5. Get city statistics
```bash
curl http://localhost:3000/cities/statistics
```

### 6. Get city with details
```bash
curl http://localhost:3000/cities/1
```

### 7. Filter cities
```bash
curl "http://localhost:3000/cities?countryId=1&sortBy=hotelCount&sortOrder=desc"
```

### 8. Update city
```bash
curl -X PATCH http://localhost:3000/cities/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-jwt-token" \
  -d '{
    "name": "Paris Updated"
  }'
```

### 9. Delete city
```bash
curl -X DELETE http://localhost:3000/cities/1 \
  -H "Authorization: Bearer your-jwt-token"
```
