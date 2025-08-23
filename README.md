# Hair Style Gallery

A modern web application built with React, Tailwind CSS, and Node.js to help users discover and explore hundreds of hairstyles to find their perfect look.

## Features

- **Extensive Gallery**: Browse hundreds of hairstyle images with detailed information
- **Smart Filtering**: Filter by category, length, texture, and face shape
- **Search Functionality**: Search hairstyles by name, description, or tags
- **Detailed View**: Click on any hairstyle for a detailed modal with full information
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Database Storage**: All images and metadata stored in SQLite database

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Responsive grid layout
- Modern UI components

### Backend
- Node.js with Express
- SQLite database for data storage
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
