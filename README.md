"# product-catalog-web-app"

# Product Catalog Web Application

## Technologies Used

### Frontend

- React (Vite)
- TypeScript
- Tailwind CSS
- Axios
- Tanstack Query
- Sonner (Toast notifications)

### Backend

- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- CORS

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm (v9 or higher)



### Installation

1. Clone the repository cd product-catalog-web-app
2. Install dependencies:
   ```bash
   npm install '(to install both frontend and backend dependencies)'
   ```

### Database Setup

1. Create a PostgreSQL database
2. Update the `.env` file in the backend directory with your database credentials (view env.example for reference). The website uses [Neon tech](https://neon.tech) for the database connection.
3. Run database migrations:
   ```bash
   'root folder'
   npm run generate
   npm run migrate
   ```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**

```bash
DATABASE_URL=http://localhost:5000
```

**Backend (.env)**

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
```

## Running the Application

- **Backend**: http://localhost:5000  
- **Frontend**: http://localhost:5173

1. Start both frontend and backend servers:

   ```bash
   npm run start

   ```

2. Alternatively, you can run them separately:
   - Frontend:
     ```bash
     npm run client
     ```
   - Backend:
     ```bash
     npm run server
     ```
