
const axios = require('axios');
const MOODLE_BASE_URL = 'https://www.aulasced.cl'; 
const MOODLE_TOKEN = 'aa977f38ab5b4b14527d4ef32cf66524';


require('dotenv').config();

async function obtenerDatosMoodle() {
  try {
    const response = await axios.get(`${MOODLE_BASE_URL}/webservice/rest/server.php`, {
      params: {
        wstoken: MOODLE_TOKEN,
        moodlewsrestformat: 'json',
        wsfunction: 'core_course_get_courses',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error al conectar con Moodle: ' + error.message);
  }
}

module.exports = { obtenerDatosMoodle };