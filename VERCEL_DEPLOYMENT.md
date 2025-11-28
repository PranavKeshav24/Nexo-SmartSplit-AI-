# Vercel Deployment Guide for SmartSplit AI Backend

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure `.gitignore` includes:

```
node_modules/
.env
.env.local
.vercel
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `tassu06/Nexo-SmartSplit-AI-`
4. Configure project:

   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)

5. **Add Environment Variables** (Important!):
   Click "Environment Variables" and add these:

   ```
   DATABASE_URL = postgresql://postgres:tasmiya_test@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres

   JWT_SECRET = your-super-secret-jwt-key-change-this-in-production

   FRONTEND_URL = https://your-frontend-app.vercel.app
   ```

6. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add FRONTEND_URL

# Deploy to production
vercel --prod
```

### 4. After Deployment

Your backend will be available at:

```
https://your-project-name.vercel.app
```

Copy this URL - you'll need it for your frontend!

---

## 🔧 Environment Variables Setup

### In Vercel Dashboard:

Go to: **Project Settings → Environment Variables**

Add these variables for **Production**, **Preview**, and **Development**:

| Variable Name  | Value                                                                                  | Description                |
| -------------- | -------------------------------------------------------------------------------------- | -------------------------- |
| `DATABASE_URL` | `postgresql://postgres:tasmiya_test@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres` | Supabase connection string |
| `JWT_SECRET`   | Generate a secure random string                                                        | For JWT token signing      |
| `FRONTEND_URL` | `https://your-frontend.vercel.app`                                                     | Your frontend URL(s)       |

**Note**: For `FRONTEND_URL`, you can add multiple URLs separated by commas:

```
https://your-app.vercel.app,https://custom-domain.com
```

---

## 🔒 Generate Secure JWT Secret

Run this in terminal to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as your `JWT_SECRET`.

---

## 🌐 Update Frontend Configuration

Once your backend is deployed, update your frontend with the API base URL:

```javascript
// In your frontend config/constants
const API_BASE_URL = "https://your-backend.vercel.app";

// Example API calls
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Important for CORS
  body: JSON.stringify({ email, password }),
});
```

---

## ✅ Verify Deployment

### Test the deployed API:

```bash
# Health check (if you add one)
curl https://your-backend.vercel.app

# Test register endpoint
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## 🔄 CORS Configuration

Your server is already configured to handle CORS properly:

- ✅ Development: `localhost:3000`, `localhost:3001`, `localhost:5173`
- ✅ Production: Any URL in `FRONTEND_URL` environment variable
- ✅ Credentials: Enabled for cookie/auth headers
- ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

### Adding New Frontend URLs

1. Go to Vercel Dashboard
2. Your Project → Settings → Environment Variables
3. Edit `FRONTEND_URL`
4. Add new URL(s): `https://app1.vercel.app,https://app2.vercel.app`
5. Redeploy (or wait for automatic deployment)

---

## 📊 Database Schema Setup

Make sure you've run the schema on your Supabase database:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `schema.sql`
3. Execute the SQL

Or use psql:

```bash
psql postgresql://postgres:tasmiya_test@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres -f schema.sql
```

---

## 🐛 Troubleshooting

### Error: "CORS policy blocked"

- Check `FRONTEND_URL` includes your frontend domain
- Verify frontend is using `credentials: 'include'` in fetch
- Check browser console for exact origin being blocked

### Error: "Database connection failed"

- Verify `DATABASE_URL` is correctly set in Vercel
- Check Supabase database is running
- Verify SSL is enabled on Supabase

### Error: "JWT malformed"

- Ensure `JWT_SECRET` is set in Vercel
- Frontend should send token as: `Authorization: Bearer <token>`

### Deployment fails

- Check Vercel deployment logs
- Ensure `package.json` has all dependencies
- Verify Node.js version compatibility

---

## 📱 API Endpoints Available

After deployment, these endpoints will be available:

### Authentication (Public)

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Groups (Protected)

- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:group_id/members` - Get group members
- `GET /api/groups/:group_id/expenses` - Get group expenses

### Expenses (Protected)

- `POST /api/expenses` - Add expense

### Balances (Protected)

- `GET /api/balances/:group_id` - Get balances
- `GET /api/settlements/optimize/:group_id` - Optimize settlements

### Users (Protected)

- `GET /api/users/search?query=...` - Search users

---

## 🔐 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Add only your actual frontend URL to `FRONTEND_URL`
- [ ] Verify Supabase database has SSL enabled
- [ ] Enable Supabase row-level security (optional)
- [ ] Set up email service for password resets
- [ ] Review and secure all API endpoints
- [ ] Add rate limiting (consider Vercel Edge Config)
- [ ] Set up monitoring and logging

---

## 📈 Next Steps

1. **Deploy Frontend**: Deploy your frontend to Vercel
2. **Update Frontend**: Set backend URL in frontend config
3. **Test Everything**: Run through all user flows
4. **Monitor**: Check Vercel analytics and logs
5. **Custom Domain**: Add custom domain if needed

---

## 🎉 You're Ready!

Your backend is now production-ready and will automatically:

- Scale with traffic
- Handle CORS properly
- Connect to PostgreSQL securely
- Authenticate users with JWT
- Support all API operations

**Remember**: Update `FRONTEND_URL` in Vercel after you deploy your frontend!
