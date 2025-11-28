# SmartSplit AI Backend - PostgreSQL Migration Complete

This backend has been successfully migrated from MySQL to PostgreSQL (Supabase).

## 🚀 Setup Instructions

### 1. Database Setup

First, run the schema on your PostgreSQL database:

```bash
# Connect to your Supabase PostgreSQL database and run:
psql postgresql://postgres:[YOUR_PASSWORD]@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres -f schema.sql
```

Or copy the contents of `schema.sql` and run it in the Supabase SQL Editor.

### 2. Environment Configuration

Update the `.env` file with your actual credentials:

```env
DATABASE_URL=postgresql://postgres:[YOUR_ACTUAL_PASSWORD]@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=4000
```

**IMPORTANT:** Replace `[YOUR_ACTUAL_PASSWORD]` with your actual Supabase database password.

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Server

```bash
npm start
```

The server will run on `http://localhost:4000`

## 🧪 Testing the APIs

### Run Automated Tests

```bash
npm test
```

This will run all API endpoints and report the results.

### Manual Testing with cURL or Postman

#### 1. Register a User

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "Test123!@#"}'
```

#### 2. Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!@#"}'
```

Save the `token` from the response for authenticated requests.

#### 3. Create a Group (Protected)

```bash
curl -X POST http://localhost:4000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"group_name": "Weekend Trip"}'
```

#### 4. Get All Groups (Protected)

```bash
curl -X GET http://localhost:4000/api/groups \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 5. Add an Expense (Protected)

```bash
curl -X POST http://localhost:4000/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "group_id": 1,
    "payer_id": 1,
    "amount": 100.00,
    "description": "Dinner",
    "split_type": "equal",
    "splits": [
      {"user_id": 1, "amount": 100.00}
    ]
  }'
```

#### 6. Get Group Expenses (Protected)

```bash
curl -X GET http://localhost:4000/api/groups/1/expenses \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 7. Get Balances (Protected)

```bash
curl -X GET http://localhost:4000/api/balances/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 8. Optimize Settlements (Protected)

```bash
curl -X GET http://localhost:4000/api/settlements/optimize/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 9. Get Group Members (Protected)

```bash
curl -X GET http://localhost:4000/api/groups/1/members \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 10. Search Users (Protected)

```bash
curl -X GET "http://localhost:4000/api/users/search?query=test" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### 11. Forgot Password

```bash
curl -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

#### 12. Reset Password

```bash
curl -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token": "RESET_TOKEN_FROM_EMAIL", "newPassword": "NewPassword123!@#"}'
```

## 📋 Available API Endpoints

### Authentication (Unprotected)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Groups (Protected)

- `POST /api/groups` - Create a new group
- `GET /api/groups` - Get all groups for current user
- `GET /api/groups/:group_id/members` - Get all members of a group
- `GET /api/groups/:group_id/expenses` - Get all expenses for a group

### Expenses (Protected)

- `POST /api/expenses` - Add a new expense

### Balances & Settlements (Protected)

- `GET /api/balances/:group_id` - Get balances for all members in a group
- `GET /api/settlements/optimize/:group_id` - Get optimized settlement plan

### Users (Protected)

- `GET /api/users/search?query=...` - Search users by username or email

## 🔄 Migration Changes

### Key Changes from MySQL to PostgreSQL:

1. **Driver**: Changed from `mysql2` to `pg`
2. **Parameterized Queries**: Changed from `?` to `$1, $2, $3...`
3. **Result Structure**: Changed from `[rows, fields]` to `result.rows`
4. **RETURNING Clause**: Used PostgreSQL's `RETURNING` for inserts
5. **Case-Insensitive Search**: Used `ILIKE` instead of `LIKE`
6. **Auto-increment**: Changed from `AUTO_INCREMENT` to `SERIAL`
7. **Transactions**: Implemented proper transaction handling with BEGIN/COMMIT/ROLLBACK

## 🛠️ Database Schema

The database includes the following tables:

- **Users** - User accounts with authentication
- **Groups** - Expense sharing groups
- **GroupMembers** - Many-to-many relationship between users and groups
- **Expenses** - Individual expenses with payer information
- **ExpenseSplits** - How each expense is split among members
- **PasswordResetTokens** - Tokens for password reset functionality

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Parameterized queries to prevent SQL injection
- Token-based password reset
- CORS protection with configurable origins

## 📝 Notes

- The automated test file (`test-api.js`) includes Node's native `fetch` API (requires Node.js 18+)
- All protected endpoints require a valid JWT token in the Authorization header
- Tokens expire after 1 hour by default
- For the password reset feature, configure email settings in `.env` to send actual emails

## 🎯 Next Steps

1. Replace `[YOUR_PASSWORD]` in `.env` with your actual Supabase password
2. Run the database schema on your Supabase instance
3. Start the server and run the tests
4. All APIs should be working correctly!
