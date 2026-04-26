Invest & Track: Portfolio Management System

Live Application: https://final-year-frontend-e5gb.onrender.com/


System Requirements
To run this project locally, the examiner only needs the following:

Database: Any MySQL server (version 8.0 or higher). This can be a local instance (e.g., via XAMPP or MySQL Workbench) or a cloud instance.

Node.js: version 16 or higher.

Internet Connection: Required for the frontend to communicate with the live API and for fetching market data.

Database Setup:

Create Database: Create a new MySQL schema named defaultdb.

Here is the SQL you need to create the database:

-- 1. Create Users Table
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL,
  date_of_birth date DEFAULT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email (email)
);

-- 2. Create Assets Table
CREATE TABLE assets (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  symbol varchar(10) NOT NULL,
  quantity decimal(15,2) NOT NULL,
  purchase_price decimal(15,2) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY user_id (user_id),
  CONSTRAINT assets_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- 3. Create Watchlist Table
CREATE TABLE watchlist (
  id int NOT NULL AUTO_INCREMENT,
  user_id int NOT NULL,
  symbol varchar(10) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_symbol (user_id, symbol),
  CONSTRAINT watchlist_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);



Frontend Environment ConfigurationTo run the React application, you must create a .env file in the react_frontend/ directory. 

Because this project uses Vite, all variables must be prefixed with VITE_ to be accessible within the browser environment.
Create a file named .env and include the following variables (using your own private keys from the respective providers): VITE_FINNHUB_KEY= your_own_key        --    Used for real-time stock searching and data lookups on the frontend.
VITE_ALPHAVANTAGE_KEY= your_own_key   --    Utilised for supplementary market data and global stock identifiers.
VITE_POLYGON_KEY= your_own_key        --    Required to fetch historical price data for the interactive 1W, 1M, and 1Y charts.
 
Backend Environment Configuration
The backend server requires a .env file in the server/node_backend/ directory to manage sensitive credentials and database connection strings. This file is not pushed to version control to prevent security breaches.

Create a file named .env and include the following variables:

PORT            -- The local port on which the Express server runs (default is 5000).
DB_HOST         -- The hostname provided by the Aiven console to access your MySQL instance.
DB_USER         -- Your database username
DB_PASSWORD     -- The secure password required to authenticate with the remote database.
DB_NAME         -- The specific schema name within MySQL (e.g., defaultdb).
JWT_SECRET      -- A private "key" used to sign and verify JSON Web Tokens for user login.
FINNHUB_API_KEY -- The API key used by the backend to fetch real-time market data securely.



Installation & Running Locally
1. Backend Setup

cd server/node_backend
npm install
npm run dev

2. Frontend Setup
Bash
cd react_frontend
npm install
npm run dev

