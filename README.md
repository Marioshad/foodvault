# Food Inventory Management System

A comprehensive web-based food inventory management system that leverages AI and modern web technologies to help users optimize food storage, reduce waste, and manage household groceries efficiently.

## Features

- 📦 Real-time inventory tracking
- 📷 AI-powered receipt scanning and processing
- 📊 Advanced analytics and reporting
- 🏷️ Smart expiration date management
- 📱 Responsive design for all devices

## Tech Stack

- React.js frontend with TypeScript
- Node.js backend
- PostgreSQL database
- OpenAI GPT-4 Vision API for receipt processing
- Tailwind CSS for styling
- Authentication with Passport.js
- Deployed on Railway

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- OpenAI API key
- Git installed

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/food-inventory-app.git
cd food-inventory-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/food_inventory
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_random_session_secret
```

4. Start the development server:
```bash
npm run dev
```

## Deploying to Railway

### 1. Initial Setup

1. Create a Railway account at [railway.app](https://railway.app) and connect it with your GitHub account
2. Fork this repository or push your local repository to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/food-inventory-app.git
git push -u origin main
```
3. In Railway, create a new project and select "Deploy from GitHub repo"
4. Select your repository

### 2. Database Setup

1. In your Railway project, click "New Service" and select "Database"
2. Choose "PostgreSQL"
3. Once created, click on your PostgreSQL service
4. Click "Connect" and copy the "Postgres Connection URL"
5. In your main service's "Variables" tab, add:
```
DATABASE_URL=<paste the copied PostgreSQL URL>
```
  Important: Make sure to use the external connection URL from the "Connect" tab, not the internal hostname.

6. The application will automatically:
   - Use SSL in production
   - Handle connection pooling
   - Create necessary database tables on first connection

If you see database connection errors in Railway:
1. Verify you're using the external connection URL from the PostgreSQL service's "Connect" tab
2. Check that the URL is properly formatted: `postgresql://user:pass@hostname:port/dbname`
3. Ensure the DATABASE_URL is correctly set in your main service's Variables tab
4. Look for connection errors in the deployment logs


### 3. Environment Variables

In your Railway project, go to the "Variables" tab and add the following:

- `OPENAI_API_KEY`: Your OpenAI API key
- `SESSION_SECRET`: A random string for session encryption
- `NODE_ENV`: Set to "production"

Important: Make sure `DATABASE_URL` is set and points to your Railway PostgreSQL instance.


The application will use this URL to connect to your database automatically.


### 4. Deployment

1. Railway will automatically detect your Node.js application
2. The deployment will start automatically when you push changes to your GitHub repository
3. Railway will use the scripts defined in `package.json` and `nixpacks.toml` to build and start your application
4. The server listens on '0.0.0.0' (all network interfaces) as required by Railway
5. Once deployed, you can access your application via the URL provided by Railway

### 5. Database Migrations

The application uses Drizzle ORM for database management. Railway will automatically run the database migrations during deployment using the `npm run db:push` command specified in the build script.

## Environment Variables Reference

- `DATABASE_URL`: PostgreSQL connection string
- `OPENAI_API_KEY`: API key for OpenAI services
- `SESSION_SECRET`: Secret key for session management
- `NODE_ENV`: Application environment (development/production)

## Troubleshooting

1. If the deployment fails, check the build logs in Railway
2. Ensure all environment variables are properly set
3. Check if the database connection is working
4. Verify that the OpenAI API key is valid and has proper permissions

### Common Deployment Issues

1. Missing Build Directory:
   If you see an error about missing server/public directory, make sure:
   - Your local build works with `npm run build`
   - The nixpacks.toml file is properly committed to your repository
   - Railway has permissions to create directories during build

2. Database Connection Issues:
   - Verify DATABASE_URL is set in Railway's Variables tab
   - Check that the database is provisioned in Railway
   - Look for database connection errors in the deployment logs

3. Environment Variables:
   - DATABASE_URL (automatically set by Railway)
   - OPENAI_API_KEY (set this manually)
   - SESSION_SECRET (set this manually)
   - NODE_ENV (set to "production" in nixpacks.toml)


## Development Guidelines

1. Always run database migrations when making schema changes
2. Test the receipt scanning feature with various receipt formats
3. Ensure proper error handling for API requests
4. Follow the existing code style and formatting

## License

MIT License - feel free to use this project for personal or commercial purposes.