import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js";

// NAVIGATION
let isAdminAuthenticated = false;

window.showSection = function(sectionId) {
    if (sectionId === 'admin') {
        if (!isAdminAuthenticated) {
            const username = prompt('Usuario:');
            const password = prompt('Contraseña:');
            if (username === 'admin' && password === '1234') {
                isAdminAuthenticated = true;
                const link = document.querySelector('a[onclick="showSection(\'admin\')"]');
                if (link) link.textContent = 'Panel Admin';
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

    if (sectionId === 'admin') {
        window.cargarReportesAdmin();
    }
};

window.logout = function() {
    isAdminAuthenticated = false;
    const link = document.querySelector('a[onclick="showSection(\'admin\')"]');
    if (link) link.textContent = 'Acceso Admin';
    window.showSection('inicio');
};

// CARD FLIP FUNCTION
window.flipCard = function(card) {
    card.classList.toggle('flipped');
};

async function guardarReporte(reporte, imagenFile) {
    const id = reporte.id;
    let urlImagen = null;
    if (imagenFile) {
        const storageRef = ref(window.storage, `reportes/${id}`);
        await uploadBytes(storageRef, imagenFile);
        urlImagen = await getDownloadURL(storageRef);
    }
    await setDoc(doc(window.db, "reportes", id), {
        titulo: reporte.tipo,
        descripcion: reporte.descripcion,
        ubicacion: reporte.ubicacion,
        fecha: reporte.fecha,
        url_imagen: urlImagen,
        nombre: reporte.nombre,
        contacto: reporte.contacto,
        estado: reporte.estado,
        autorizacion: reporte.autorizacion
    });
}

async function generateReportId() {
    while (true) {
        const randomId = `RPT${Math.floor(Math.random() * 9000 + 1000)}`;
        const docSnap = await getDoc(doc(window.db, "reportes", randomId));
        if (!docSnap.exists()) {
            return randomId;
        }
    }
}

document.getElementById('reportForm').addEventListener('submit', async function(e) {
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

    // Validar imagen
    const evidencia = document.getElementById('evidencia').files[0];
    if (evidencia) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(evidencia.type)) {
            alert('Formato de imagen no permitido. Solo JPG, PNG, WebP.');
            return;
        }
        if (evidencia.size > 2 * 1024 * 1024) {
            alert('El tamaño de la imagen supera los 2MB.');
            return;
        }
    }

    // Generar ID único
    const reportId = await generateReportId();

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

    try {
        await guardarReporte(reporte, evidencia);
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

        // Copiar ID al portapapeles
        navigator.clipboard.writeText(reportId).then(() => {
            alert(mensaje + '\n\nEl ID ha sido copiado al portapapeles.');
        }).catch(() => {
            alert(mensaje);
        });

        this.reset();
    } catch (error) {
        alert('Error al guardar el reporte: ' + error.message);
    }
});

// SEARCH REPORTS
window.buscarReporte = async function() {
    const reportId = document.getElementById('reportId').value.trim();
    if (!reportId) {
        alert('Por favor ingresa el ID del reporte');
        return;
    }
    try {
        const docSnap = await getDoc(doc(window.db, "reportes", reportId));
        if (docSnap.exists()) {
            const reporte = {id: docSnap.id, ...docSnap.data()};
            const tiposTraducidos = {
                'malla-vial': 'Malla vial',
                'alumbrado': 'Alumbrado',
                'semaforos': 'Semáforos',
                'aseo': 'Aseo'
            };
            document.getElementById('resultId').textContent = reporte.id;
            document.getElementById('resultType').textContent = tiposTraducidos[reporte.titulo] || reporte.titulo;
            document.getElementById('resultLocation').textContent = reporte.ubicacion;
            document.getElementById('resultStatus').textContent = reporte.estado;
            document.getElementById('resultDate').textContent = reporte.fecha;
            document.getElementById('resultName').textContent = reporte.nombre || 'No proporcionado';
            document.getElementById('resultContact').textContent = reporte.contacto || 'No proporcionado';
            const imgContainer = document.getElementById('resultImageContainer');
            imgContainer.innerHTML = '';
            if (reporte.url_imagen) {
                const img = document.createElement('img');
                img.src = reporte.url_imagen;
                img.style.maxWidth = '200px';
                imgContainer.appendChild(img);
            }
            document.getElementById('resultContainer').classList.add('show');
        } else {
            alert('No se encontró un reporte con ese ID. Verifica que el ID sea correcto.');
            document.getElementById('resultContainer').classList.remove('show');
        }
    } catch (error) {
        alert('Error al buscar reporte: ' + error.message);
    }
}

// LOAD ADMIN REPORTS
window.cargarReportesAdmin = async function() {
    try {
        const querySnapshot = await getDocs(collection(window.db, "reportes"));
        const reportes = [];
        querySnapshot.forEach((docSnap) => {
            reportes.push({id: docSnap.id, ...docSnap.data()});
        });
        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';
        if (reportes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" style="text-align: center; padding: 20px;">No hay reportes registrados aún</td>';
            tbody.appendChild(row);
            return;
        }
        const tiposTraducidos = {
            'malla-vial': 'Malla vial',
            'alumbrado': 'Alumbrado',
            'semaforos': 'Semáforos',
            'aseo': 'Aseo'
        };
        reportes.forEach(reporte => {
            const row = document.createElement('tr');
            let statusClass = 'status-pending';
            if (reporte.estado === 'En Proceso') statusClass = 'status-processing';
            if (reporte.estado === 'Solucionado') statusClass = 'status-solved';
            row.innerHTML = `
                <td>${reporte.id}</td>
                <td>${reporte.fecha}</td>
                <td>${tiposTraducidos[reporte.titulo] || reporte.titulo}</td>
                <td>${reporte.ubicacion}</td>
                <td><span class="status-badge ${statusClass}">${reporte.estado}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-detail" onclick="toggleDetalle(this)" data-id="${reporte.id}">Ver Detalle</button>
                        <button class="btn-state" onclick="cambiarEstado('${reporte.id}')">Cambiar Estado</button>
                        <button class="btn-delete" onclick="eliminarReporte('${reporte.id}')">Eliminar</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
            const detailRow = document.createElement('tr');
            detailRow.className = 'detail-row';
            detailRow.style.display = 'none';
            detailRow.innerHTML = '<td colspan="6"></td>';
            tbody.appendChild(detailRow);
        });
        actualizarEstadisticas(reportes);
    } catch (error) {
        alert('Error al cargar reportes: ' + error.message);
    }
}

// VIEW REPORT DETAIL


// TOGGLE DETAIL ROW
window.toggleDetalle = function(button) {
    document.querySelectorAll('.detail-row').forEach(dr => dr.style.display = 'none');
    const row = button.closest('tr');
    const detailRow = row.nextElementSibling;
    if (detailRow && detailRow.classList.contains('detail-row')) {
        const reportId = button.getAttribute('data-id');
        getDoc(doc(window.db, "reportes", reportId)).then(docSnap => {
            if (docSnap.exists()) {
                const reporte = {id: docSnap.id, ...docSnap.data()};
                const tiposTraducidos = {
                    'malla-vial': 'Malla vial',
                    'alumbrado': 'Alumbrado',
                    'semaforos': 'Semáforos',
                    'aseo': 'Aseo'
                };
                let imgHtml = '';
                if (reporte.url_imagen) {
                    imgHtml = `<img src="${reporte.url_imagen}" alt="Evidencia">`;
                } else {
                    imgHtml = '<p>No hay imagen adjunta</p>';
                }
                detailRow.innerHTML = `<td colspan="6">
                    <div class="detail-content">
                        <div>${imgHtml}</div>
                        <div class="detail-data">
                            <h4>${tiposTraducidos[reporte.titulo] || reporte.titulo}</h4>
                            <p><strong>Ubicación:</strong> ${reporte.ubicacion}</p>
                            <p><strong>Descripción:</strong> ${reporte.descripcion}</p>
                            <p><strong>Estado:</strong> ${reporte.estado}</p>
                            <p><strong>Fecha:</strong> ${reporte.fecha}</p>
                            ${reporte.nombre ? `<p><strong>Nombre:</strong> ${reporte.nombre}</p>` : ''}
                            ${reporte.contacto ? `<p><strong>Contacto:</strong> ${reporte.contacto}</p>` : ''}
                        </div>
                    </div>
                </td>`;
                detailRow.style.display = 'table-row';
            }
        }).catch(error => {
            alert('Error al cargar detalle: ' + error.message);
        });
    }
}

// CHANGE REPORT STATUS
window.cambiarEstado = async function(reportId) {
    try {
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
        await updateDoc(doc(window.db, "reportes", reportId), {estado: estadoSeleccionado});
        window.cargarReportesAdmin();
        alert(`Estado del reporte ${reportId} cambiado a: ${estadoSeleccionado}`);
    } catch (error) {
        alert('Error al cambiar estado: ' + error.message);
    }
}

// DELETE REPORT
window.eliminarReporte = async function(reportId) {
    if (confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
        try {
            await deleteDoc(doc(window.db, "reportes", reportId));
            window.cargarReportesAdmin();
        } catch (error) {
            alert('Error al eliminar reporte: ' + error.message);
        }
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
