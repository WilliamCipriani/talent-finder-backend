const { poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (email, password, full_name, role) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', email)
      .input('password', hashedPassword)
      .input('full_name', full_name)
      .input('role', role)
      .query('INSERT INTO Users (email, password, full_name, role) VALUES (@email, @password, @full_name, @role)');
    return result;
  } catch (error) {
    throw new Error('Error creating user');
  }
};

const getUserByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('email', email)
      .query('SELECT * FROM Users WHERE email = @email');
    return result.recordset[0];
  } catch (error) {
    throw new Error('Error fetching user');
  }
};

module.exports = {
  createUser,
  getUserByEmail
};
