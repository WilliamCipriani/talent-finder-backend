const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { createCV, getUserCV } = require('../models/cvModel'); // Asegúrate de importar getUserCV
const authenticate = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage(); // Usar almacenamiento en memoria
const upload = multer({ storage: storage });

router.post('/upload', authenticate, upload.single('cv'), async (req, res) => {
  try {
    const userId = req.user.id;
    const originalFilename = req.file.originalname.replace(/\.[^/.]+$/, "");
    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `cv_uploads/${originalFilename}` // Coloca el archivo en una carpeta cv_uploads y usa el nombre original
        },
        (error, result) => {
          if (error) {
            reject(new Error('Error uploading to Cloudinary'));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(req.file.buffer);
    });
    const publicId = result.public_id;
    const secureUrl = result.secure_url;

    // Guardar en la base de datos
    const cvId = await createCV(userId, publicId, secureUrl);

    res.status(201).json({ message: 'CV subido exitosamente', cvId });
  } catch (error) {
    console.error('Error al subir el CV:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/user-cv', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cv = await getUserCV(userId);
    if (cv) {
      res.status(200).json(cv);
    } else {
      res.status(404).json({ message: 'No CV found' });
    }
  } catch (error) {
    console.error('Error al obtener el CV:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
