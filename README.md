# 📘 Expander360 Task – Project Guide

Welcome to the **Expander360 Task Project**!
This README will help you **set up, understand, and test** the project — even if you don’t have much technical experience.

---

## 🚀 1. Setup Instructions

1. **Install Node.js & npm**
   Download from [Node.js official site](https://nodejs.org/).
   Verify it works:

   ```bash
   node -v
   npm -v
   ```

2. **Clone the Project**

   ```bash
   git clone <project-repo-link>
   cd project-folder
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Configure Environment Variables**
   - A ready `.env` file is already provided.
   - Example:

     ```env
     # MySQL
     MYSQL_HOST="localhost"
     MYSQL_PORT="3306"
     MYSQL_USER="root"
     MYSQL_PASSWORD="Wargreymon_99"
     MYSQL_DB="expansion_db"

     # MongoDB
     MONGO_URI="mongodb://localhost:27017/expansion_docs"

     # JWT
     JWT_SECRET="supersecretkey"
     JWT_EXPIRES_IN="1h"

     # RoleKey
     ADMIN_KEY="1001110010"

     # AdminSeed
     ADMIN_EMAIL="admin@seed.com"
     ADMIN_PASSWORD="seed626"
     ADMIN_COMPANY="AdminSeed"

     # SMTP (Ethereal test account)
     SMTP_HOST=smtp.ethereal.email
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=hallie76@ethereal.email
     SMTP_PASS=JwuSbyDjxxDkmHZgwP
     MAIL_FROM=hallie76@ethereal.email
     ```

     ⚠️ **Important:** These Ethereal credentials are for **testing only**.
     You can log into [Ethereal](https://ethereal.email) with them to see sent emails.

5. **Start the Server**

   ```bash
   npm run start:dev
   ```

   The API will now be available at:

   ```
   http://localhost:3000
   ```

---

## 🗂️ 2. Database Schema (Simplified)

```
┌─────────────┐        ┌──────────────┐        ┌───────────────┐
│  Clients    │        │   Projects   │        │   Vendors      │
├─────────────┤        ├──────────────┤        ├───────────────┤
│ id (PK)     │   1 ──▶│ clientId (FK)│        │ id (PK)       │
│ company_name│        │ id (UUID PK) │        │ name          │
│ email       │        │ country      │        │ services_off. │
│ password    │        │ services_need│        │ countries_sup.│
│ role        │        │ budget       │        │ rating        │
└─────────────┘        └──────────────┘        └───────────────┘
                                 │ 1
                                 ▼
                          ┌───────────────┐
                          │   Matches     │
                          ├───────────────┤
                          │ id (PK)       │
                          │ projectId (FK)│
                          │ vendorId (FK) │
                          │ score         │
                          └───────────────┘

MongoDB (unstructured):
┌──────────────┐
│  Documents   │
├──────────────┤
│ _id (ObjectId│
│ projectId    │ → relates to Project UUID
│ title        │
│ content      │
│ tags[]       │
│ createdAt    │
│ updatedAt    │
└──────────────┘
```

---

## 🔌 3. API List

### 👤 Auth

- `POST /auth/register` → Register a client
- `POST /auth/login` → Login and get JWT token

### 📁 Projects

- `GET /projects` → List projects
- `GET /projects/:id` → Get project by ID
- `POST /projects` → Create project
- `PATCH /projects/:id` → Update project
- `DELETE /projects/:id` → Delete project (admin only)

### 🏢 Vendors

- `GET /vendors` → List vendors
- `GET /vendors/:id` → Get vendor by ID
- `POST /vendors` → Create vendor (admin only)
- `PATCH /vendors/:id` → Update vendor (admin only)
- `DELETE /vendors/:id` → Delete vendor (admin only)

### 🤝 Matches

- `POST /projects/:id/rebuild-matches` → Recalculate matches (emails client)
- `GET /matches/:id` → Get match by ID

### 📂 Documents (MongoDB)

- `POST /documents` → Upload a document (admin only)
- `GET /documents` → Public search endpoint (by query or tags)
  - e.g. `/documents?query=research&tags=finance,legal`

- `GET /documents/project/:projectId` → List all documents linked to a project

---

## 📄 4. Documents Schema (MongoDB)

```ts
@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  projectId: string; // UUID from Projects table

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop([String])
  tags: string[];

  // createdAt & updatedAt are auto-added
}
```

- Stored in the `expansion_docs` MongoDB database.
- Linked to projects by their **UUID projectId**.
- Flexible: can hold reports, notes, or research documents.

---

## 📊 5. Matching Formula

Vendors are matched to projects using this scoring:

```
Score = (Service Overlap × 2.0)
      + (Vendor Rating × 1.0)
      + (SLA Bonus)
```

- **Service Overlap**: More overlap = higher score.
- **Country Match**: Vendor must support the project’s country.
- **Rating**: Higher vendor ratings increase score.
- **SLA Bonus**:
  - < 24h = +3 points
  - 24–72h = +1 point

Matches are stored with details (`servicesOverlap`, `ratingBonus`, `slaBonus`, `reasonForScore`).

---

## ✅ 6. Quick Testing

### 1. Register/Login

(same as before — get a token)

### 2. Create Vendor (admin)

(same as before)

### 3. Create Project (client)

(same as before)

### 4. Upload Document (admin only)

```bash
curl -X POST http://localhost:3000/documents \
-H "Authorization: Bearer <ADMIN_TOKEN>" \
-H "Content-Type: application/json" \
-d '{
  "projectId": "PROJECT_UUID",
  "title": "Market Research Report",
  "content": "This is a test document about market entry strategy.",
  "tags": ["research", "market", "strategy"]
}'
```

### 5. Search Documents (public)

```bash
curl "http://localhost:3000/documents?query=market&tags=research"
```

### 6. List Documents by Project (public)

```bash
curl http://localhost:3000/documents/project/PROJECT_UUID
```

✅ You’ll see results come from MongoDB.

---

## ✉️ 7. Notifications (Nodemailer)

- Emails are sent automatically when **new vendor matches** are found for a project.
- You can test emails using the provided **Ethereal account**:
  - Log in at [https://ethereal.email/login](https://ethereal.email/login)
  - Username: `hallie76@ethereal.email`
  - Password: `JwuSbyDjxxDkmHZgwP`
  - You’ll see all test emails there.

---

## 🎯 Final Notes

- **Clients** → manage their own projects
- **Admins** → manage vendors & documents
- **MongoDB** → stores unstructured project documents
- **Ethereal Email** → receives all test notifications
