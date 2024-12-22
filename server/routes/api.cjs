const express = require('express');
const router = express.Router();
const { obtenerDatosMoodle } = require('../services/moodleService.cjs');
const { insertCoursesIntoDB } = require('../config/database.cjs');
const moodleService = require('../services/moodleService.cjs');
const { Course } = require('../config/database.cjs');

router.get('/extract', async (req, res) => {
  try {
    const data = await obtenerDatosMoodle();
    res.json(data);
  } catch (error) {
    console.error(error); 
    res.status(500).send('Error al extraer datos');
  }
});

router.post('/save-courses', async (req, res) => {
  try {
    const courses = req.body.courses; // Datos enviados desde el frontend
    if (!Array.isArray(courses)) {
      return res.status(400).json({ error: 'Datos inválidos' });
    }

    await insertCoursesIntoDB(courses);
    res.status(200).send('Cursos guardados exitosamente en la base de datos.');
  } catch (error) {
    console.error('Error al guardar cursos:', error);
    res.status(500).send('Error al guardar cursos');
  }
});

// Ruta para extraer datos desde Moodle y guardarlos en la base de datos
router.post('/extract', async (req, res) => {
  try {
      // Extraer los datos desde Moodle
      const moodleData = await moodleService.getCourses();
      if (!moodleData || moodleData.length === 0) {
          return res.status(404).json({ success: false, message: 'No se encontraron cursos en Moodle.' });
      }

      // Guardar los datos en la base de datos
      await Course.bulkCreate(moodleData, { ignoreDuplicates: true });

      // Respuesta exitosa
      res.status(200).json({ success: true, message: 'Datos extraídos y guardados correctamente.' });
  } catch (error) {
      console.error('Error al guardar datos:', error);
      res.status(500).json({ success: false, message: 'Error al guardar datos en la base de datos.', error: error.message });
  }
});

module.exports = router;
