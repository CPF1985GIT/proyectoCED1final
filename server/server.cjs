const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/database.cjs');
const app = express();
const PORT = 3000;
const { insertCoursesIntoDB } = require('./config/database.cjs');
const { getCoursesFromMoodle } = require('./config/moodle.cjs');
const apiRoutes = require('./routes/api.cjs');
const extraccionRoutes = require('./routes/extraccion.cjs');

// Usar body-parser para manejar solicitudes JSON
app.use(bodyParser.json({ limit: '10mb' })); // Aumenta el límite a 10MB
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());


// Endpoint para sincronizar cursos con Moodle
app.get('/sync-courses', async (req, res) => {
  try {
      const courses = await getCoursesFromMoodle(); // Asegúrate de que esta función esté implementada
      await insertCoursesIntoDB(courses); // Llamar a la función de base de datos
      res.status(200).send('Cursos sincronizados con la base de datos.');
  } catch (error) {
      console.error('Error en /sync-courses:', error);
      res.status(500).send('Error al sincronizar cursos.');
  }
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// API
app.use('/api', require('./routes/api.cjs'));
app.use('/api', apiRoutes);
app.use('/assets/', express.static(path.join(__dirname, 'assets')));

// Manejar rutas no definidas (frontend)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Usar la ruta de extracción
app.use('/api', extraccionRoutes);


// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
