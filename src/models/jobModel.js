const { poolPromise } = require('../config/db');
const sql = require('mssql');

const createJob = async (company, type, title, location, salaryRange, description, daysPosted) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('company', sql.VarChar, company)
      .input('type', sql.VarChar, type)
      .input('title', sql.VarChar, title)
      .input('location', sql.VarChar, location)
      .input('salaryRange', sql.VarChar, salaryRange)
      .input('description', sql.VarChar, description)
      .input('daysPosted', sql.Int, daysPosted)
      .query(`
        INSERT INTO Jobs (company, type, title, location, salaryRange, description, daysPosted, created_at)
        OUTPUT INSERTED.id
        VALUES (@company, @type, @title, @location, @salaryRange, @description, @daysPosted, GETDATE())
      `);
    return result.recordset[0].id;
  } catch (error) {
    throw new Error('Error creating job');
  }
};

// Función para obtener todos los trabajos
const getAllJobs = async () => {
  try {
    const pool = await poolPromise;
    // Ordenar los trabajos por la fecha de creación en orden descendente
    const result = await pool.request().query(
      'SELECT id, title, company, type, location, salaryRange, description FROM Jobs ORDER BY created_at DESC'
    );
    return result.recordset;
  } catch (err) {
    throw new Error('Error fetching jobs');
  }
};


// Función para obtener los detalles de un trabajo específico
const getJobById = async (jobId) => {
  try {
    const pool = await poolPromise;
    const jobResult = await pool.request()
      .input('id', sql.Int, jobId)
      .query('SELECT * FROM Jobs WHERE id = @id');
    const job = jobResult.recordset[0];

    if (job) {
      const responsibilitiesResult = await pool.request()
        .input('job_id', sql.Int, jobId)
        .query('SELECT responsibility FROM Responsibilities WHERE job_id = @job_id');
      job.responsibilities = responsibilitiesResult.recordset.map(r => r.responsibility).join('\n');

      const qualificationsResult = await pool.request()
        .input('job_id', sql.Int, jobId)
        .query('SELECT qualification FROM Qualifications WHERE job_id = @job_id');
      job.qualifications = qualificationsResult.recordset.map(q => q.qualification).join('\n');

      const benefitsResult = await pool.request()
        .input('job_id', sql.Int, jobId)
        .query('SELECT benefit FROM Benefits WHERE job_id = @job_id');
      job.benefits = benefitsResult.recordset.map(b => b.benefit).join('\n');
    }

    return job;
  } catch (err) {
    throw new Error('Error fetching job details');
  }
};

const addResponsibility = async (job_id, responsibility) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', sql.Int, job_id)
      .input('responsibility', sql.VarChar, responsibility)
      .query('INSERT INTO Responsibilities (job_id, responsibility) VALUES (@job_id, @responsibility)');
  } catch (error) {
    throw new Error('Error adding responsibility');
  }
};

const addQualification = async (job_id, qualification) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', sql.Int, job_id)
      .input('qualification', sql.VarChar, qualification)
      .query('INSERT INTO Qualifications (job_id, qualification) VALUES (@job_id, @qualification)');
  } catch (error) {
    throw new Error('Error adding qualification');
  }
};

const addBenefit = async (job_id, benefit) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', sql.Int, job_id)
      .input('benefit', sql.VarChar, benefit)
      .query('INSERT INTO Benefits (job_id, benefit) VALUES (@job_id, @benefit)');
  } catch (error) {
    throw new Error('Error adding benefit');
  }
};

const getApplications = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT A.[id]
            ,A.[user_id]
            ,A.[job_id]
            ,A.[applied_at]
            ,A.[cv_id]
            ,U.full_name
            ,J.title
            ,J.salaryRange
            ,J.company
            ,C.cv_data
      FROM [talenFinderdb].[dbo].[Applications] A
      INNER JOIN Users U ON A.user_id = U.id
      INNER JOIN Jobs J ON A.job_id = J.id
      INNER JOIN CVs C ON A.cv_id = C.id
    `);
    return result.recordset;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw new Error('Error fetching applications');
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  addResponsibility,
  addQualification,
  addBenefit,
  getApplications
};
