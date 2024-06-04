const { poolPromise } = require('../config/db');
const sql = require('mssql');

const getApplicationsWithPublicId = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT A.id, A.user_id, A.job_id, A.applied_at, A.cv_id, C.public_id
      FROM Applications A
      INNER JOIN CVs C ON A.cv_id = C.id
    `);
    return result.recordset; // Asegúrate de que esto es un array
  } catch (error) {
    throw new Error('Error fetching applications');
  }
};

const getApprovedApplicants = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, user_id, job_id, cv_id, public_id, approved_at
      FROM ApprovedApplicants
    `);
    return result.recordset; // Asegúrate de que esto es un array
  } catch (error) {
    throw new Error('Error fetching approved applicants');
  }
};

module.exports = {
  getApplicationsWithPublicId,
  getApprovedApplicants
};
