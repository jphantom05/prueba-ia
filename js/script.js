// NAVIGATION
let isAdminAuthenticated = false;

function showSection(sectionId) {
    if (sectionId === 'admin') {
        if (!isAdminAuthenticated) {
            const username = prompt('Usuario:');
            const password = prompt('Contraseña:');
            if (username === 'admin' && password === '1234') {
                isAdminAuthenticated = true;
            } else {
                alert('Credenciales incorrectas');
                return;
            }
        }
    }

    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);

    // Si es la sección admin, cargar reportes
    if (sectionId === 'admin') {
        cargarReportesAdmin();
    }
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

    // Generar ID único
    const reportId = 'RPT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    // Crear objeto del reporte
    const reporte = {
        id: reportId,
        tipo: tipo,
        ubicacion: ubicacion,
        descripcion: descripcion,
        nombre: nombre,
        contacto: contacto,
        fecha: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        estado: 'Pendiente',
        autorizacion: autorizacion
    };

    // Guardar en localStorage
    let reportes = JSON.parse(localStorage.getItem('reportes')) || [];
    reportes.push(reporte);
    localStorage.setItem('reportes', JSON.stringify(reportes));

    // Mostrar mensaje de éxito con ID
    let mensaje = `✅ ¡Reporte registrado exitosamente!\n\nID de Seguimiento: ${reportId}\nTipo: ${tipo}\nUbicación: ${ubicacion}`;

    if (nombre || contacto) {
        mensaje += `\n\nDatos de seguimiento:`;
        if (nombre) mensaje += `\nNombre: ${nombre}`;
        if (contacto) mensaje += `\nContacto: ${contacto}`;
        mensaje += `\n\nGuarda este ID para consultar el estado de tu reporte.`;
    } else {
        mensaje += `\n\nGuarda este ID para consultar el estado de tu reporte.`;
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

    // Obtener reportes de localStorage
    const reportes = JSON.parse(localStorage.getItem('reportes')) || [];

    // Buscar el reporte por ID
    const reporte = reportes.find(r => r.id === reportId);

    if (reporte) {
        // Traducir el tipo para mostrar
        const tiposTraducidos = {
            'malla-vial': 'Malla vial',
            'alumbrado': 'Alumbrado',
            'semaforos': 'Semáforos',
            'aseo': 'Aseo'
        };

        document.getElementById('resultId').textContent = reporte.id;
        document.getElementById('resultType').textContent = tiposTraducidos[reporte.tipo] || reporte.tipo;
        document.getElementById('resultLocation').textContent = reporte.ubicacion;
        document.getElementById('resultStatus').textContent = reporte.estado;
        document.getElementById('resultDate').textContent = reporte.fecha;
        document.getElementById('resultContainer').classList.add('show');
    } else {
        alert('No se encontró un reporte con ese ID. Verifica que el ID sea correcto.');
        document.getElementById('resultContainer').classList.remove('show');
    }
}

// LOAD ADMIN REPORTS
function cargarReportesAdmin() {
    const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
    const tbody = document.querySelector('table tbody');

    // Limpiar tabla actual
    tbody.innerHTML = '';

    if (reportes.length === 0) {
        // Si no hay reportes, mostrar mensaje
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">No hay reportes registrados aún</td>';
        tbody.appendChild(row);
        return;
    }

    // Traducir tipos
    const tiposTraducidos = {
        'malla-vial': 'Malla vial',
        'alumbrado': 'Alumbrado',
        'semaforos': 'Semáforos',
        'aseo': 'Aseo'
    };

    // Agregar filas de reportes
    reportes.forEach(reporte => {
        const row = document.createElement('tr');

        // Determinar clase del estado
        let statusClass = 'status-pending';
        if (reporte.estado === 'En Proceso') statusClass = 'status-processing';
        if (reporte.estado === 'Solucionado') statusClass = 'status-solved';

        row.innerHTML = `
            <td>${reporte.id}</td>
            <td>${reporte.fecha}</td>
            <td>${tiposTraducidos[reporte.tipo] || reporte.tipo}</td>
            <td>${reporte.ubicacion}</td>
            <td><span class="status-badge ${statusClass}">${reporte.estado}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-detail" onclick="verDetalle('${reporte.id}')">Ver Detalle</button>
                    <button class="btn-state" onclick="cambiarEstado('${reporte.id}')">Cambiar Estado</button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });

    // Actualizar estadísticas
    actualizarEstadisticas(reportes);
}

// VIEW REPORT DETAIL
function verDetalle(reportId) {
    const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
    const reporte = reportes.find(r => r.id === reportId);

    if (reporte) {
        const tiposTraducidos = {
            'malla-vial': 'Malla vial',
            'alumbrado': 'Alumbrado',
            'semaforos': 'Semáforos',
            'aseo': 'Aseo'
        };

        const detalle = `
ID: ${reporte.id}
Fecha: ${reporte.fecha}
Tipo: ${tiposTraducidos[reporte.tipo] || reporte.tipo}
Ubicación: ${reporte.ubicacion}
Descripción: ${reporte.descripcion}
Estado: ${reporte.estado}
${reporte.nombre ? `Nombre: ${reporte.nombre}` : ''}
${reporte.contacto ? `Contacto: ${reporte.contacto}` : ''}
        `.trim();

        alert(`Detalle del Reporte:\n\n${detalle}`);
    }
}

// CHANGE REPORT STATUS
function cambiarEstado(reportId) {
    const reportes = JSON.parse(localStorage.getItem('reportes')) || [];
    const reporteIndex = reportes.findIndex(r => r.id === reportId);

    if (reporteIndex !== -1) {
        const nuevoEstado = prompt('Selecciona el nuevo estado:\n1. Pendiente\n2. En Proceso\n3. Solucionado\nIngresa el número:');
        let estadoSeleccionado;
        switch (nuevoEstado) {
            case '1':
                estadoSeleccionado = 'Pendiente';
                break;
            case '2':
                estadoSeleccionado = 'En Proceso';
                break;
            case '3':
                estadoSeleccionado = 'Solucionado';
                break;
            default:
                alert('Opción inválida');
                return;
        }

        reportes[reporteIndex].estado = estadoSeleccionado;
        localStorage.setItem('reportes', JSON.stringify(reportes));

        // Recargar la tabla
        cargarReportesAdmin();

        alert(`Estado del reporte ${reportId} cambiado a: ${estadoSeleccionado}`);
    }
}

// UPDATE STATISTICS
function actualizarEstadisticas(reportes) {
    const total = reportes.length;
    const criticos = reportes.filter(r => r.estado === 'Pendiente').length;
    const enProceso = reportes.filter(r => r.estado === 'En Proceso').length;

    document.querySelector('.stat-number').textContent = total;
    document.querySelectorAll('.stat-number')[1].textContent = criticos;
    document.querySelectorAll('.stat-number')[2].textContent = enProceso;
}
