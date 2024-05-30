const { sql, poolPromise } = require('../config/db');

async function createCV(userId, publicId, secureUrl) {
  try {
      const pool = await poolPromise;
      await pool.request()
          .input('user_id', sql.Int, userId)
          .input('public_id', sql.NVarChar, publicId)
          .input('secure_url', sql.NVarChar, secureUrl)
          .query('INSERT INTO cvs (user_id, public_id, secure_url) VALUES (@user_id, @public_id, @secure_url)');
  } catch (error) {
      throw new Error('Error al crear el CV: ' + error.message);
  }
}

async function getUserCV(userId) {
  try {
      const pool = await poolPromise;
      const result = await pool.request()
          .input('user_id', sql.Int, userId)
          .query('SELECT public_id, secure_url FROM cvs WHERE user_id = @user_id');
      return result.recordset[0];
  } catch (error) {
      throw new Error('Error al obtener el CV: ' + error.message);
  }
}

module.exports = {
  createCV,
  getUserCV,
};
