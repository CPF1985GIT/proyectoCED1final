require('dotenv').config();
const MOODLE_BASE_URL = 'https://www.aulasced.cl'; 
const MOODLE_TOKEN = 'aa977f38ab5b4b14527d4ef32cf66524';

(async () => {
    const fetch = (await import('node-fetch')).default;
const MOODLE_BASE_URL = 'https://www.aulasced.cl'; 
const MOODLE_TOKEN = 'aa977f38ab5b4b14527d4ef32cf66524';   
})();

async function getCoursesFromMoodle() {
    try {
        const response = await fetch(
            `${MOODLE_BASE_URL}/webservice/rest/server.php?wstoken=${MOODLE_TOKEN}&wsfunction=core_course_get_courses&moodlewsrestformat=json`
        );
        if (!response.ok) {
            throw new Error(`Error al obtener cursos de Moodle: ${response.statusText}`);
        }

        const courses = await response.json();

        // Filtra o transforma los datos si es necesario
        return courses.map((course) => ({
            id: course.id,
            fullname: course.fullname,
            startdate: course.startdate,
            enddate: course.enddate,
            visible: course.visible
        }));
    } catch (error) {
        console.error('Error al obtener cursos desde Moodle:', error);
        throw error;
    }
}

module.exports = { getCoursesFromMoodle };