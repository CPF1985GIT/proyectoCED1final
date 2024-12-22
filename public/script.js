const { jsPDF } = window.jspdf;
const config = {
  moodleUrl: "https://www.aulasced.cl/webservice/rest/server.php",
  token: "aa977f38ab5b4b14527d4ef32cf66524", 
};

function navigateTo(page) {
    window.location.href = page;
  }


// Función para enviar datos al backend
async function saveCoursesToDatabase(courses) {
  try {
    const response = await fetch('/api/save-courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ courses })
    });

    if (response.ok) {
      console.log('Cursos guardados en la base de datos.');
    } else {
      console.error('Error al guardar cursos:', await response.text());
    }
  } catch (error) {
    console.error('Error al enviar datos al backend:', error);
  }
}

async function syncAndLoadReport() {
  try {
      const response = await fetch('http://localhost:3000/sync-courses');
      if (!response.ok) {
          throw new Error('Error al sincronizar cursos');
      }
      alert('Cursos sincronizados correctamente');
      loadReport(); // Opcional: Llama a tu función para cargar los datos actualizados
  } catch (error) {
      console.error('Error al sincronizar y cargar reporte:', error);
      alert('Error al sincronizar los cursos.');
  }
}

// Función para generar PDF del dashboard
function generatePDF1() {
  const { jsPDF } = window.jspdf;
// Crear un nuevo PDF con orientación horizontal
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: "letter",
  });

  navigator.mediaDevices
    .getDisplayMedia({ video: true })
    .then((stream) => {
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);

      imageCapture
        .grabFrame()
        .then((bitmap) => {
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

          const imgData = canvas.toDataURL("image/jpeg", 1.0);

          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("dashboard.pdf");

          // Detener la transmisión de video
          track.stop();
        })
        .catch((error) => {
          console.error("Error al capturar el iframe:", error);
        });
    })
    .catch((error) => {
      console.error("Permiso denegado o error de captura:", error);
    });
}

function generatePDF4() {
  const { jsPDF } = window.jspdf;
  
  // Obtener el iframe
  const iframe = document.getElementById("powerbi-iframe");
  if (!iframe) {
    alert("No se pudo encontrar el iframe.");
    return;
  }

  // Crear un nuevo PDF con orientación horizontal
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "in",
    format: "letter",
  });

  // Obtenemos el contenedor del iframe
  const iframeRect = iframe.getBoundingClientRect();

  // Configurar el tamaño de la captura (solo el área visible)
  const options = {
    x: iframeRect.left,
    y: iframeRect.top,
    width: iframeRect.width,
    height: iframeRect.height,
    scale: 2,
    useCORS: true, // Si el iframe tiene contenido CORS compatible
    logging: true,
    letterRendering: true,
    allowTaint: true,
    backgroundColor: "#ffffff", // Fondo blanco para la captura
  };

  // Captura solo el área del iframe visible
  html2canvas(iframe, options)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Obtener las propiedades de la imagen
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Agregar la imagen al PDF
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("dashboard.pdf");
    })
    .catch((error) => {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un error al generar el PDF.");
    });
}

function generatePDF() {
  setTimeout(function() {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "in",
      format: "letter",
    });
    pdf.html(document.getElementById("reportContent"), {
      callback: function (doc) {
        doc.save("informe.pdf");
      },
    });
  }, 500); // Espera 500 ms antes de generar el PDF
}


// Función mejorada para generar PDF
function generatePDF3() {
  // Obtener todos los elementos que necesitamos capturar
  const reportContent = document.getElementById("reportContent");
  const contador = document.getElementById("contador");
  
  // Crear un contenedor temporal que incluirá todo el contenido
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '0';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1024px';
  tempContainer.style.backgroundColor = '#ffffff';
  
  // Clonar y agregar el contenido del reporte
  const reportClone = reportContent.cloneNode(true);
  const contadorClone = contador.cloneNode(true);
  
  // Asegurar que la tabla tenga el estilo correcto
  const tableElement = reportClone.querySelector('table');
  if (tableElement) {
    tableElement.style.width = '100%';
    tableElement.style.borderCollapse = 'collapse';
    tableElement.style.marginBottom = '20px';
    
    // Asegurar que todas las celdas sean visibles
    const cells = tableElement.querySelectorAll('td, th');
    cells.forEach(cell => {
      cell.style.padding = '8px';
      cell.style.border = '1px solid #ddd';
    });
  }
  
  // Agregar los elementos al contenedor temporal
  tempContainer.appendChild(reportClone);
  tempContainer.appendChild(contadorClone);
  
  // Agregar el contenedor temporal al documento
  document.body.appendChild(tempContainer);
  
  // Configuración de html2canvas
  const html2canvasOptions = {
    scale: 2,
    useCORS: true,
    logging: true,
    letterRendering: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    height: tempContainer.scrollHeight,
    width: 1024,
    windowHeight: tempContainer.scrollHeight,
    onclone: function(clonedDoc) {
      const clonedElement = clonedDoc.body.firstChild;
      if (clonedElement) {
        clonedElement.style.height = 'auto';
        clonedElement.style.overflow = 'visible';
      }
    }
  };

  // Definir márgenes para el PDF (en mm)
  const margins = {
    top: 25,
    bottom: 25,
    left: 20,
    right: 20
  };

  // Crear el PDF
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true
  });

  // Obtener dimensiones de la página
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Mostrar indicador de carga
  const loadingDiv = document.createElement("div");
  loadingDiv.innerHTML = "Generando PDF... Por favor espere.";
  loadingDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: rgba(0,0,0,0.7);
    color: white;
    border-radius: 5px;
    z-index: 9999;
  `;
  document.body.appendChild(loadingDiv);

  // Convertir a imagen con html2canvas
  html2canvas(tempContainer, html2canvasOptions)
    .then(canvas => {
      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);
      
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calcular número de páginas necesarias
      const pageCount = Math.ceil(imgHeight / (pageHeight - 20));
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // Agregar la imagen por partes a múltiples páginas
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calcular la posición y altura para la porción actual
        const currentHeight = Math.min(pageHeight - 20, heightLeft);
        const currentPosition = -position;
        
        pdf.addImage(
          imgData,
          'JPEG',
          10,
          10 + currentPosition,
          imgWidth,
          imgHeight,
          null,
          'FAST'
        );
        
        heightLeft -= (pageHeight - 20);
        position += (pageHeight - 20);
        
        // Agregar número de página
        pdf.setFontSize(8);
        pdf.setTextColor(128);
        pdf.text(
          `Página ${i + 1} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 5,
          { align: 'center' }
        );
      }

      // Guardar el PDF
      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`informe-moodle-${date}.pdf`);
      
      // Remover el indicador de carga
      document.body.removeChild(loadingDiv);
    })
    .catch(error => {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intente nuevamente.');
      document.body.removeChild(loadingDiv);
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    });
}

// Función auxiliar para validar que el contenido existe antes de generar el PDF
function validateAndGeneratePDF() {
  const reportContent = document.getElementById("reportContent");
  const contador = document.getElementById("contador");
  
  if (!reportContent || !reportContent.children.length) {
    alert('Por favor, genere primero el informe antes de crear el PDF.');
    return;
  }
  
  generatePDF3();
}

// Función para obtener los cursos desde Moodle
async function getCoursesFromMoodle(visibilityFilter) {
  const params = new URLSearchParams({
    wstoken: config.token,
    wsfunction: "core_course_get_courses",
    moodlewsrestformat: "json"
  });

  try {
    const response = await fetch(`${config.moodleUrl}?${params.toString()}`);
    const data = await response.json();

    if (data && data.length > 0) {
      // Filtrar los cursos según el filtro de visibilidad
      if (visibilityFilter === "visible") {
        return data.filter(course => course.visible === 1); // Cursos visibles
      } else if (visibilityFilter === "hidden") {
        return data.filter(course => course.visible === 0); // Cursos ocultos
      }
      return data; // Todos los cursos
    } else {
      console.error("No se encontraron cursos");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    return [];
  }
}


// Función para obtener los alumnos desde Moodle
async function getStudentsFromMoodle() {
  const params = new URLSearchParams({
    wstoken: config.token,
    wsfunction: "core_enrol_get_enrolled_users",
    moodlewsrestformat: "json",
    courseid: 1 // Reemplazar por un ID de curso real
  });

  try {
    const response = await fetch(`${config.moodleUrl}?${params.toString()}`);
    const data = await response.json();

    if (data && data.length > 0) {
      return data;
    } else {
      console.error("No se encontraron estudiantes");
      return [];
    }
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    return [];
  }
}

// Función para cargar el informe seleccionado
async function loadReport() {
  const reportType = document.getElementById("reportType").value;
  const visibilityFilter = document.getElementById("visibilityFilter").value;

  if (reportType === "courses") {
    const courses = await getCoursesFromMoodle(visibilityFilter); // Pasar filtro
    displayCoursesReport(courses); // Mostrar en la vista
    await saveCoursesToDatabase(courses); // Guardar en la base de datos
  } else if (reportType === "students") {
    const students = await getStudentsFromMoodle();
    displayStudentsReport(students);
  }
}

// Mostrar los cursos en la vista
function displayCoursesReport(courses) {
  const reportContent = document.getElementById("reportContent");
  reportContent.innerHTML = ""; // Limpiar contenido anterior
  
  if (courses.length === 0) {
    reportContent.innerHTML = "<p>No hay cursos disponibles.</p>";
    return;
  }
  
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre Curso</th>
        <th>Inicio</th>
        <th>Término</th>
        <th>Disponibilidad</th>
      </tr>
    </thead>
    <tbody>
      ${courses.map(course => `
        <tr>
          <td>${course.id}</td>
          <td>${course.fullname}</td>
          <td>${new Date(course.startdate * 1000).toLocaleDateString()}</td> <!-- Convertir fecha -->
          <td>${new Date(course.enddate * 1000).toLocaleDateString()}</td> <!-- Convertir fecha -->
          <td>${course.visible ? 'Visible' : 'Oculto'}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  reportContent.appendChild(table);
}

// Función para realizar la extracción de datos
function extraerDatos() {
  const tipoDato = document.getElementById("tipoDato").value; // Obtener el tipo de dato seleccionado

  // Mostrar mensaje de carga
  document.getElementById("resultado").textContent = "Extrayendo datos...";

  // Enviar solicitud POST al backend
  fetch('http://localhost:3000/api/extraccion', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          tipoDato: tipoDato,  // Enviar el tipo de dato como JSON
      })
  })
  .then(response => response.json())
  .then(data => {
      // Mostrar mensaje de éxito
      document.getElementById("resultado").textContent = 'Datos extraídos y actualizados correctamente.';
  })
  .catch((error) => {
      // Mostrar mensaje de error
      document.getElementById("resultado").textContent = 'Hubo un error en la extracción de datos.';
      console.error(error);
  });
}

// Mostrar los estudiantes en la vista
function displayStudentsReport(students) {
  const reportContent = document.getElementById("reportContent");
  reportContent.innerHTML = ""; // Limpiar contenido anterior

  if (students.length === 0) {
    reportContent.innerHTML = "<p>No se encontraron estudiantes.</p>";
    return;
  }

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre del Estudiante</th>
        <th>Correo Electrónico</th>
      </tr>
    </thead>
    <tbody>
      ${students.map(student => `
        <tr>
          <td>${student.id}</td>
          <td>${student.fullname}</td>
          <td>${student.email}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  reportContent.appendChild(table);
}


// Elementos del DOM
const filtroCursos = document.getElementById("filtro-cursos");
const listaCursos = document.getElementById("lista-cursos");
const contador = document.getElementById("contador");

// Función para mostrar los cursos en la lista
function mostrarCursos(cursosFiltrados) {
  listaCursos.innerHTML = ""; // Limpiar lista

  cursosFiltrados.forEach(curso => {
    const li = document.createElement("li");
    li.textContent = `${curso.name} - ${curso.visible ? "Visible" : "Oculto"}`;
    listaCursos.appendChild(li);
  });

  // Actualizar el contador después de renderizar los cursos
  actualizarContador(cursosFiltrados);
}

// Función para actualizar el contador
function actualizarContador(cursosFiltrados) {
  const totalVisibles = cursosFiltrados.filter(curso => curso.visible === 1).length;
  const totalOcultos = cursosFiltrados.filter(curso => curso.visible === 0).length;

  contador.innerHTML = `
    <p>Total de cursos visibles: ${totalVisibles}</p>
    <p>Total de cursos ocultos: ${totalOcultos}</p>
    <p>Total de cursos mostrados: ${cursosFiltrados.length}</p>
  `;
}

// Función para filtrar los cursos según la selección
function filtrarCursos() {
  const filtro = filtroCursos.value;

  if (filtro === "todos") {
    mostrarCursos(cursos);
  } else if (filtro === "visibles") {
    const visibles = cursos.filter(curso => curso.visible === 1);
    mostrarCursos(visibles);
  } else if (filtro === "ocultos") {
    const ocultos = cursos.filter(curso => curso.visible === 0);
    mostrarCursos(ocultos);
  }
}

// Evento para cambiar la lista al seleccionar un filtro
filtroCursos.addEventListener("change", filtrarCursos);

// Mostrar todos los cursos al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  filtroCursos.value = "todos";
  filtrarCursos();
});

function updateCounters(courses) {
  const contadorDiv = document.getElementById("contador");
  contadorDiv.innerHTML = ""; // Limpiar contenido previo

  if (!courses || courses.length === 0) {
    contadorDiv.innerHTML = "<p>No hay datos disponibles para contar.</p>";
    return;
  }

  const totalCourses = courses.length;
  const visibleCourses = courses.filter(course => course.visible === 1).length;
  const hiddenCourses = courses.filter(course => course.visible === 0).length;

  contadorDiv.innerHTML = `
    <p>Total de cursos: ${totalCourses}</p>
    <p>Cursos visibles: ${visibleCourses}</p>
    <p>Cursos ocultos: ${hiddenCourses}</p>
  `;
}

function displayCoursesReport(courses) {
  const reportContent = document.getElementById("reportContent");
  reportContent.innerHTML = ""; // Limpiar contenido anterior
  
  if (courses.length === 0) {
    reportContent.innerHTML = "<p>No hay cursos disponibles.</p>";
    return;
  }
  
  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre Curso</th>
        <th>Inicio</th>
        <th>Término</th>
        <th>Disponibilidad</th>
      </tr>
    </thead>
    <tbody>
      ${courses.map(course => `
        <tr>
          <td>${course.id}</td>
          <td>${course.fullname}</td>
          <td>${new Date(course.startdate * 1000).toLocaleDateString()}</td>
          <td>${new Date(course.enddate * 1000).toLocaleDateString()}</td>
          <td>${course.visible ? 'Visible' : 'Oculto'}</td>
        </tr>
      `).join("")}
    </tbody>
  `;
  
  reportContent.appendChild(table);
  
  // Actualizar contadores
  updateCounters(courses);
}

function obtenerAnalitica() {
  fetch('http://localhost:3000/analiticaCED') // Cambia esta URL según la configuración de tu API
    .then(response => response.json())
    .then(data => {
      // Asignar los datos a los elementos HTML
      document.getElementById('totalCursos').textContent = data.totalCursos || 0;
      document.getElementById('cursosActivos').textContent = data.cursosActivos || 0;
      document.getElementById('cursosInactivos').textContent = data.cursosInactivos || 0;
      document.getElementById('inicioMasTemprano').textContent = data.inicioMasTemprano 
        ? new Date(data.inicioMasTemprano * 1000).toLocaleDateString() 
        : "N/A";
    })
    .catch(error => {
      console.error('Error al obtener datos de la API:', error);
    });
}

// Llamar a la función al cargar la página
window.onload = obtenerAnalitica;

