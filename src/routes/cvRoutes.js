const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { createCV, getUserCV, deleteCV  } = require('../models/cvModel'); // Asegúrate de importar getUserCV
const authenticate = require('../middleware/auth');
const validateApiKey = require('../middleware/validateApiKey');

const router = express.Router();

const storage = multer.memoryStorage(); // Usar almacenamiento en memoria
const upload = multer({ storage: storage });

router.post('/upload', validateApiKey, authenticate, upload.single('cv'), async (req, res) => {
  try {
    const userId = req.user.id;
    const originalFilename = req.file.originalname.replace(/\.[^/.]+$/, "");
    // Subir a Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `cv_uploads/${originalFilename}` 
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

router.get('/user-cv', validateApiKey, authenticate, async (req, res) => {
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

router.delete('/delete', validateApiKey, authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const cv = await getUserCV(userId);

    if (!cv) {
      return res.status(404).json({ message: 'No CV found' });
    }

    // Eliminar de Cloudinary
    await cloudinary.uploader.destroy(cv.public_id, { resource_type: 'raw' });

    // Marcar el CV como inactivo
    await deleteCV(userId);

    res.status(200).json({ message: 'CV eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el CV:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
