/**
 * Lógica principal de la aplicación
 * Sistema de Reservas - Casa José
 */

// ===== CONFIGURACIÓN GLOBAL =====
const MESAS_TOTALES = 20;
const HORARIOS_COMIDA = ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];
const HORARIOS_CENA = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00", "23:30"];

let reservas = [];
let reservaActualInfo = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha de hoy
    setHoy();

    // Cargar datos iniciales
    renderGrid();
    renderLista();
});

// ===== GESTIÓN DE PESTAÑAS =====
function switchTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Activar pestaña seleccionada
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    // Renderizar vista según pestaña
    if (tabName === 'cuadricula') {
        renderGrid();
    } else if (tabName === 'lista') {
        renderLista();
    }
}

// ===== FUNCIONES DE FECHA =====
function setHoy() {
    const hoy = API.obtenerFechaHoy();
    document.getElementById('gridFecha').value = hoy;
}

// ===== VISTA CUADRÍCULA =====
async function renderGrid() {
    const fecha = document.getElementById('gridFecha').value;
    if (!fecha) return;

    API.mostrarLoading('gridLoading', true);

    try {
        reservas = await API.obtenerReservas({ fecha });
        const table = document.getElementById('gridTable');

        let html = '<thead><tr><th class="time-header">Hora / Mesa</th>';

        // Encabezados de mesas
        for (let i = 1; i <= MESAS_TOTALES; i++) {
            html += `<th>M${i}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Horarios de comida
        HORARIOS_COMIDA.forEach(hora => {
            html += renderFilaHorario(hora, 'comida', 'comida-row');
        });

        // Separador
        html += '<tr><td colspan="' + (MESAS_TOTALES + 1) + '" style="height: 8px; background: #ccc;"></td></tr>';

        // Horarios de cena
        HORARIOS_CENA.forEach(hora => {
            html += renderFilaHorario(hora, 'cena', 'cena-row');
        });

        html += '</tbody>';
        table.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        API.mostrarToast('Error al cargar las reservas', 'error');
    } finally {
        API.mostrarLoading('gridLoading', false);
    }
}

function renderFilaHorario(hora, turno, clase) {
    let html = `<tr class="${clase}">`;
    html += `<td class="time-header">${hora} ${API.obtenerEmojiTurno(turno)}</td>`;

    for (let i = 1; i <= MESAS_TOTALES; i++) {
        const mesa = `M${i}`;
        html += renderCelda(turno, hora, mesa);
    }

    html += '</tr>';
    return html;
}

function renderCelda(turno, hora, mesa) {
    const fecha = document.getElementById('gridFecha').value;
    const reserva = obtenerReservaEnCelda(turno, hora, mesa);

    if (reserva) {
        const esCombinada = esMesaCombinada(reserva, mesa);
        const clase = esCombinada ? 'cell-combinada' : 'cell-reservada';
        const nombreCorto = reserva.nombre_cliente.split(' ')[0];

        return `<td class="${clase}" onclick="mostrarInfoReserva(${reserva.id})">${nombreCorto}</td>`;
    }

    return `<td class="cell-disponible" onclick="abrirModalReserva('${fecha}', '${turno}', '${hora}', '${mesa}')">+</td>`;
}

function obtenerReservaEnCelda(turno, hora, mesa) {
    return reservas.find(r => {
        if (r.turno !== turno || r.hora !== hora) return false;

        // Verificar mesa principal
        if (r.mesa === mesa) return true;

        // Verificar mesas combinadas
        if (r.mesas_combinadas) {
            const mesas = typeof r.mesas_combinadas === 'string'
                ? JSON.parse(r.mesas_combinadas)
                : r.mesas_combinadas;
            return mesas.includes(mesa);
        }

        return false;
    });
}

function esMesaCombinada(reserva, mesa) {
    if (!reserva.mesas_combinadas) return false;

    const mesas = typeof reserva.mesas_combinadas === 'string'
        ? JSON.parse(reserva.mesas_combinadas)
        : reserva.mesas_combinadas;

    return mesas.includes(mesa) && reserva.mesa !== mesa;
}

// ===== VISTA LISTA =====
async function renderLista() {
    API.mostrarLoading('listaLoading', true);

    try {
        reservas = await API.obtenerReservas();
        filtrarReservas();
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        API.mostrarToast('Error al cargar las reservas', 'error');
    } finally {
        API.mostrarLoading('listaLoading', false);
    }
}

function filtrarReservas() {
    const buscar = document.getElementById('buscarReserva').value.toLowerCase();
    const filtroFecha = document.getElementById('filtroFecha').value;

    let reservasFiltradas = [...reservas];

    // Aplicar filtro de búsqueda
    if (buscar) {
        reservasFiltradas = reservasFiltradas.filter(r =>
            r.nombre_cliente.toLowerCase().includes(buscar) ||
            r.telefono_cliente.includes(buscar)
        );
    }

    // Aplicar filtro de fecha
    if (filtroFecha) {
        reservasFiltradas = reservasFiltradas.filter(r => r.fecha === filtroFecha);
    }

    // Ordenar por fecha y hora (más recientes primero)
    reservasFiltradas.sort((a, b) => {
        const fechaA = new Date(`${a.fecha}T${a.hora}`);
        const fechaB = new Date(`${b.fecha}T${b.hora}`);
        return fechaB - fechaA;
    });

    const tbody = document.getElementById('listaReservasBody');

    if (reservasFiltradas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No hay reservas</td></tr>';
        return;
    }

    let html = '';
    reservasFiltradas.forEach(r => {
        const mesas = obtenerMesasTexto(r);
        const turnoIcon = API.obtenerEmojiTurno(r.turno);

        html += `
            <tr>
                <td>${API.formatearFechaHumana(r.fecha)}</td>
                <td>${turnoIcon} ${API.capitalizar(r.turno)}</td>
                <td style="font-family: monospace;">${r.hora}</td>
                <td><strong>${mesas}</strong></td>
                <td>${r.nombre_cliente}</td>
                <td style="font-family: monospace; font-size: 0.9em;">${r.telefono_cliente}</td>
                <td style="text-align: center;"><strong>${r.pax}</strong></td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">${r.notas || '-'}</td>
                <td>
                    <button class="btn btn-danger" onclick="eliminarReservaDirecta(${r.id}, '${r.nombre_cliente}')" style="padding: 5px 10px; font-size: 0.9em;">🗑️</button>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
}

function obtenerMesasTexto(reserva) {
    if (!reserva.mesas_combinadas) return reserva.mesa;

    const mesas = typeof reserva.mesas_combinadas === 'string'
        ? JSON.parse(reserva.mesas_combinadas)
        : reserva.mesas_combinadas;

    return mesas.join(', ');
}

// ===== MODAL DE RESERVA =====
function abrirModalReserva(fecha, turno, hora, mesa) {
    document.getElementById('reservaModal').classList.add('active');
    document.getElementById('reservaFecha').value = fecha;
    document.getElementById('reservaTurno').value = turno;
    document.getElementById('reservaHora').value = hora;
    document.getElementById('reservaMesa').value = mesa;
    document.getElementById('reservaNombre').value = '';
    document.getElementById('reservaTelefono').value = '';
    document.getElementById('reservaPax').value = '';
    document.getElementById('reservaNotas').value = '';

    // Actualizar título del modal
    document.querySelector('#reservaModal .modal-header h2').textContent =
        `📝 Nueva Reserva - ${mesa} (${turno} ${hora})`;
}

function cerrarModal() {
    document.getElementById('reservaModal').classList.remove('active');
}

async function guardarReserva(event) {
    event.preventDefault();

    const datos = {
        fecha: document.getElementById('reservaFecha').value,
        turno: document.getElementById('reservaTurno').value,
        hora: document.getElementById('reservaHora').value,
        mesa: document.getElementById('reservaMesa').value,
        nombreCliente: document.getElementById('reservaNombre').value,
        telefonoCliente: document.getElementById('reservaTelefono').value,
        pax: parseInt(document.getElementById('reservaPax').value),
        notas: document.getElementById('reservaNotas').value
    };

    try {
        await API.crearReserva(datos);
        cerrarModal();
        API.mostrarToast('✅ Reserva creada correctamente', 'success');

        // Actualizar vistas
        renderGrid();
        renderLista();
    } catch (error) {
        console.error('Error al guardar reserva:', error);
        API.mostrarToast(error.message || 'Error al crear la reserva', 'error');
    }
}

// ===== MODAL DE INFORMACIÓN =====
async function mostrarInfoReserva(id) {
    try {
        const reserva = await API.obtenerReservaPorId(id);
        reservaActualInfo = reserva;

        const mesas = obtenerMesasTexto(reserva);
        const turnoIcon = API.obtenerEmojiTurno(reserva.turno);

        const content = document.getElementById('infoReservaContent');
        content.innerHTML = `
            <h3>Información de la Reserva</h3>
            <p><strong>📅 Fecha:</strong> ${API.formatearFechaHumana(reserva.fecha)}</p>
            <p><strong>${turnoIcon} Turno:</strong> ${API.capitalizar(reserva.turno)}</p>
            <p><strong>🕐 Hora:</strong> ${reserva.hora}</p>
            <p><strong>🪑 Mesa(s):</strong> ${mesas}</p>
            <p><strong>👤 Nombre:</strong> ${reserva.nombre_cliente}</p>
            <p><strong>📞 Teléfono:</strong> ${reserva.telefono_cliente}</p>
            <p><strong>👥 PAX:</strong> ${reserva.pax} personas</p>
            ${reserva.notas ? `<p><strong>📝 Notas:</strong> ${reserva.notas}</p>` : ''}
        `;

        document.getElementById('infoModal').classList.add('active');
    } catch (error) {
        console.error('Error al obtener reserva:', error);
        API.mostrarToast('Error al cargar la información', 'error');
    }
}

function cerrarInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
    reservaActualInfo = null;
}

async function eliminarReservaActual() {
    if (!reservaActualInfo) return;

    if (!confirm(`¿Está seguro de eliminar la reserva de ${reservaActualInfo.nombre_cliente}?`)) {
        return;
    }

    try {
        await API.eliminarReserva(reservaActualInfo.id);
        cerrarInfoModal();
        API.mostrarToast('🗑️ Reserva eliminada correctamente', 'success');

        // Actualizar vistas
        renderGrid();
        renderLista();
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        API.mostrarToast('Error al eliminar la reserva', 'error');
    }
}

async function eliminarReservaDirecta(id, nombre) {
    if (!confirm(`¿Está seguro de eliminar la reserva de ${nombre}?`)) {
        return;
    }

    try {
        await API.eliminarReserva(id);
        API.mostrarToast('🗑️ Reserva eliminada correctamente', 'success');
        renderLista();
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        API.mostrarToast('Error al eliminar la reserva', 'error');
    }
}
