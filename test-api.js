// test-api.js
// API Testing Script for SmartSplit AI Backend

const BASE_URL = "http://localhost:4000";
let authToken = "";
let userId = null;
let groupId = null;
let expenseId = null;

// Helper function to make requests
async function makeRequest(
  endpoint,
  method = "GET",
  body = null,
  token = null
) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Test 1: Register User
async function testRegister() {
  console.log("\n🧪 Test 1: Register User");
  const username = `testuser_${Date.now()}`;
  const result = await makeRequest("/api/auth/register", "POST", {
    username: username,
    email: `${username}@test.com`,
    password: "Test123!@#",
  });

  if (result.status === 201) {
    userId = result.data.user_id;
    console.log("✅ User registered successfully:", result.data);
    return true;
  } else {
    console.log("❌ Registration failed:", result);
    return false;
  }
}

// Test 2: Login User
async function testLogin() {
  console.log("\n🧪 Test 2: Login User");
  const username = `testuser_${Date.now()}`;

  // First register a user
  await makeRequest("/api/auth/register", "POST", {
    username: username,
    email: `${username}@test.com`,
    password: "Test123!@#",
  });

  // Then login
  const result = await makeRequest("/api/auth/login", "POST", {
    email: `${username}@test.com`,
    password: "Test123!@#",
  });

  if (result.status === 200) {
    authToken = result.data.token;
    userId = result.data.user_id;
    console.log("✅ Login successful:", result.data);
    return true;
  } else {
    console.log("❌ Login failed:", result);
    return false;
  }
}

// Test 3: Forgot Password
async function testForgotPassword() {
  console.log("\n🧪 Test 3: Forgot Password");
  const username = `testuser_${Date.now()}`;
  const email = `${username}@test.com`;

  // Register user first
  await makeRequest("/api/auth/register", "POST", {
    username: username,
    email: email,
    password: "Test123!@#",
  });

  const result = await makeRequest("/api/auth/forgot-password", "POST", {
    email: email,
  });

  if (result.status === 200) {
    console.log("✅ Forgot password request successful:", result.data);
    return result.data.resetToken; // Return token for next test
  } else {
    console.log("❌ Forgot password failed:", result);
    return null;
  }
}

// Test 4: Reset Password
async function testResetPassword(resetToken) {
  console.log("\n🧪 Test 4: Reset Password");

  if (!resetToken) {
    console.log("⚠️ Skipping - no reset token available");
    return false;
  }

  const result = await makeRequest("/api/auth/reset-password", "POST", {
    token: resetToken,
    newPassword: "NewPassword123!@#",
  });

  if (result.status === 200) {
    console.log("✅ Password reset successful:", result.data);
    return true;
  } else {
    console.log("❌ Password reset failed:", result);
    return false;
  }
}

// Test 5: Create Group
async function testCreateGroup() {
  console.log("\n🧪 Test 5: Create Group");

  const result = await makeRequest(
    "/api/groups",
    "POST",
    {
      group_name: "Test Group " + Date.now(),
    },
    authToken
  );

  if (result.status === 201) {
    groupId = result.data.group_id;
    console.log("✅ Group created successfully:", result.data);
    return true;
  } else {
    console.log("❌ Group creation failed:", result);
    return false;
  }
}

// Test 6: Get Groups
async function testGetGroups() {
  console.log("\n🧪 Test 6: Get Groups");

  const result = await makeRequest("/api/groups", "GET", null, authToken);

  if (result.status === 200) {
    console.log("✅ Groups retrieved successfully:", result.data);
    return true;
  } else {
    console.log("❌ Get groups failed:", result);
    return false;
  }
}

// Test 7: Add Expense
async function testAddExpense() {
  console.log("\n🧪 Test 7: Add Expense");

  if (!groupId) {
    console.log("⚠️ Skipping - no group available");
    return false;
  }

  const result = await makeRequest(
    "/api/expenses",
    "POST",
    {
      group_id: groupId,
      payer_id: userId,
      amount: 100.0,
      description: "Test Expense",
      split_type: "equal",
      splits: [{ user_id: userId, amount: 100.0 }],
    },
    authToken
  );

  if (result.status === 201) {
    expenseId = result.data.expense_id;
    console.log("✅ Expense added successfully:", result.data);
    return true;
  } else {
    console.log("❌ Add expense failed:", result);
    return false;
  }
}

// Test 8: Get Group Expenses
async function testGetExpenses() {
  console.log("\n🧪 Test 8: Get Group Expenses");

  if (!groupId) {
    console.log("⚠️ Skipping - no group available");
    return false;
  }

  const result = await makeRequest(
    `/api/groups/${groupId}/expenses`,
    "GET",
    null,
    authToken
  );

  if (result.status === 200) {
    console.log("✅ Expenses retrieved successfully:", result.data);
    return true;
  } else {
    console.log("❌ Get expenses failed:", result);
    return false;
  }
}

// Test 9: Get Balances
async function testGetBalances() {
  console.log("\n🧪 Test 9: Get Balances");

  if (!groupId) {
    console.log("⚠️ Skipping - no group available");
    return false;
  }

  const result = await makeRequest(
    `/api/balances/${groupId}`,
    "GET",
    null,
    authToken
  );

  if (result.status === 200) {
    console.log("✅ Balances retrieved successfully:", result.data);
    return true;
  } else {
    console.log("❌ Get balances failed:", result);
    return false;
  }
}

// Test 10: Optimize Settlements
async function testOptimizeSettlements() {
  console.log("\n🧪 Test 10: Optimize Settlements");

  if (!groupId) {
    console.log("⚠️ Skipping - no group available");
    return false;
  }

  const result = await makeRequest(
    `/api/settlements/optimize/${groupId}`,
    "GET",
    null,
    authToken
  );

  if (result.status === 200) {
    console.log("✅ Settlements optimized successfully:", result.data);
    return true;
  } else {
    console.log("❌ Optimize settlements failed:", result);
    return false;
  }
}

// Test 11: Get Group Members
async function testGetGroupMembers() {
  console.log("\n🧪 Test 11: Get Group Members");

  if (!groupId) {
    console.log("⚠️ Skipping - no group available");
    return false;
  }

  const result = await makeRequest(
    `/api/groups/${groupId}/members`,
    "GET",
    null,
    authToken
  );

  if (result.status === 200) {
    console.log("✅ Group members retrieved successfully:", result.data);
    return true;
  } else {
    console.log("❌ Get group members failed:", result);
    return false;
  }
}

// Test 12: Search Users
async function testSearchUsers() {
  console.log("\n🧪 Test 12: Search Users");

  const result = await makeRequest(
    "/api/users/search?query=test",
    "GET",
    null,
    authToken
  );

  if (result.status === 200) {
    console.log("✅ Users searched successfully:", result.data);
    return true;
  } else {
    console.log("❌ Search users failed:", result);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log("🚀 Starting API Tests...\n");
  console.log("=".repeat(50));

  let passedTests = 0;
  let totalTests = 12;

  // Run tests sequentially
  if (await testRegister()) passedTests++;
  if (await testLogin()) passedTests++;

  const resetToken = await testForgotPassword();
  if (resetToken) passedTests++;

  if (await testResetPassword(resetToken)) passedTests++;
  if (await testCreateGroup()) passedTests++;
  if (await testGetGroups()) passedTests++;
  if (await testAddExpense()) passedTests++;
  if (await testGetExpenses()) passedTests++;
  if (await testGetBalances()) passedTests++;
  if (await testOptimizeSettlements()) passedTests++;
  if (await testGetGroupMembers()) passedTests++;
  if (await testSearchUsers()) passedTests++;

  console.log("\n" + "=".repeat(50));
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed!");
  } else {
    console.log(`⚠️ ${totalTests - passedTests} test(s) failed`);
  }
}

// Run tests
runAllTests().catch(console.error);
