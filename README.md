<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Railway-Deployed-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" />
  <img src="https://img.shields.io/badge/bcrypt-Auth-FF6B6B?style=for-the-badge&logo=letsencrypt&logoColor=white" />
</p>

# 🖥️ Campus AR Admin — NAvSU Admin Dashboard

The **Campus AR Admin Dashboard** is the server-side web application for the [NAvSU AR Navigation System](https://github.com/karlcyrus/NAvSU-AugmentedRealityBasedNavigationSystem). It provides a secure admin panel for managing campus office-to-node mappings, and exposes a **REST API** that the Unity mobile app consumes at runtime to dynamically load destination data and authenticate with Niantic's Lightship SDK.

---

## ⚙️ How It Connects to the Unity App

The admin dashboard serves as the **backend bridge** between the admin's management interface and the AR mobile app running on the user's device.

```
┌──────────────┐        REST API         ┌─────────────────────┐
│              │ ◄────────────────────── │                     │
│  Unity App   │   GET /api/offices      │   Next.js Server    │
│  (Android)   │   GET /api/nsdk-token   │   (Railway)         │
│              │ ────────────────────►  │                     │
└──────────────┘                         └────────┬────────────┘
                                                  │
                                         ┌────────▼────────────┐
                                         │                     │
                                         │    MySQL Database    │
                                         │    (campus_ar)       │
                                         │                     │
                                         └────────┬────────────┘
                                                  │
                                         ┌────────▼────────────┐
                                         │   Admin Dashboard   │
                                         │   (Web Browser)     │
                                         │   /login → /dashboard│
                                         └─────────────────────┘
```

### Data Flow

1. **Admin** logs into the dashboard, creates/edits/deletes office records, and assigns each office to a **navigation graph node** (e.g., "Canteen" → `N33`).
2. Admin clicks **"Publish All"** to push pending changes to `live` status.
3. **Unity app** on startup calls `GET /api/offices` to fetch all live office-to-node mappings. This data populates the destination list the user sees.
4. **Unity app** also calls `GET /api/nsdk-token` to securely obtain a short-lived **Niantic Lightship JWT** for WPS (World Positioning System) access — the API key never leaves the server.
5. When a user selects a destination, Unity resolves the `office_id` → `node_id` mapping, then runs **Dijkstra's algorithm** on the local `nav_graph.json` to compute the shortest path.

---

## ✨ Features

- 🔐 **Secure Authentication** — HMAC-SHA256 signed session tokens with bcrypt password hashing and 8-hour TTL.
- 📋 **Office CRUD** — Create, read, update, and soft-delete campus offices with full audit history.
- 🔗 **Node Assignment** — Map each office/building to a navigation graph node ID from the campus waypoint network.
- 🖼️ **Image URLs** — Attach building/office images via URL for display in the mobile app.
- 📊 **Dashboard Stats** — Real-time counters for total offices, live offices, pending changes, and active nodes.
- 🔄 **Publish Workflow** — Changes are marked as `pending` until explicitly published to `live`, preventing accidental updates from reaching the mobile app.
- 📜 **Audit History** — Every edit and delete is logged in `office_mapping_history` with old/new values, timestamps, and the admin who made the change.
- 🔑 **Niantic NSDK Token Proxy** — Securely exchanges the Lightship API key for a short-lived JWT without exposing credentials to the client.
- 🌐 **Public API** — `GET /api/offices` is unauthenticated (read-only) so the Unity app can fetch data without login credentials.
- 🛡️ **Route Protection** — Middleware redirects unauthenticated users from `/dashboard` to `/login`.

---

## 🛠️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Frontend** | React 18 |
| **Database** | MySQL 8.0 (`mysql2/promise` connection pool) |
| **Auth** | HMAC-SHA256 session tokens + bcrypt.js password hashing |
| **Middleware** | Next.js Edge Middleware (cookie-based route protection) |
| **Deployment** | Railway |
| **Niantic Integration** | Lightship Spatial Identity Service (API key → JWT exchange) |

---

## 📁 Project Structure

```
campus-ar-admin/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.js       # POST — authenticate admin, set session cookie
│   │   │   │   └── logout/route.js      # POST — clear session cookie
│   │   │   ├── offices/
│   │   │   │   ├── route.js             # GET (public) — fetch all live offices
│   │   │   │   │                        # POST (auth) — publish all pending → live
│   │   │   │   └── [id]/route.js        # PUT (auth) — update office + log history
│   │   │   │                            # DELETE (auth) — soft-delete office + log history
│   │   │   ├── nodes/route.js           # GET (auth) — list all navigation graph nodes
│   │   │   └── nsdk-token/route.js      # GET (public) — Niantic API key → JWT proxy
│   │   ├── components/
│   │   │   ├── OfficeTable.js           # Sortable office data table
│   │   │   ├── EditModal.js             # Office edit form modal
│   │   │   ├── ConfirmDialog.js         # Confirmation dialog for edits/deletes
│   │   │   └── Toast.js                 # Toast notification component
│   │   ├── dashboard/page.js            # Main dashboard page (stats + CRUD)
│   │   ├── login/page.js                # Login page
│   │   ├── data/offices.js              # Static seed data
│   │   ├── globals.css                  # Global styles
│   │   ├── layout.js                    # Root layout
│   │   └── page.js                      # Root redirect
│   └── lib/
│       ├── auth.js                      # Session token create/verify, cookie helpers
│       └── db.js                        # MySQL connection pool
├── middleware.js                         # Route protection (redirect to /login)
├── .env.local                           # Environment variables (DB creds, secrets)
├── next.config.js
└── package.json
```

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ | Authenticate admin with username + password (bcrypt). Returns session cookie. |
| `POST` | `/api/auth/logout` | ❌ | Clears the session cookie. |
| `GET` | `/api/offices` | ❌ | Returns all active offices with node assignments. **Consumed by Unity app.** |
| `POST` | `/api/offices` | ✅ | Publishes all `pending` offices to `live` status. |
| `PUT` | `/api/offices/[id]` | ✅ | Updates an office's node, name, and image. Marks as `pending`. Logs history. |
| `DELETE` | `/api/offices/[id]` | ✅ | Soft-deletes an office (`is_active = 0`). Logs history. |
| `GET` | `/api/nodes` | ✅ | Lists all navigation graph nodes (`node_id`, `node_type`). Used by edit modal dropdown. |
| `GET` | `/api/nsdk-token` | ❌ | Exchanges Niantic NSDK API key for a short-lived JWT access token. **Consumed by Unity app.** |

### Office API Response Format (consumed by Unity)

```json
{
  "success": true,
  "data": [
    {
      "office_id": "off_021",
      "name": "Canteen",
      "node": "N33",
      "status": "live",
      "node_type": "waypoint",
      "image_url": "https://example.com/canteen.jpg"
    }
  ]
}
```

---

## 🗄️ Database Schema

### `office_mappings`

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-increment primary key |
| `office_id` | VARCHAR | Unique office identifier (e.g., `off_021`) |
| `display_name` | VARCHAR | Human-readable name shown in the app |
| `node_id` | VARCHAR (FK) | References `nodes.node_id` — the navigation graph waypoint |
| `image_url` | VARCHAR | URL to the office/building image |
| `status` | ENUM | `live` or `pending` |
| `is_active` | BOOLEAN | Soft-delete flag (0 = deleted) |
| `updated_at` | DATETIME | Last modification timestamp |
| `updated_by` | INT | Admin ID who last modified |

### `nodes`

| Column | Type | Description |
|---|---|---|
| `node_id` | VARCHAR (PK) | Matches `nav_graph.json` node IDs (e.g., `N33`) |
| `node_type` | VARCHAR | Node classification (e.g., `waypoint`, `entrance`) |

### `admins`

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Auto-increment |
| `username` | VARCHAR | Login username |
| `password_hash` | VARCHAR | bcrypt-hashed password |
| `role` | VARCHAR | Admin role |
| `is_active` | BOOLEAN | Account status |

### `office_mapping_history`

| Column | Type | Description |
|---|---|---|
| `office_id` | VARCHAR | Which office was changed |
| `old_node_id` | VARCHAR | Previous node assignment |
| `new_node_id` | VARCHAR | New node assignment |
| `old_status` | VARCHAR | Status before change |
| `new_status` | VARCHAR | Status after change |
| `changed_by` | INT | Admin ID |
| `change_note` | VARCHAR | Description of the change |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and **npm**
- **MySQL Server 8.0+** (e.g., XAMPP, MySQL Workbench, or standalone)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/karlcyrus/campus-ar-admin.git
   cd campus-ar-admin
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the MySQL database:
   - Create a database named `campus_ar`
   - Import the provided SQL schema file (if available)

4. Configure environment variables in `.env.local`:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=campus_ar

   # Auth
   AUTH_SECRET=your-random-secret-key-here

   # Niantic Lightship (optional — only needed for NSDK token proxy)
   NSDK_API_KEY=your-niantic-api-key
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Authentication Flow

```
Login Page                    Server                         Browser
    │                            │                              │
    ├── POST /api/auth/login ──►│                              │
    │   { username, password }   │                              │
    │                            ├── Query admins table         │
    │                            ├── bcrypt.compare(password)   │
    │                            ├── createSessionToken(admin)  │
    │                            │   (HMAC-SHA256 signed)       │
    │                            ├── Set httpOnly cookie ──────►│
    │◄── { success, admin } ────│                              │
    │                            │                              │
    ├── Redirect to /dashboard   │                              │
    │                            │                              │
 [Middleware checks cookie on every /dashboard request]         │
```

---

## 👥 Authors

- **Karl Cyrus S. Geron**
- **Jhon Rhey G. Valleramos**
- **Antonio Miguel V. Villafiania**

---

## 📄 License

This project was developed as a capstone/thesis requirement. All rights reserved.

---

## 🔗 Related

- **Mobile App (Unity):** [NAvSU-AugmentedRealityBasedNavigationSystem](https://github.com/karlcyrus/NAvSU-AugmentedRealityBasedNavigationSystem)

---

<p align="center">
  <sub>Built with 💙 using Next.js, React, and MySQL</sub>
</p>
