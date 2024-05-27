const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const jwt = require('jsonwebtoken');
const { saveCV } = require('../models/cvModel');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware para verificar el token y obtener el user_id
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('No token provided');
    return res.sendStatus(401);
  }

  console.log('Token received:', token);
  console.log('JWT_SECRET:', process.env.JWT_SECRET);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification failed:', err);
      return res.sendStatus(403);
    }
    console.log('Token verification successful:', user);
    req.user = user;
    next();
  });
};

router.post('/', authenticateToken, upload.single('cv'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user_id = req.user.id;
    console.log('User ID from token:', user_id);

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'raw' }, (error, result) => {
        if (error) {
          console.log('Error uploading to Cloudinary:', error);
          reject(error);
        } else {
          console.log('Upload to Cloudinary successful:', result);
          resolve(result);
        }
      });
      uploadStream.end(file.buffer);
    });

    const { public_id, secure_url } = result;
    await saveCV(user_id, public_id, secure_url);

    res.status(200).json({
      message: 'CV uploaded and saved to database successfully',
      public_id,
      secure_url,
    });
  } catch (error) {
    console.log('Error processing request:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
