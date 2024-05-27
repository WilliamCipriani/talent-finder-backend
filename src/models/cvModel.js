const { poolPromise } = require('../config/db');

const saveCV = async (user_id, public_id, secure_url) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('user_id', user_id)
      .input('public_id', public_id)
      .input('secure_url', secure_url)
      .query('INSERT INTO CVs (user_id, public_id, secure_url) VALUES (@user_id, @public_id, @secure_url)');
    return result;
  } catch (error) {
    throw new Error('Error saving CV to database');
  }
};

module.exports = {
  saveCV
};
