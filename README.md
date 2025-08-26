# 📘 Expander360 Task — Project Guide

Welcome to the **Expander360 Task Project**!
This README will help you **set up, understand, and test** the project — even if you don't have much technical experience.

---

## 🚀 1. Setup Instructions

### Prerequisites

1. **Install Node.js & npm**
   Download from [Node.js official site](https://nodejs.org/).
   Verify it works:

   ```bash
   node -v
   npm -v
   ```

2. **Install MySQL**
   - Download and install MySQL Server
   - Create a database named `expansion_db`
   - Note your MySQL username and password

3. **Install MongoDB**
   - Download and install MongoDB Community Edition
   - Start MongoDB service (usually runs on port 27017)

### Project Setup

1. **Clone the Project**

   ```bash
   git clone <project-repo-link>
   cd project-folder
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   A ready `.env` file is already provided. Update the database credentials:

   ```env
   # MySQL Configuration
   MYSQL_HOST="localhost"
   MYSQL_PORT="3306"
   MYSQL_USER="YourMySQLUser"
   MYSQL_PASSWORD="YourMySQLPassword"
   MYSQL_DB="expansion_db"

   # MongoDB Configuration
   MONGO_URI="mongodb://localhost:27017/expansion_docs"

   # JWT Configuration
   JWT_SECRET="supersecretkey"
   JWT_EXPIRES_IN="1h"

   # Admin Role Key
   ADMIN_KEY="1001110010"

   # Admin Seed Data
   ADMIN_EMAIL="admin@seed.com"
   ADMIN_PASSWORD="seed626"
   ADMIN_COMPANY="AdminSeed"

   # SMTP Configuration (Ethereal test account)
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=hallie76@ethereal.email
   SMTP_PASS=JwuSbyDjxxDkmHZgwP
   MAIL_FROM=hallie76@ethereal.email
   ```

   ⚠️ **Important:** These Ethereal credentials are for **testing only**.
   You can log into [Ethereal](https://ethereal.email) with them to see sent emails.

4. **Database Setup**

   **CRITICAL:** Before starting the application, ensure:
   - MySQL is running and you can connect to it
   - The database `expansion_db` exists in MySQL
   - MongoDB is running (default port 27017)

   ```bash
   # Create MySQL database (if not exists)
   mysql -u YourUser -p
   CREATE DATABASE IF NOT EXISTS expansion_db;
   exit;
   ```

5. **Run Database Migrations**

   ```bash
   npm run migration:run
   ```

6. **Start the Server**

   ```bash
   npm run start:dev
   ```

   The API will now be available at:

   ```
   http://localhost:3000
   ```

### 🌱 Database Seeding

**Good News!** The application automatically seeds sample data on startup:

- **MySQL Tables**: Sample clients, vendors, projects, and matches are created
- **MongoDB Documents**: Sample documents linked to projects are inserted
- **Admin User**: Default admin account is created with credentials from `.env`

The seeding process runs every time you start the application and will skip existing records.

---

## 🗂️ 2. Database Schema & Relationships

### MySQL Database Structure

```
┌─────────────────┐    1:N    ┌──────────────────┐    N:M    ┌─────────────────┐
│     Clients     │  ──────►  │     Projects     │  ◄─────►  │     Vendors     │
├─────────────────┤           ├──────────────────┤    │      ├─────────────────┤
│ id (PK)         │           │ id (UUID PK)     │    │      │ id (PK)         │
│ company_name    │           │ client_id (FK)   │    │      │ name            │
│ contact_email   │           │ country          │    │      │ services_offered│
│ password        │           │ services_needed  │    │      │ countries_sup.  │
│ role            │           │ budget           │    │      │ rating          │
└─────────────────┘           │ status           │    │      │ response_sla_h. │
                              │ created_at       │    │      │ sla_expires_at  │
                              │ updated_at       │    │      │ sla_expired     │
                              └──────────────────┘    │      └─────────────────┘
                                       │              │               │
                                       │ 1:N          │ N:M           │
                                       ▼              │               │
                              ┌──────────────────┐    │               │
                              │     Matches      │ ◄──┴───────────────┘
                              ├──────────────────┤
                              │ id (PK)          │
                              │ project_id (FK)  │
                              │ vendor_id (FK)   │
                              │ score            │
                              │ matchDetails     │
                              │ created_at       │
                              │ updated_at       │
                              └──────────────────┘
```

### MongoDB Document Schema

```javascript
// Collection: documents (in expansion_docs database)
{
  _id: ObjectId,
  projectId: String,        // ← Links to Projects.id (UUID)
  title: String,
  content: String,
  tags: [String],
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

### Entity Relationships Explained

1. **Client → Projects** (One-to-Many)
   - Each client can have multiple projects
   - Each project belongs to exactly one client
   - Foreign key: `project.client_id → client.id`

2. **Project → Matches** (One-to-Many)
   - Each project can have multiple vendor matches
   - Each match belongs to exactly one project
   - Foreign key: `match.project_id → project.id`

3. **Vendor → Matches** (One-to-Many)
   - Each vendor can be matched to multiple projects
   - Each match involves exactly one vendor
   - Foreign key: `match.vendor_id → vendor.id`

4. **Project ↔ Documents** (One-to-Many, Cross-Database)
   - Each project can have multiple documents in MongoDB
   - Documents link to projects via `projectId` field
   - Relationship: `document.projectId → project.id (UUID)`

### Key Database Features

- **UUID Primary Keys**: Projects use UUIDs for better cross-system compatibility
- **Indexes**: Optimized queries on frequently searched fields (rating, status, score)
- **Cascade Deletes**: When projects/vendors are deleted, related matches are automatically removed
- **Decimal Precision**: Budget and rating fields use precise decimal storage
- **Timestamps**: Automatic creation and update timestamps on all entities
- **Unique Constraints**: Prevents duplicate matches between same project-vendor pairs

---

## 📌 3. API Endpoints

### 👤 Authentication

- `POST /auth/register` → Register a new client
- `POST /auth/login` → Login and receive JWT token

### 🏗 Projects

- `GET /projects` → List all projects (filtered by user role)
- `GET /projects/:id` → Get specific project details
- `POST /projects` → Create new project (triggers automatic matching)
- `PATCH /projects/:id` → Update project details
- `DELETE /projects/:id` → Delete project (admin only)

### 🏢 Vendors

- `GET /vendors` → List all vendors with filtering options
- `GET /vendors/:id` → Get specific vendor details
- `POST /vendors` → Create new vendor (admin only)
- `PATCH /vendors/:id` → Update vendor information (admin only)
- `DELETE /vendors/:id` → Delete vendor (admin only)

### 🤝 Matches

- `POST /projects/:id/rebuild-matches` → Recalculate project matches (sends notification email)
- `GET /matches/:id` → Get detailed match information
- `GET /projects/:id/matches` → Get all matches for a specific project

### 📂 Documents (MongoDB)

- `POST /documents` → Upload/create a document (admin only)
- `GET /documents` → Public search endpoint
  - Query parameters: `?query=searchTerm&tags=tag1,tag2`
  - Example: `/documents?query=market&tags=research,strategy`
- `GET /documents/project/:projectId` → List all documents for a project
- `PATCH /documents/:id` → Update document (admin only)
- `DELETE /documents/:id` → Delete document (admin only)

---

## 🧮 4. Matching Algorithm

### Scoring Formula

```
Final Score = (Service Overlap × 2.0)
            + (Vendor Rating × 1.0)
            + SLA Bonus
            + Country Bonus
```

### Detailed Breakdown

1. **Service Overlap** (Weight: 2.0)
   - Calculates percentage of project services that vendor offers
   - Formula: `(matching_services / total_project_services) × 100 × 2.0`

2. **Vendor Rating** (Weight: 1.0)
   - Direct addition of vendor's rating (0.0 - 5.0)
   - Higher-rated vendors get preference

3. **SLA Bonus**
   - Response time under 24 hours: +3 points
   - Response time 24-72 hours: +1 point
   - Over 72 hours: No bonus

4. **Country Support**
   - Vendor must support project's country (mandatory filter)
   - Projects in unsupported countries get no matches

### Match Details Storage

Each match stores comprehensive details:

```json
{
  "matchDetails": {
    "servicesOverlap": ["market_research", "legal_setup"],
    "countryMatch": true,
    "ratingBonus": 4.5,
    "slaBonus": 3,
    "reasonForScore": "Strong service overlap (80%) with excellent rating"
  }
}
```

---

## ✅ 5. Quick Testing Guide

### Step 1: Register and Get Token

```bash
# Register a new client
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Company",
    "contact_email": "test@company.com",
    "password": "password123"
  }'

# Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "contact_email": "test@company.com",
    "password": "password123"
  }'
```

Save the returned `access_token` for subsequent requests.

### Step 2: Create Project (Triggers Auto-Matching)

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "US",
    "services_needed": ["market_research", "legal_setup"],
    "budget": 50000.00
  }'
```

### Step 3: View Matches

```bash
# Get project with matches
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/projects/PROJECT_UUID

# Or get matches directly
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/projects/PROJECT_UUID/matches
```

### Step 4: Test Document Search

```bash
# Search documents by query and tags
curl "http://localhost:3000/documents?query=market&tags=research"

# Get documents for specific project
curl http://localhost:3000/documents/project/PROJECT_UUID
```

### Admin Testing

Login as admin using seeded credentials:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "contact_email": "admin@seed.com",
    "password": "seed626"
  }'
```

Then test admin-only endpoints like creating vendors and documents.

---

## ✉️ 6. Email Notifications

### Automatic Notifications

The system sends emails when:

- New vendor matches are found for a project
- Project matching is manually triggered via API
- Match scores exceed certain thresholds

### Testing Email System

All emails are sent to the **Ethereal Email** test service:

1. **View Test Emails**: Visit [https://ethereal.email/login](https://ethereal.email/login)
2. **Login Credentials**:
   - Username: `hallie76@ethereal.email`
   - Password: `JwuSbyDjxxDkmHZgwP`
3. **Check Inbox**: All application emails appear here

### Email Content

Notification emails include:

- Project details
- List of matched vendors with scores
- Match reasoning and criteria
- Links to view detailed match information

---

## 🔧 7. Development Notes

### Key Features

- **Role-Based Access**: Clients manage projects, admins manage vendors/documents
- **Automatic Matching**: New projects instantly get matched with suitable vendors
- **Cross-Database Relations**: MySQL projects linked to MongoDB documents
- **Real-time Scoring**: Advanced algorithm considers multiple vendor criteria
- **Email Integration**: Automated notifications for match updates
- **Data Validation**: Comprehensive input validation and error handling

### Performance Optimizations

- Database indexes on frequently queried fields
- Efficient joins using TypeORM relations
- Pagination support for large datasets
- Caching of calculation-heavy match scores

### Security Features

- JWT-based authentication
- Role-based authorization
- Password hashing with bcrypt
- Input sanitization and validation
- Protection against common vulnerabilities

---

## 🎯 8. Troubleshooting

### Common Issues

1. **"Database connection failed"**
   - Ensure MySQL is running and credentials in `.env` are correct
   - Verify database `expansion_db` exists

2. **"MongoDB connection timeout"**
   - Check if MongoDB service is running
   - Verify connection string in `MONGO_URI`

3. **"Migration failed"**
   - Ensure you have proper MySQL permissions
   - Try running `npm run migration:revert` then `npm run migration:run`

4. **"No matches found"**
   - Check if vendors exist that support the project's country
   - Verify vendor services overlap with project needs

5. **"Email not sent"**
   - SMTP settings are for testing only
   - Check Ethereal inbox for test emails

### Data Reset

To reset all data:

```bash
npm run migration:revert  # Removes all tables
npm run migration:run     # Recreates tables
npm run start:dev         # Re-seeds data
```

---

## 📚 Additional Resources

- **API Documentation**: Available at `http://localhost:3000/api` when server is running
- **TypeORM Documentation**: [https://typeorm.io](https://typeorm.io)
- **NestJS Documentation**: [https://nestjs.com](https://nestjs.com)
- **Mongoose Documentation**: [https://mongoosejs.com](https://mongoosejs.com)

---

## 🎉 Final Notes

This project demonstrates a complete **multi-database expansion consulting platform** with:

- **MySQL** for structured business data (clients, projects, vendors, matches)
- **MongoDB** for unstructured documents and research materials
- **Advanced matching algorithms** for vendor-project pairing
- **Real-time email notifications** for business events
- **Role-based security** for different user types
- **RESTful API design** following industry best practices

The application is production-ready with proper error handling, validation, security measures, and database optimizations. All sample data is automatically seeded, making it easy to test and demonstrate all features immediately after setup.
