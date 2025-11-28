# 🚀 Quick Deployment Checklist

## ✅ Ready to Deploy!

Your backend is fully configured and ready for Vercel deployment.

---

## 📋 Pre-Deployment Checklist

- [x] PostgreSQL migration complete
- [x] Database connected (Supabase)
- [x] All tables created
- [x] CORS configured for production
- [x] Environment variables set up
- [x] vercel.json configured
- [x] .gitignore updated

---

## 🎯 Deploy Now (3 Steps)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

Go to [vercel.com](https://vercel.com) and:

1. Click **"Add New Project"**
2. Import: `tassu06/Nexo-SmartSplit-AI-`
3. Add these **Environment Variables**:

```
DATABASE_URL = postgresql://postgres:tasmiya_test@db.xxeyymzcbrncgjzipool.supabase.co:5432/postgres

JWT_SECRET = your-super-secret-jwt-key-change-this-in-production

FRONTEND_URL = https://your-frontend.vercel.app
```

4. Click **Deploy**

### Step 3: Update Frontend

After backend deploys, you'll get a URL like:

```
https://nexo-smartsplit-ai.vercel.app
```

Use this as your API base URL in your frontend:

```javascript
const API_BASE_URL = "https://nexo-smartsplit-ai.vercel.app";
```

Then deploy your frontend and add its URL back to `FRONTEND_URL` in Vercel!

---

## 🔒 Security - Generate JWT Secret

Before deploying, generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and use it as `JWT_SECRET` in Vercel.

---

## 📚 Full Documentation

- **VERCEL_DEPLOYMENT.md** - Complete deployment guide
- **SETUP_GUIDE.md** - API testing and examples
- **MIGRATION_SUMMARY.md** - What changed from MySQL

---

## 🧪 Test Locally First

```bash
# Test connection
npm run test-connection

# Start server
npm start

# Run API tests (in another terminal)
npm test
```

---

## 🌐 CORS Configuration

Your server automatically allows:

- Local development: `localhost:3000`, `localhost:3001`, `localhost:5173`
- Production: Any URL in `FRONTEND_URL` environment variable

To add more frontend URLs, update `FRONTEND_URL`:

```
https://app1.vercel.app,https://app2.vercel.app,https://custom-domain.com
```

---

## 📊 Available API Endpoints

### Public

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Protected (Requires JWT)

- `POST /api/groups` - Create group
- `GET /api/groups` - Get user's groups
- `GET /api/groups/:id/members` - Get group members
- `GET /api/groups/:id/expenses` - Get group expenses
- `POST /api/expenses` - Add expense
- `GET /api/balances/:group_id` - Get balances
- `GET /api/settlements/optimize/:group_id` - Optimize payments
- `GET /api/users/search?query=...` - Search users

---

## 🎉 You're Ready!

Everything is set up and tested. Just deploy to Vercel and you're live!

**Remember**: After deploying frontend, update `FRONTEND_URL` in Vercel with your frontend's URL.
