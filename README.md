# RiceDash 🍚

**Food delivery for Rice University students, by students.**

RiceDash is a comprehensive food delivery platform designed specifically for Rice University students. It connects hungry students with their favorite meals from all 5 Rice serveries, delivered by fellow students who can earn money while helping their peers.

## 🚀 Features

### For Students (Customers)
- **Multi-Servery Ordering**: Order from all 5 Rice serveries (Baker, North, Seibel, South, West)
- **Real-time Order Tracking**: Track your order from placement to delivery
- **Interactive Maps**: Google Maps integration for location selection and delivery tracking
- **Secure Authentication**: Multiple login options (Google, GitHub, Email/Password)
- **Order History**: View past orders and delivery ratings
- **Responsive Design**: Optimized for both desktop and mobile devices

### For Dashers (Delivery Drivers)
- **Order Management Dashboard**: View and accept available delivery orders
- **Real-time Order Updates**: See new orders as they come in
- **Driver Status Control**: Toggle online/offline availability
- **Distance & Time Calculations**: Google Maps integration for route optimization
- **Earnings Tracking**: Monitor delivery performance and ratings

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.2.2** - React framework with App Router
- **React 18.2.0** - UI library with hooks and modern patterns
- **TypeScript 5.6.3** - Type-safe JavaScript development
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **shadcn/ui** - Modern, accessible component library
- **Framer Motion 11.3.19** - Animation library for smooth transitions
- **Lucide React** - Beautiful, customizable icons

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Drizzle ORM 0.34.1** - Type-safe database toolkit
- **PostgreSQL** - Primary database (via Vercel Postgres)
- **bcrypt-ts** - Password hashing and security
- **Zod** - Runtime type validation

### Authentication & Security
- **NextAuth.js 5.0.0-beta.25** - Authentication framework
- **OAuth Providers**: Google, GitHub integration
- **Credentials Provider** - Email/password authentication
- **Session Management** - Secure session handling

### Maps & Location Services
- **Google Maps JavaScript API** - Interactive maps and geolocation
- **Google Maps Distance Matrix API** - Route calculation and distance estimation
- **Geolocation API** - Browser-based location services

### Development & Build Tools
- **Biome** - Fast linter and formatter (replaces ESLint/Prettier)
- **Playwright** - End-to-end testing framework
- **pnpm** - Fast, disk space efficient package manager
- **Drizzle Kit** - Database migrations and schema management

### UI/UX Libraries
- **Radix UI** - Unstyled, accessible UI primitives
- **Class Variance Authority** - Component variant management
- **next-themes** - Dark/light mode support
- **Sonner** - Toast notifications
- **SWR** - Data fetching and caching

### Additional Features
- **Vercel Analytics** - Performance monitoring
- **Vercel Blob** - File storage (if needed)
- **Nodemailer** - Email functionality
- **Date-fns** - Date manipulation utilities

## 🏗️ Architecture

### Project Structure
```
RiceDash/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (home)/            # Home page
│   ├── api/               # API endpoints
│   ├── dasher/            # Dasher dashboard
│   ├── order/             # Order placement
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── auth-form.tsx     # Authentication forms
│   ├── google-map.tsx    # Maps integration
│   └── navbar.tsx        # Navigation
├── lib/                  # Utility libraries
│   ├── db/              # Database configuration
│   │   ├── schema.ts    # Drizzle schema
│   │   ├── queries.ts   # Database queries
│   │   └── migrations/  # Database migrations
│   └── utils.ts         # Helper functions
└── hooks/               # Custom React hooks
```

### Database Schema
- **Users Table**: Student and dasher information
- **Orders Table**: Order tracking and delivery management
- **Relations**: Proper foreign key relationships between users and orders
- **Enums**: Type-safe status fields (order status, payment status, driver status)

### API Endpoints
- `POST /api/orders` - Create new orders
- `GET /api/orders` - Retrieve user orders
- `GET /api/dasher/orders` - Get available orders for dashers
- `POST /api/distance` - Calculate delivery distances and times

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm package manager
- PostgreSQL database
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RiceDash
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   POSTGRES_URL=your_postgres_connection_string
   
   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # OAuth Providers
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   
   # Google Maps
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Database Setup**
   ```bash
   # Generate database migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # (Optional) Open Drizzle Studio
   pnpm db:studio
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`.

## 📱 Usage

### For Students
1. **Sign Up/Login** using your Rice email or OAuth providers
2. **Browse Menu** from any of the 5 Rice serveries
3. **Add Items** to your cart and specify delivery location
4. **Place Order** and track real-time delivery status
5. **Rate Delivery** after receiving your order

### For Dashers
1. **Register** as a delivery driver
2. **Go Online** to start receiving delivery requests
3. **Accept Orders** from the dasher dashboard
4. **Navigate** using integrated Google Maps
5. **Complete Delivery** and earn money

## 🧪 Testing

```bash
# Run Playwright tests
pnpm test

# Run with specific browser
pnpm exec playwright test --project=chromium
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🔧 Development Scripts

```bash
# Development
pnpm dev              # Start development server with Turbo
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run linting and formatting
pnpm lint:fix         # Fix linting issues
pnpm format           # Format code with Biome

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:push          # Push schema changes
pnpm db:pull          # Pull schema from database

# Testing
pnpm test             # Run Playwright tests
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient (`from-blue-600 to-blue-800`)
- **Secondary**: Orange accent (`orange-500`)
- **Background**: Warm neutral (`#F8F4ED`)
- **Text**: Slate grays for hierarchy

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Responsive**: Mobile-first design approach
- **Accessibility**: WCAG 2.1 AA compliant

### Components
- **shadcn/ui** components for consistency
- **Radix UI** primitives for accessibility
- **Custom components** for Rice-specific features

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Secure NextAuth.js sessions
- **CSRF Protection**: Built-in Next.js protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Drizzle ORM parameterized queries
- **Environment Variables**: Secure configuration management

## 📊 Performance Optimizations

- **Next.js 15**: Latest performance improvements
- **Turbo Mode**: Faster development builds
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **SWR Caching**: Efficient data fetching
- **Google Maps**: Lazy loading and caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ricedash.com or create an issue in the GitHub repository.

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Payment integration (Stripe)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Integration with Rice dining services

---

**Built with ❤️ for Rice University students**
