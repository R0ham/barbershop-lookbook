# Barbershop Lookbook

Built with the Windsurf IDE using these models: GPT-5, Sonnet 4, SWE-1.
This is a fully agentic AI implementation, with me (the human) supplying only creative vision and occassional debugging.

## Mission Statement

A modern web application built on React, Tailwind CSS, and Node.js to help users discover and explore hairstyles to find their perfect look.

## Features

- **Extensive Gallery**: Browse hundreds of hairstyle images with detailed information
- **Smart Filtering**: Filter by category, length, texture, and face shape
- **Search Functionality**: Search hairstyles by name, description, or tags
- **Detailed View**: Click on any hairstyle for a detailed modal with full information
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Database Storage**: Local dev uses SQLite; production uses Neon (Postgres)

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Responsive grid layout
- Modern UI components

### Backend
- Node.js with Express
- PostgreSQL (local development and production)
    - Production uses Netlify Functions for deployment and Neon Postgres for the database
- RESTful API endpoints
- Image upload support with Multer

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL (v12 or higher) - [Installation Guide](https://www.postgresql.org/download/)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hairstyles-gallery
```

2. Set up PostgreSQL:
   - Install PostgreSQL if you haven't already
   - Create a new database:
     ```sql
     CREATE DATABASE hairstyles;
     ```
   - Create a user with access to the database (or use your existing superuser):
     ```sql
     CREATE USER your_username WITH PASSWORD 'your_password';
     GRANT ALL PRIVILEGES ON DATABASE hairstyles TO your_username;
     ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in the backend directory:
     ```bash
     cd backend
     cp .env.example .env
     ```
   - Update the `.env` file with your PostgreSQL connection details:
     ```
     DATABASE_URL=postgresql://your_username:your_password@localhost:5432/hairstyles
     PORT=5001
     NODE_ENV=development
     ```

4. Install backend dependencies:
```bash
cd backend
npm install
```

5. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. **Set up the frontend environment**
   Create `frontend/.env` to point the frontend to your local backend:
   ```ini
   REACT_APP_API_BASE_URL=http://localhost:5001
   ```

2. **Initialize the database**
   Run the migration to set up the database schema:
   ```bash
   cd backend
   npm run migrate:to-pg
   ```

3. **Start the backend server**
   ```bash
   npm run dev:pg
   ```
   The backend will run on http://localhost:5001

4. **Start the frontend development server** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```
   The frontend will run on http://localhost:3000

### Development Scripts

- `npm run dev:pg` - Start the backend with PostgreSQL
- `npm run migrate:to-pg` - Run database migrations
- `npm run backfill:unsplash` - Backfill Unsplash artist information

## API Endpoints

### Hairstyles
- `GET /api/hairstyles` - Get all hairstyles with optional filters
- `GET /api/hairstyles/:id` - Get specific hairstyle by ID
- `GET /api/filters` - Get available filter options
- `POST /api/hairstyles` - Add new hairstyle (with image upload)
- `GET /api/images/:id` - Serve image data from database

### Users
- `GET /api/users/:id` - Get or create a user by ID (emoji string)
  - Returns: `{ id: string, created_at: string, last_active: string }`

### Favorites
- `GET /api/favorites/:userId` - Get all favorites for a user
  - Returns: `{ favorites: Hairstyle[] }`
  
- `POST /api/favorites/:userId/:hairstyleId` - Add a hairstyle to user's favorites
  - Returns: `{ success: boolean, added: boolean }`
  
- `DELETE /api/favorites/:userId/:hairstyleId` - Remove a hairstyle from user's favorites
  - Returns: `{ success: boolean, removed: boolean }`
  
- `GET /api/favorites/:userId/:hairstyleId` - Check if a hairstyle is favorited
  - Returns: `{ isFavorite: boolean }`

## Database Schema

The SQLite database includes:
- Hairstyle metadata (name, category, length, texture, face shapes)
- Image URLs and binary data storage
- Tags and descriptions
- Timestamps for creation and updates

## Production Deployment

- Hosting: Netlify (static frontend) + Netlify Functions for API.
- Database: Neon (Postgres).

Configure environment variables in Netlify Site settings:

```
DATABASE_URL=<your Neon connection string>
# Example: postgres://user:password@ep-xxxx.us-east-2.aws.neon.tech/db?sslmode=require
```

Routing and build settings are defined in the root `netlify.toml`:
- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `build`
- Functions directory: `netlify/functions` (relative to base)
- Redirect `/api/*` → `/.netlify/functions/api/:splat`

The frontend uses same-origin `/api/*` in production. Do not set `REACT_APP_API_BASE_URL` in Netlify unless you intend to call an external API origin.

### Production data (Neon/Postgres)
- The production API runs in `netlify/functions/api.js` and connects to Neon using the `DATABASE_URL` environment variable.
- On first invocation of a new function instance, `init()` will:
  - Create the `hairstyles` table if it does not exist.
  - Seed a small set of sample rows only if the table is empty.
- Endpoints implemented in the function:
  - `GET /api/filters`, `GET /api/hairstyles`, `GET /api/hairstyles/:id` and `PUT /api/hairstyles/:id/ethnicity`.
  - Note: a create endpoint is not exposed in the Netlify function (creation is available only in local dev via PostgreSQL `POST /api/hairstyles`).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

