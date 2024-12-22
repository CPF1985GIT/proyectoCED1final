const express = require('express');
const axios = require('axios');
const mysql = require('mysql2');
const router = express.Router();

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Cpf500104!.',
    database: 'moodle_data'
});

// Ruta para la extracción de datos
router.post('/extraccion', (req, res) => {
    const { tipoDato } = req.body; // Recibimos el tipo de dato desde el frontend (cursos o alumnos)

    let apiUrl = '';
    let queryDelete = '';
    let queryInsert = '';

    // Selección de API y consultas según el tipo de dato
    if (tipoDato === 'cursos') {
        apiUrl = `https://www.aulasced.cl/webservice/rest/server.php?wstoken=aa977f38ab5b4b14527d4ef32cf66524&moodlewsrestformat=json&wsfunction=core_course_get_courses`;
        queryDelete = 'DELETE FROM courses'; // Borrar datos previos de cursos
        queryInsert = 'INSERT INTO courses (id, fullname, startdate, enddate, visible) VALUES (?, ?, ?, ?, ?)'; // Insertar datos de cursos
    } else if (tipoDato === 'alumnos') {
        apiUrl = `https://www.aulasced.cl/webservice/rest/server.php?wstoken=aa977f38ab5b4b14527d4ef32cf66524&moodlewsrestformat=json&wsfunction=core_enrol_get_enrolled_users`;
        queryDelete = 'DELETE FROM students'; // Borrar datos previos de alumnos
        queryInsert = 'INSERT INTO students (student_id, name, email, course_id) VALUES (?, ?, ?, ?)'; // Insertar datos de alumnos
    } else {
        return res.status(400).send('Tipo de dato no válido');
    }

    // Hacer la solicitud a la API de Moodle
    axios.get(apiUrl)
        .then((response) => {
            const datos = response.data;

            if (!Array.isArray(datos) || datos.length === 0) {
                return res.status(404).send('No se encontraron datos para extraer.');
            }

            // Borrar los registros anteriores en la base de datos
            db.query(queryDelete, (err, result) => {
                if (err) {
                    console.error('Error al borrar los datos:', err);
                    return res.status(500).send('Error al borrar los datos');
                }

                console.log('Datos previos eliminados correctamente.');

                // Insertar los nuevos datos
                datos.forEach(item => {
                    try {
                        // Mapear los datos de la API a las columnas de la tabla
                        const id = item.id; // ID del curso
                        const fullname = item.fullname || 'Sin nombre'; // Nombre del curso
                        const startdate = item.startdate ? new Date(item.startdate * 1000).toISOString().split('T')[0] : null; // Fecha de inicio en formato DATE
                        const enddate = item.enddate ? new Date(item.enddate * 1000).toISOString().split('T')[0] : null; // Fecha de fin en formato DATE
                        const visible = item.visible === 1 ? 1 : 0; // Convertir a booleano (1 = visible, 0 = oculto)

                        // Validar datos antes de insertar
                        if (!id || !fullname || visible === undefined) {
                            console.error(`Datos inválidos: ${JSON.stringify(item)}`);
                            return;
                        }

                        const values = [id, fullname, startdate, enddate, visible];

                        // Ejecutar la consulta de inserción
                        db.query(queryInsert, values, (err, result) => {
                            if (err) {
                                console.error('Error al insertar los datos:', err.sqlMessage, `\nDatos: ${JSON.stringify(values)}`);
                            } else {
                                console.log(`Registro insertado correctamente: ${fullname}`);
                            }
                        });
                    } catch (error) {
                        console.error(`Error al procesar el dato: ${JSON.stringify(item)} - ${error.message}`);
                    }
                });

                res.status(200).send({ message: 'Datos extraídos y actualizados correctamente' });
            });
        })
        .catch((error) => {
            console.error('Error al obtener datos de Moodle:', error);
            res.status(500).send({ message: 'Error al extraer los datos' });
        });
});

module.exports = router;