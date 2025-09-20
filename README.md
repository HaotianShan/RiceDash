# RiceDash - Food Delivery for Rice Students

A modern food delivery platform built specifically for Rice University students, featuring real-time Google Maps integration and a comprehensive ordering system.

## Features

### For Students (Ordering)
- 🍽️ **Multi-Servery Support**: Order from all 5 Rice serveries (Baker, North, Seibel, South, West)
- 🕐 **Time-Based Menus**: Automatic menu switching between breakfast and lunch/dinner
- 🛒 **Shopping Cart**: Add multiple items with quantity controls
- 🗺️ **Google Maps Integration**: See your location and nearby serveries
- 💰 **Real-time Pricing**: View item prices and calculate totals
- 📱 **Responsive Design**: Works on desktop and mobile

### For Dashers (Delivery)
- 📍 **Location-Based Orders**: See orders sorted by distance from your location
- 🚚 **Real-time Tracking**: Accept, track, and complete deliveries
- 🗺️ **Interactive Map**: View all orders and delivery locations
- 📊 **Order Management**: Accept/reject orders with one click
- 💵 **Earnings Tracking**: See order values and estimated delivery times

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Maps**: Google Maps JavaScript API
- **Deployment**: Vercel-ready

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
POSTGRES_URL="postgresql://username:password@localhost:5432/ricedash"

# Google Maps API Key (required for map functionality)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key_here"

# NextAuth.js
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
```

### 2. Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended)
6. Add the API key to your `.env.local` file

### 3. Database Setup

1. Install PostgreSQL locally or use a cloud service
2. Create a database named `ricedash`
3. Update the `POSTGRES_URL` in your `.env.local` file
4. Run database migrations:
   ```bash
   pnpm db:migrate
   ```

### 4. Installation & Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (home)/          # Homepage
│   ├── order/           # Ordering page
│   ├── dasher/          # Dasher dashboard
│   └── api/             # API routes
├── components/
│   ├── ui/              # Reusable UI components
│   ├── google-map.tsx   # Google Maps component
│   ├── navbar.tsx       # Navigation bar
│   └── hero.tsx         # Homepage hero section
├── lib/
│   ├── db/              # Database schema and queries
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

## Key Features Implementation

### Google Maps Integration
- Real-time location detection
- Servery markers with custom icons
- User location marker
- Responsive map component with error handling

### Order Management
- Multi-item cart system
- Time-based menu switching
- Real-time price calculation
- Order submission with validation

### Dasher Dashboard
- Location-based order sorting
- Real-time order status updates
- Interactive map with order markers
- Accept/reject order functionality

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: Student and dasher information
- **orders**: Order details with JSON items storage
- **migrations**: Database version control

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue on GitHub or contact the development team.
