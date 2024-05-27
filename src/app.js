const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Permitir solicitudes desde este origen
  credentials: true, // Permitir el envío de cookies y encabezados de autenticación
}));

app.use(express.json());// Middleware para parsear JSON

// Importar rutas
const cvRoutes = require('./routes/cvRoutes');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes')

// Usar rutas
app.use('/upload-cv', cvRoutes);
app.use('/auth', authRoutes);
app.use('/jobs', jobRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor Express funcionando correctamente');
});

module.exports = app;
