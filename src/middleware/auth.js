const jwt = require('jsonwebtoken');
const { poolPromise } = require('../config/db');

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', decoded.id)
      .query('SELECT * FROM Users WHERE id = @id');
    
    const user = result.recordset[0];
    
    if (!user) {
      throw new Error();
    }

    req.user = { ...user, role_id: decoded.role_id };

    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = authenticate;
