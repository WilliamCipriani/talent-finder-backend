const { poolPromise } = require('../config/db');

const createJob = async (company, type, title, location, salaryRange, description) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('company', company)
      .input('type', type)
      .input('title', title)
      .input('location', location)
      .input('salaryRange', salaryRange)
      .input('description', description)
      .query('INSERT INTO Jobs (company, type, title, location, salaryRange, description) OUTPUT INSERTED.id VALUES (@company, @type, @title, @location, @salaryRange, @description)');
    return result.recordset[0].id;
  } catch (error) {
    throw new Error('Error creating job');
  }
};

const addResponsibility = async (job_id, responsibility) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', job_id)
      .input('responsibility', responsibility)
      .query('INSERT INTO Responsibilities (job_id, responsibility) VALUES (@job_id, @responsibility)');
  } catch (error) {
    throw new Error('Error adding responsibility');
  }
};

const addQualification = async (job_id, qualification) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', job_id)
      .input('qualification', qualification)
      .query('INSERT INTO Qualifications (job_id, qualification) VALUES (@job_id, @qualification)');
  } catch (error) {
    throw new Error('Error adding qualification');
  }
};

const addBenefit = async (job_id, benefit) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('job_id', job_id)
      .input('benefit', benefit)
      .query('INSERT INTO Benefits (job_id, benefit) VALUES (@job_id, @benefit)');
  } catch (error) {
    throw new Error('Error adding benefit');
  }
};

module.exports = {
  createJob,
  addResponsibility,
  addQualification,
  addBenefit
};
