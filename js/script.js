// NAVIGATION
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

// CARD FLIP FUNCTION
function flipCard(card) {
    card.classList.toggle('flipped');
}

// FORM SUBMISSION
document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tipo = document.getElementById('tipoNovedad').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const descripcion = document.getElementById('descripcion').value;
    const nombre = document.getElementById('nombreUsuario').value;
    const contacto = document.getElementById('contacto').value;
    const autorizacion = document.getElementById('autorizacionDatos').checked;
    
    // Validar si se requiere autorización cuando hay datos personales
    if ((nombre || contacto) && !autorizacion) {
        alert('⚠️ Debes autorizar el tratamiento de datos personales para continuar.');
        return;
    }
    
    let mensaje = `✅ ¡Reporte registrado exitosamente!\n\nTipo: ${tipo}\nUbicación: ${ubicacion}`;
    
    if (nombre || contacto) {
        mensaje += `\n\nDatos de seguimiento:`;
        if (nombre) mensaje += `\nNombre: ${nombre}`;
        if (contacto) mensaje += `\nContacto: ${contacto}`;
        mensaje += `\n\nTe enviaremos actualizaciones a tu correo o teléfono.`;
    } else {
        mensaje += `\n\nTe enviaremos actualizaciones por correo.`;
    }
    
    alert(mensaje);
    this.reset();
});

// SEARCH REPORTS
function buscarReporte() {
    const reportId = document.getElementById('reportId').value.trim();
    
    if (!reportId) {
        alert('Por favor ingresa el ID del reporte');
        return;
    }
    
    // Datos de ejemplo
    const reportes = {
        'RPT-001': {
            id: 'RPT-001',
            type: 'Malla vial',
            location: 'Calle 26 # 50-00',
            status: 'Pendiente',
            date: '2026-04-10'
        },
        'RPT-002': {
            id: 'RPT-002',
            type: 'Alumbrado',
            location: 'Calle 50 # 15-30',
            status: 'En Proceso',
            date: '2026-04-09'
        },
        'RPT-003': {
            id: 'RPT-003',
            type: 'Semáforos',
            location: 'Carrera 7 # 72-20',
            status: 'Solucionado',
            date: '2026-04-08'
        }
    };
    
    if (reportes[reportId]) {
        const reporte = reportes[reportId];
        document.getElementById('resultId').textContent = reporte.id;
        document.getElementById('resultType').textContent = reporte.type;
        document.getElementById('resultLocation').textContent = reporte.location;
        document.getElementById('resultStatus').textContent = reporte.status;
        document.getElementById('resultDate').textContent = reporte.date;
        document.getElementById('resultContainer').classList.add('show');
    } else {
        alert('No se encontró un reporte con ese ID. Intenta con: RPT-001, RPT-002 o RPT-003');
        document.getElementById('resultContainer').classList.remove('show');
    }
}
