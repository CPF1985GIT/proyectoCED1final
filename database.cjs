const mysql = require('mysql2/promise');
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('mysql://root:Cpf500104!.@localhost:3306/moodle_data');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Cpf500104!.',
    database: 'moodle_data',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Modelo Course (representación de la tabla `courses`)
const Course = sequelize.define('Course', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
    },
    fullname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    startdate: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    enddate: {
        type: DataTypes.DATE,
    },
    visible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'courses', // Asegúrate de que coincida con el nombre exacto de la tabla en MySQL
    timestamps: false, // Si no tienes columnas createdAt y updatedAt
});

// Función para insertar cursos
const insertCoursesIntoDB = async (courses) => {
    try {
      await Course.sync(); // Asegura que la tabla exista
      await Course.bulkCreate(courses); // Inserta múltiples registros
      console.log('Cursos guardados exitosamente');
    } catch (error) {
      console.error('Error al guardar cursos en la base de datos:', error);
    }
  };
  
  // Exportar los elementos necesarios
  module.exports = { Course};
  module.exports = { sequelize };
  module.exports = db;
  module.exports = { insertCoursesIntoDB };
  