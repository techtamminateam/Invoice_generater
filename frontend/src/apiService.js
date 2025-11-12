// src/apiService.js
const BASE_URL = 'http://localhost:5000'; // your json-server port

// Create new user
export async function createUser(userData) {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return await response.json();
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

// ✅ Verify login (email + password)
export async function loginUser(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/users?email=${email}&password=${password}`);
    const data = await response.json();
    // if a matching user is found
    if (data.length > 0) {
      return data[0];
    } else {
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// Optional: Fetch all users
export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}
