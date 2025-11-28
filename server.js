//server.js

// server.js

// ---------------------------------------------------------------------
// 0. Setup and Imports
// ---------------------------------------------------------------------
const express = require("express");
const { Pool } = require("pg"); // PostgreSQL driver
const dotenv = require("dotenv");
const bcrypt = require("bcrypt"); // For password hashing
const jwt = require("jsonwebtoken"); // For session tokens
const cors = require("cors"); // For frontend communication
const crypto = require("crypto"); // Node's built-in secure token generator

// Load environment variables from .env file
dotenv.config();

const app = express();

// Use dynamic port from .env or default to 4000
const PORT = process.env.PORT || 4000;
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// CRITICAL FIX: Robust CORS Configuration for production and development
const allowedOrigins = [
  "http://localhost:3000", // Frontend port 1 (Common default)
  "http://localhost:3001", // Frontend port 2 (Vite dynamic port)
  "http://localhost:5173", // Frontend port 3 (Vite traditional default)
];

// Add production frontend URLs from environment variable
if (process.env.FRONTEND_URL) {
  const frontendUrls = process.env.FRONTEND_URL.split(",").map((url) =>
    url.trim()
  );
  allowedOrigins.push(...frontendUrls);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from Origin ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware: Allows Express to read JSON data from the body of requests
app.use(express.json());

// ---------------------------------------------------------------------
// 1. Database Connection Setup
// ---------------------------------------------------------------------
let dbPool;

async function initializeDatabase() {
  try {
    dbPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
    });
    // Test connection
    const client = await dbPool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log(
      "✅ PostgreSQL connection pool created and tested successfully."
    );
  } catch (error) {
    console.error(
      "❌ Failed to create database connection pool:",
      error.message
    );
    process.exit(1);
  }
}

// ---------------------------------------------------------------------
// 2. Authentication Functions (UNPROTECTED ROUTES)
// ---------------------------------------------------------------------

// SIGN UP (Registration) Logic - Using Raw Query Fail-Safe
async function registerUser(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Missing required fields: username, email, and password.",
    });
  }

  let password_hash;

  try {
    // 1. HASHING
    password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // 2. Check for Existing User
    const existingUsersResult = await dbPool.query(
      "SELECT user_id FROM Users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUsersResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "Email or username already exists." });
    }

    // 3. INSERTION: Using parameterized query with RETURNING clause
    const insertResult = await dbPool.query(
      "INSERT INTO Users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id",
      [username, email, password_hash]
    );

    const user_id = insertResult.rows[0].user_id;

    // 4. Success Response
    res.status(201).json({
      message: "User registered successfully.",
      user_id: user_id,
      username: username,
    });
  } catch (error) {
    console.error("CRITICAL FINAL CRASH (Raw Query):", error);
    res.status(500).json({
      message:
        "Server error during registration. Check backend terminal for detailed error.",
    });
  }
}

// LOGIN (Authentication) Logic
async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing email or password." });
  }

  try {
    // A. Fetch User by Email
    const usersResult = await dbPool.query(
      "SELECT user_id, password_hash, username FROM Users WHERE email = $1",
      [email]
    );

    const user = usersResult.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // B. Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // C. Generate JWT Token
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // D. Success Response
    res.status(200).json({
      message: "Login successful.",
      token: token,
      user_id: user.user_id,
      username: user.username,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login." });
  }
}

// Forgot Password Request
async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    // Check if user exists
    const userResult = await dbPool.query(
      "SELECT user_id FROM Users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal whether email exists for security
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const user_id = userResult.rows[0].user_id;

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await dbPool.query(
      "INSERT INTO PasswordResetTokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET token_hash = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP",
      [user_id, tokenHash, expiresAt]
    );

    // Send email (optional - requires email service setup)
    // const { sendResetEmail } = require('./utils/email');
    // await sendResetEmail(email, resetToken);

    res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
      resetToken: resetToken, // REMOVE THIS IN PRODUCTION - only for testing
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Server error during password reset request." });
  }
}

// Reset Password Finalization
async function resetPassword(req, res) {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "Token and new password are required." });
  }

  try {
    // Hash the token to match stored hash
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Find valid token
    const tokenResult = await dbPool.query(
      "SELECT user_id FROM PasswordResetTokens WHERE token_hash = $1 AND expires_at > NOW()",
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });
    }

    const user_id = tokenResult.rows[0].user_id;

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password
    await dbPool.query(
      "UPDATE Users SET password_hash = $1 WHERE user_id = $2",
      [password_hash, user_id]
    );

    // Delete used token
    await dbPool.query("DELETE FROM PasswordResetTokens WHERE user_id = $1", [
      user_id,
    ]);

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error during password reset." });
  }
}

// ---------------------------------------------------------------------
// 3. JWT Authentication Middleware
// ---------------------------------------------------------------------

/**
 * Middleware to verify the JWT from the Authorization header.
 * Attaches the user_id and username to the request object (req.user).
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res
      .status(401)
      .json({ message: "Access Denied: No authentication token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ message: "Access Denied: Invalid or expired token." });
    }

    req.user = user;
    next();
  });
}

// ---------------------------------------------------------------------
// 4. ROUTER DEFINITIONS
// ---------------------------------------------------------------------

// UNPROTECTED ROUTER
const authRouter = express.Router();
authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
app.use("/api/auth", authRouter);

// PROTECTED ROUTER (Requires JWT)
const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

// CORE EXPENSE LOGIC
// POST /api/expenses (Transactional Add Expense)
protectedRouter.post("/expenses", async (req, res) => {
  const { group_id, payer_id, amount, description, split_type, splits } =
    req.body;
  const user_id = req.user.user_id;

  // Validation
  if (!group_id || !payer_id || !amount || !split_type || !splits) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Amount must be positive." });
  }

  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    // Verify user is in the group
    const memberResult = await client.query(
      "SELECT 1 FROM GroupMembers WHERE group_id = $1 AND user_id = $2",
      [group_id, user_id]
    );

    if (memberResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    // Insert expense
    const expenseResult = await client.query(
      "INSERT INTO Expenses (group_id, payer_id, amount, description, split_type) VALUES ($1, $2, $3, $4, $5) RETURNING expense_id",
      [group_id, payer_id, amount, description, split_type]
    );

    const expense_id = expenseResult.rows[0].expense_id;

    // Validate splits sum to total amount
    const totalSplits = splits.reduce(
      (sum, split) => sum + parseFloat(split.amount),
      0
    );
    if (Math.abs(totalSplits - amount) > 0.01) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ message: "Splits do not sum to total amount." });
    }

    // Insert splits
    for (const split of splits) {
      await client.query(
        "INSERT INTO ExpenseSplits (expense_id, user_id, amount) VALUES ($1, $2, $3)",
        [expense_id, split.user_id, split.amount]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Expense added successfully.",
      expense_id: expense_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Server error adding expense." });
  } finally {
    client.release();
  }
});

// GET /api/balances/:group_id (Core Calculation)
protectedRouter.get("/balances/:group_id", async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user.user_id;

  try {
    // Verify user is in the group
    const memberResult = await dbPool.query(
      "SELECT 1 FROM GroupMembers WHERE group_id = $1 AND user_id = $2",
      [group_id, user_id]
    );

    if (memberResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    // Calculate balances
    const balancesResult = await dbPool.query(
      `
            SELECT 
                u.user_id,
                u.username,
                COALESCE(SUM(CASE WHEN e.payer_id = u.user_id THEN e.amount ELSE 0 END), 0) as total_paid,
                COALESCE(SUM(es.amount), 0) as total_owed,
                COALESCE(SUM(CASE WHEN e.payer_id = u.user_id THEN e.amount ELSE 0 END), 0) - COALESCE(SUM(es.amount), 0) as balance
            FROM Users u
            INNER JOIN GroupMembers gm ON u.user_id = gm.user_id
            LEFT JOIN Expenses e ON e.group_id = gm.group_id AND e.payer_id = u.user_id
            LEFT JOIN ExpenseSplits es ON es.expense_id = e.expense_id OR (es.user_id = u.user_id AND es.expense_id IN (SELECT expense_id FROM Expenses WHERE group_id = gm.group_id))
            WHERE gm.group_id = $1
            GROUP BY u.user_id, u.username
            ORDER BY u.username
        `,
      [group_id]
    );

    res.status(200).json({
      balances: balancesResult.rows,
    });
  } catch (error) {
    console.error("Get balances error:", error);
    res.status(500).json({ message: "Server error getting balances." });
  }
});

// GET /api/settlements/optimize/:group_id (Graph Algorithm)
protectedRouter.get("/settlements/optimize/:group_id", async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user.user_id;

  try {
    // Verify user is in the group
    const memberResult = await dbPool.query(
      "SELECT 1 FROM GroupMembers WHERE group_id = $1 AND user_id = $2",
      [group_id, user_id]
    );

    if (memberResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    // Get all balances
    const balancesResult = await dbPool.query(
      `
            SELECT 
                u.user_id,
                u.username,
                COALESCE(SUM(CASE WHEN e.payer_id = u.user_id THEN e.amount ELSE 0 END), 0) - COALESCE(SUM(es.amount), 0) as balance
            FROM Users u
            INNER JOIN GroupMembers gm ON u.user_id = gm.user_id
            LEFT JOIN Expenses e ON e.group_id = gm.group_id AND e.payer_id = u.user_id
            LEFT JOIN ExpenseSplits es ON es.user_id = u.user_id AND es.expense_id IN (SELECT expense_id FROM Expenses WHERE group_id = gm.group_id)
            WHERE gm.group_id = $1
            GROUP BY u.user_id, u.username
        `,
      [group_id]
    );

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = [];
    const debtors = [];

    for (const row of balancesResult.rows) {
      const balance = parseFloat(row.balance);
      if (balance > 0.01) {
        creditors.push({
          user_id: row.user_id,
          username: row.username,
          amount: balance,
        });
      } else if (balance < -0.01) {
        debtors.push({
          user_id: row.user_id,
          username: row.username,
          amount: -balance,
        });
      }
    }

    // Greedy algorithm to minimize transactions
    const settlements = [];
    let i = 0,
      j = 0;

    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const settleAmount = Math.min(creditor.amount, debtor.amount);

      settlements.push({
        from_user_id: debtor.user_id,
        from_username: debtor.username,
        to_user_id: creditor.user_id,
        to_username: creditor.username,
        amount: Math.round(settleAmount * 100) / 100,
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount < 0.01) i++;
      if (debtor.amount < 0.01) j++;
    }

    res.status(200).json({
      settlements: settlements,
    });
  } catch (error) {
    console.error("Optimize settlements error:", error);
    res.status(500).json({ message: "Server error optimizing settlements." });
  }
});

// GROUP MANAGEMENT
// POST /api/groups
protectedRouter.post("/groups", async (req, res) => {
  const { group_name, member_ids } = req.body;
  const creator_id = req.user.user_id;

  if (!group_name) {
    return res.status(400).json({ message: "Group name is required." });
  }

  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");

    // Create group
    const groupResult = await client.query(
      "INSERT INTO Groups (group_name, created_by) VALUES ($1, $2) RETURNING group_id",
      [group_name, creator_id]
    );

    const group_id = groupResult.rows[0].group_id;

    // Add creator as a member
    await client.query(
      "INSERT INTO GroupMembers (group_id, user_id) VALUES ($1, $2)",
      [group_id, creator_id]
    );

    // Add other members if provided
    if (member_ids && Array.isArray(member_ids)) {
      for (const member_id of member_ids) {
        if (member_id !== creator_id) {
          await client.query(
            "INSERT INTO GroupMembers (group_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [group_id, member_id]
          );
        }
      }
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Group created successfully.",
      group_id: group_id,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create group error:", error);
    res.status(500).json({ message: "Server error creating group." });
  } finally {
    client.release();
  }
});

// UTILITY
// GET /api/users/search
protectedRouter.get("/users/search", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res
      .status(400)
      .json({ message: "Search query must be at least 2 characters." });
  }

  try {
    const searchPattern = `%${query}%`;
    const usersResult = await dbPool.query(
      "SELECT user_id, username, email FROM Users WHERE username ILIKE $1 OR email ILIKE $1 LIMIT 10",
      [searchPattern]
    );

    res.status(200).json({
      users: usersResult.rows,
    });
  } catch (error) {
    console.error("User search error:", error);
    res.status(500).json({ message: "Server error searching users." });
  }
});

// GET /api/groups (Get all groups for current user)
protectedRouter.get("/groups", async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const groupsResult = await dbPool.query(
      `SELECT g.group_id, g.group_name, g.created_at, g.created_by,
              u.username as creator_username,
              COUNT(DISTINCT gm.user_id) as member_count
       FROM Groups g
       INNER JOIN GroupMembers gm ON g.group_id = gm.group_id
       LEFT JOIN Users u ON g.created_by = u.user_id
       WHERE g.group_id IN (SELECT group_id FROM GroupMembers WHERE user_id = $1)
       GROUP BY g.group_id, g.group_name, g.created_at, g.created_by, u.username
       ORDER BY g.created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      groups: groupsResult.rows,
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ message: "Server error getting groups." });
  }
});

// GET /api/groups/:group_id/members (Get all members of a group)
protectedRouter.get("/groups/:group_id/members", async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user.user_id;

  try {
    // Verify user is in the group
    const memberResult = await dbPool.query(
      "SELECT 1 FROM GroupMembers WHERE group_id = $1 AND user_id = $2",
      [group_id, user_id]
    );

    if (memberResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    const membersResult = await dbPool.query(
      `SELECT u.user_id, u.username, u.email, gm.joined_at
       FROM Users u
       INNER JOIN GroupMembers gm ON u.user_id = gm.user_id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at`,
      [group_id]
    );

    res.status(200).json({
      members: membersResult.rows,
    });
  } catch (error) {
    console.error("Get group members error:", error);
    res.status(500).json({ message: "Server error getting group members." });
  }
});

// GET /api/groups/:group_id/expenses (Get all expenses for a group)
protectedRouter.get("/groups/:group_id/expenses", async (req, res) => {
  const { group_id } = req.params;
  const user_id = req.user.user_id;

  try {
    // Verify user is in the group
    const memberResult = await dbPool.query(
      "SELECT 1 FROM GroupMembers WHERE group_id = $1 AND user_id = $2",
      [group_id, user_id]
    );

    if (memberResult.rows.length === 0) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group." });
    }

    const expensesResult = await dbPool.query(
      `SELECT e.expense_id, e.amount, e.description, e.split_type, e.created_at,
              u.username as payer_username, u.user_id as payer_id
       FROM Expenses e
       INNER JOIN Users u ON e.payer_id = u.user_id
       WHERE e.group_id = $1
       ORDER BY e.created_at DESC`,
      [group_id]
    );

    // Get splits for each expense
    for (const expense of expensesResult.rows) {
      const splitsResult = await dbPool.query(
        `SELECT es.user_id, u.username, es.amount
         FROM ExpenseSplits es
         INNER JOIN Users u ON es.user_id = u.user_id
         WHERE es.expense_id = $1`,
        [expense.expense_id]
      );
      expense.splits = splitsResult.rows;
    }

    res.status(200).json({
      expenses: expensesResult.rows,
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ message: "Server error getting expenses." });
  }
});

app.use("/api", protectedRouter);

// ---------------------------------------------------------------------
// 5. Start the Server
// ---------------------------------------------------------------------
async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`⚡ SmartSplit AI Backend running on http://localhost:${PORT}`);
  });
}

startServer();
