-- PostgreSQL Database Schema for SmartSplit AI

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Table
CREATE TABLE IF NOT EXISTS Groups (
    group_id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GroupMembers Table
CREATE TABLE IF NOT EXISTS GroupMembers (
    group_id INTEGER NOT NULL REFERENCES Groups(group_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS Expenses (
    expense_id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES Groups(group_id) ON DELETE CASCADE,
    payer_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    split_type VARCHAR(20) NOT NULL CHECK (split_type IN ('equal', 'exact', 'percentage')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ExpenseSplits Table
CREATE TABLE IF NOT EXISTS ExpenseSplits (
    split_id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES Expenses(expense_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0)
);

-- PasswordResetTokens Table
CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    user_id INTEGER PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_expenses_group_id ON Expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_payer_id ON Expenses(payer_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON ExpenseSplits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_user_id ON ExpenseSplits(user_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON GroupMembers(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON Users(username);
