const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/db');
const authenticate = require('../middleware/auth');

// Ruta para crear una nueva postulación
router.post('/apply', authenticate, async (req, res) => {
    const { job_id, cv_id } = req.body;
    const user_id = req.user.id;

    console.log('Datos recibidos para aplicar:', { user_id, job_id, cv_id });
    // Verificar que todos los campos requeridos estén presentes
    if (!job_id || !cv_id) {
        return res.status(400).json({ error: 'Por favor, proporciona todos los campos requeridos.' });
    }

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('job_id', sql.Int, job_id)
            .input('cv_id', sql.Int, cv_id)
            .query('INSERT INTO Applications (user_id, job_id, applied_at, cv_id) VALUES (@user_id, @job_id, GETDATE(), @cv_id)');

        console.log('Resultado de la consulta de inserción:', result);

        res.status(201).json({ message: 'Postulación creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la postulación:', error); // Registro de depuración
        res.status(500).json({ error: error.message });
    }
});

// Ruta para obtener todas las postulaciones de un usuario
router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .query('SELECT * FROM Applications WHERE user_id = @user_id');

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error('Error al obtener las postulaciones:', error); // Registro de depuración
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
