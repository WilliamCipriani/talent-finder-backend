const express = require('express');
const jwt = require('jsonwebtoken');
const { getAllJobs, getJobById, createJob, addResponsibility, addQualification, addBenefit } = require('../models/jobModel');

const router = express.Router();

// Middleware para verificar el token y obtener el user_id
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// Crear una convocatoria de empleo
router.post('/create-job', authenticateToken, async (req, res) => {
  try {
    const { company, type, title, location, salaryRange, description, responsibilities, qualifications, benefits } = req.body;
    const role = req.user.role_id; // Obtener el rol del usuario desde el token JWT

    if (role !== 2) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const jobId = await createJob(company, type, title, location, salaryRange, description);

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
router.post('/apply-job', authenticateToken, async (req, res) => {
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

module.exports = router;
