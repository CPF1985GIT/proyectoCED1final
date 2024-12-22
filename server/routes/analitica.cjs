const express = require('express');
const mysql = require('mysql2');
const router = express.Router();
const cors = require('cors');
router.use(cors());


// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Cpf500104!.',
    database: 'moodle_data'
});
// Ruta para obtener la analítica de cursos
router.get('/analitica', (req, res) => {
    const query = `
        SELECT 
            (SELECT COUNT(*) FROM courses) AS totalCursos,
            (SELECT COUNT(*) FROM courses WHERE visible = 1) AS cursosActivos,
            (SELECT COUNT(*) FROM courses WHERE visible = 0) AS cursosInactivos,
            (SELECT MIN(startdate) FROM courses) AS inicioMasTemprano,
            (SELECT MAX(enddate) FROM courses) AS finMasLejano
    `;

    db.query(query, (err, result) => {
        if (err) {
            console.error('Error al obtener los datos analíticos:', err);
            return res.status(500).send('Error al obtener datos analíticos');
        }

        const data = result[0];

        res.status(200).send({
            totalCursos: data.totalCursos || 0,
            cursosActivos: data.cursosActivos || 0,
            cursosInactivos: data.cursosInactivos || 0,
            inicioMasTemprano: data.inicioMasTemprano
                ? new Date(data.inicioMasTemprano * 1000).toISOString().split('T')[0]
                : null,
            finMasLejano: data.finMasLejano
                ? new Date(data.finMasLejano * 1000).toISOString().split('T')[0]
                : null,
        });
    });
});

module.exports = router;