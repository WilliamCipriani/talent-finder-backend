const express = require('express');
const jwt = require('jsonwebtoken');
const { getAllJobs, getJobById, createJob, addResponsibility, addQualification, addBenefit, getApplications  } = require('../models/jobModel');
const authenticate = require('../middleware/auth');

const router = express.Router();

// Crear una convocatoria de empleo
router.post('/create-job', authenticate, async (req, res) => {
  try {
    const { company, type, title, location, salaryRange, description, daysPosted, created_at, responsibilities, qualifications, benefits } = req.body;
    const role = req.user.role_id; // Obtener el rol del usuario desde req.user
    if (role !== 2) { // Ajusta este valor según el rol necesario para crear trabajos
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    const jobId = await createJob(company, type, title, location, salaryRange, description, daysPosted, created_at);
    // Insertar responsabilidades
    for (const responsibility of responsibilities) {
      await addResponsibility(jobId, responsibility);
    }

    // Insertar cualificaciones
    for (const qualification of qualifications) {
      await addQualification(jobId, qualification);
    }

    // Insertar beneficios
    for (const benefit of benefits) {
      await addBenefit(jobId, benefit);
    }

    res.status(201).json({ message: 'Trabajo creado exitosamente' });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Error creating job' });
  }
});

// Postular a un trabajo
router.post('/apply-job', authenticate, async (req, res) => {
  try {
    const { job_id, cv_id } = req.body;
    const user_id = req.user.id;

    const pool = await poolPromise;
    await pool.request()
      .input('user_id', user_id)
      .input('job_id', job_id)
      .input('cv_id', cv_id)
      .query('INSERT INTO Applications (user_id, job_id, cv_id) VALUES (@user_id, @job_id, @cv_id)');

    res.status(201).json({ message: 'Postulación enviada exitosamente' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Error applying for job' });
  }
});

// Endpoint para obtener todos los trabajos
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await getAllJobs();
    res.json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).send({ error: 'Error fetching jobs' });
  }
});

// Endpoint para obtener los detalles de un trabajo específico
router.get('/jobs/:id', async (req, res) => {
  const jobId = req.params.id;
  try {
    const job = await getJobById(jobId);
    if (job) {
      res.json(job);
    } else {
      res.status(404).send({ error: 'Job not found' });
    }
  } catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).send({ error: 'Error fetching job details' });
  }
});

// Ruta para obtener las postulaciones
router.get('/applications',  async (req, res) => {
  try {
    const applications = await getApplications();
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Error fetching applications' });
  }
});


module.exports = router;
