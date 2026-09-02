# TaskFlow Backend

A RESTful backend for **TaskFlow**, a Kanban-style task management application built with **Node.js, Express, MongoDB, JWT Authentication, Multer, and Cloudinary**.

## Features

* JWT Authentication with HTTP-only cookies
* User registration & login
* Avatar upload using Multer + Cloudinary
* Kanban board task management
* Create, update & delete tasks
* Drag-and-drop support (reorder within columns)
* Move tasks across Todo, In Progress & Done
* Dashboard task statistics
* MongoDB indexes & validation
* Postman API collection included

## Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT
* Multer
* Cloudinary
* Cookie Parser

## Project Structure

```text
backend
├── public
│   └── temp
├── postman
│   ├── README.md
│   ├── TaskFlow API.postman_collection.json
│   └── TaskFlow Environment.example.json
├── src
│   ├── config
│   ├── constants
│   ├── controllers
│   ├── db
│   ├── middlewares
│   ├── models
│   ├── routes
│   ├── utils
│   ├── app.js
│   └── constants.js
├── .env.example
├── package.json
└── server.js
```

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd TaskFlow/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the backend folder.

```env
PORT=8000

MONGODB_URI=your_mongodb_connection

ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d

REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=http://localhost:5173
```

### 4. Run the server

```bash
npm run dev
```

Server runs at:

```text
http://localhost:8000
```

## API Endpoints

### Authentication

| Method | Endpoint                     | Description               |
| ------ | ---------------------------- | ------------------------- |
| POST   | `/api/v1/users/register`     | Register user with avatar |
| POST   | `/api/v1/users/login`        | Login                     |
| POST   | `/api/v1/users/logout`       | Logout                    |
| GET    | `/api/v1/users/current-user` | Get logged-in user        |

### Tasks

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/v1/tasks`         | Create task                   |
| GET    | `/api/v1/tasks`         | Get Kanban board              |
| PATCH  | `/api/v1/tasks/:taskId` | Update task                   |
| DELETE | `/api/v1/tasks/:taskId` | Delete task                   |
| PATCH  | `/api/v1/tasks/reorder` | Reorder tasks within a column |
| PATCH  | `/api/v1/tasks/move`    | Move task across columns      |
| GET    | `/api/v1/tasks/stats`   | Dashboard statistics          |

## Authentication

Protected routes require the user to be logged in.

The backend uses:

* JWT Access Token
* JWT Refresh Token
* HTTP-only cookies for secure authentication

## Task Workflow

```text
Todo
  │
  ├── Reorder within Todo
  ▼
In Progress
  │
  ├── Reorder within In Progress
  ▼
Done
```

Each column maintains its own `order` field, allowing drag-and-drop style positioning.

## API Testing

A complete Postman collection is included.

See the `postman/` folder for:

* TaskFlow API Collection
* Example Environment
* Import Instructions

## Author

**Kadambari Yewale**.
