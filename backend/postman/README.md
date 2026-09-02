# TaskFlow Postman Collection

This folder contains the Postman collection and environment required to test the TaskFlow backend APIs.

## Files

- **TaskFlow API.postman_collection.json** — Complete API collection
- **TaskFlow Environment.example.json** — Example environment with placeholder variables

## Import Instructions

1. Open Postman.
2. Import `TaskFlow API.postman_collection.json`.
3. Import `TaskFlow Environment.example.json`.
4. Create your own local environment by filling in the placeholder values.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `server` | Backend URL (`http://localhost:8000/api/v1`) |
| `username` | Test username |
| `fullName` | Test user's full name |
| `email` | Test email |
| `password` | Test password |
| `taskId` | Task ID used for update, delete, move and reorder requests |

## API Groups

### User

- Register (Avatar Upload)
- Login
- Logout
- Current User

### Tasks

- Create Task
- Get Board
- Update Task
- Delete Task
- Reorder Task
- Move Task
- Get Statistics

## Notes

- The Register endpoint requires a **File** field named `avatar`.
- `taskId` should be updated after creating a task.
- Authentication uses JWT stored in HTTP-only cookies.