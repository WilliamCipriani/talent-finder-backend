const { poolPromise } = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async (email, password, full_name, role_id = 1) => {
  try {
    console.log('Hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    console.log('Getting pool promise');
    const pool = await poolPromise;
    console.log('Pool promise acquired');

    console.log('Preparing database request');
    const result = await pool.request()
      .input('email', email)
      .input('username', email)
      .input('password', hashedPassword)
      .input('full_name', full_name)
      .input('role_id', role_id)
      .query('INSERT INTO Users (email, username, password, full_name, role_id) VALUES (@email, @username, @password, @full_name, @role_id)');
    console.log('User created successfully:', result);

    return result;
  } catch (error) {
    console.error('Error creating user:', error); // Loguea el error con más detalle
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
    console.error('Error fetching user:', error); // Loguea el error con más detalle
    throw new Error('Error fetching user');
  }
};

module.exports = {
  createUser,
  getUserByEmail
};
