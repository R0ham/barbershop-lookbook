# Hair Style Gallery

A modern web application built with React, Tailwind CSS, and Node.js to help users discover and explore hundreds of hairstyles to find their perfect look.

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
- SQLite (local development)
- Netlify Functions + Neon Postgres (production)
- RESTful API endpoints
- Image upload support with Multer

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hairstyles-gallery
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

#### Local development (.env required)
Create `frontend/.env` to point the frontend to your local backend:

```ini
REACT_APP_API_BASE_URL=http://localhost:5001
```

Then run the servers:

1. Start the backend server:
```bash
cd backend
npm run dev
```
The backend will run on http://localhost:5001

2. Start the frontend development server:
```bash
cd frontend
npm start
```
The frontend will run on http://localhost:3000

Notes:
- Local DB persistence is via `backend/hairstyles.db` (SQLite).
- If you omit `REACT_APP_API_BASE_URL` in local dev, the frontend will attempt to call same-origin `/api/*` (Netlify Functions), which is intended for production.

## API Endpoints

- `GET /api/hairstyles` - Get all hairstyles with optional filters
- `GET /api/hairstyles/:id` - Get specific hairstyle by ID
- `GET /api/filters` - Get available filter options
- `POST /api/hairstyles` - Add new hairstyle (with image upload)
- `GET /api/images/:id` - Serve image data from database

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

