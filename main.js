/**
 * HABIT TRACKER PRO - Lógica de Negocio
 * Desarrollado por javilindj
 */

// 1. LISTA DE FRASES (Base de datos local simple)
const frases = [
    "El código limpio siempre parece que fue escrito por alguien a quien le importa.",
    "La disciplina es el puente entre tus metas y tus logros.",
    "Pequeños commits diarios construyen grandes aplicaciones.",
    "Tu única competencia es la persona que fuiste ayer.",
    "La constancia es la clave del éxito.",
    "No te detengas hasta sentirte orgulloso."
];

// 2. TAREAS INICIALES (Si el usuario es nuevo, cargamos estas)
// Usamos JSON.parse para convertir el texto de LocalStorage en un Array de JS
let misHabitos = JSON.parse(localStorage.getItem('misHabitosLista')) || ["Lectura 📚", "Ejercicio 🏋️", "Aprender Inglés", "Programar 💻"];

/**
 * Genera una frase aleatoria del array y la inyecta en el HTML
 */
function nuevaFrase() {
    const elementoFrase = document.getElementById('frase-motivadora');
    if (elementoFrase) {
        const index = Math.floor(Math.random() * frases.length);
        elementoFrase.innerText = "“" + frases[index] + "”";
    }
}

/**
 * Controla el cambio entre modo claro y oscuro
 */
function toggleDarkMode() {
    const body = document.body;
    const newTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    document.getElementById('dark-icon').innerText = newTheme === 'light' ? '🌙' : '☀️';
}

/**
 * Actualiza visualmente la barra de progreso superior
 */
function actualizarBarra() {
    const barra = document.getElementById('barra-progreso');
    if (!barra) return;
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const marcados = Array.from(checks).filter(c => c.checked).length;
    // Calculamos el porcentaje: (marcados / total) * 100
    const porcentaje = checks.length === 0 ? 0 : (marcados / checks.length * 100);
    barra.style.width = porcentaje + "%";
}

/**
 * Elimina un hábito del array y actualiza la vista
 */
function eliminarTarea(index) {
    if(confirm("¿Seguro que quieres eliminar este hábito?")) {
        misHabitos.splice(index, 1); // Elimina 1 elemento en la posición 'index'
        localStorage.setItem('misHabitosLista', JSON.stringify(misHabitos));
        cargarTareas();
    }
}

/**
 * Añade un nuevo hábito desde el input de texto
 */
function agregarTareaManual() {
    const input = document.getElementById('nueva-tarea');
    const valor = input.value.trim();
    if (valor) {
        misHabitos.push(valor);
        localStorage.setItem('misHabitosLista', JSON.stringify(misHabitos));
        input.value = ""; // Limpia el buscador
        cargarTareas();
    }
}

/**
 * Renderiza la lista de tareas en el DOM basándose en el array 'misHabitos'
 */
function cargarTareas() {
    const listaDiv = document.getElementById('lista-tareas');
    if (!listaDiv) return;
    listaDiv.innerHTML = ""; 

    const guardado = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    const fechaKey = new Date().toDateString(); 

    misHabitos.forEach((tarea, index) => {
        const div = document.createElement('div');
        div.className = 'tarea';
        
        const header = document.createElement('div');
        header.className = 'tarea-header';

        const check = document.createElement('input');
        check.type = 'checkbox';
        if (guardado[fechaKey] && guardado[fechaKey][tarea]) {
            check.checked = true;
            div.classList.add('completada');
        }

        check.onchange = () => {
            div.classList.toggle('completada');
            guardarProgreso(fechaKey, tarea, check.checked);
            actualizarBarra();
            renderCalendario();
            verificarConfeti();
        };

        const span = document.createElement('span');
        span.className = 'texto-tarea';
        span.innerText = tarea;

        const btnEliminar = document.createElement('button');
        btnEliminar.innerHTML = "&times;";
        btnEliminar.style.background = "none";
        btnEliminar.style.border = "none";
        btnEliminar.style.color="#ff4757";
        btnEliminar.style.cursor = "pointer";
        btnEliminar.onclick = () => { eliminarTarea(index); };

        header.appendChild(check); 
        header.appendChild(span); 
        header.appendChild(btnEliminar);
        div.appendChild(header);

        if (tarea.toLowerCase().includes("ejercicio")) {
            const inputD = document.createElement('input');
            inputD.className = "input-detalle";
            inputD.placeholder = "¿Qué has entrenado hoy?";
            inputD.value = guardado[fechaKey + "_detalle_" + tarea] || "";
            inputD.oninput = () => { guardarDetalle(fechaKey + "_detalle_" + tarea, inputD.value); };
            div.appendChild(inputD);
        }

        listaDiv.appendChild(div);
    });

    actualizarBarra();
    calcularRacha();
    renderCalendario();
}

/**
 * Lanza confeti si todas las tareas del día están completadas
 */
function verificarConfeti() {
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const marcados = Array.from(checks).filter(c => c.checked).length;
    if (marcados === checks.length && checks.length > 0) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

/**
 * Muestra el modal con lo que se hizo en un día pasado
 */
function mostrarDetallesDia(key, objetoFecha) {
    const modal = document.getElementById('modal-detalles');
    const lista = document.getElementById('modal-lista');
    const titulo = document.getElementById('modal-fecha-titulo');
    const guardado = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    
    titulo.innerText = objetoFecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    lista.innerHTML = "";

    const datosDia = guardado[key];
    if (!datosDia) {
        lista.innerHTML = "<p style='text-align:center; opacity:0.5'>Sin registros.</p>";
    } else {
        // Recorremos los hábitos guardados en esa fecha
        for (const [habito, completado] of Object.entries(datosDia)) {
            const item = document.createElement('div');
            item.className = "modal-item";
            const det = guardado[key + "_detalle_" + habito] || "";
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; width:100%">
                    <span style="font-weight:bold">${habito}</span>
                    <span>${completado ? '✅' : '❌'}</span>
                </div>
                ${det ? '<small style="color:var(--text-sec); margin-top:4px">📝 '+det+'</small>' : ''}
            `;
            lista.appendChild(item);
        }
    }
    modal.style.display = "flex";
}

function cerrarModal() { document.getElementById('modal-detalles').style.display = "none"; }

/**
 * Dibuja el calendario de consistencia
 */
function renderCalendario() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    grid.innerHTML = "";
    
    const guardado = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    const hoy = new Date();
    const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();

    for (let i = 1; i <= diasMes; i++) {
        const fD = new Date(hoy.getFullYear(), hoy.getMonth(), i);
        const key = fD.toDateString();
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.innerText = i;

        if (guardado[key]) {
            const comps = Object.values(guardado[key]).filter(v => v === true).length;
            if (comps >= misHabitos.length && misHabitos.length > 0) {
                dayDiv.classList.add('day-perfect'); 
            } else if (comps > 0) {
                dayDiv.classList.add('day-partial'); 
            }
        }
        dayDiv.onclick = () => mostrarDetallesDia(key, fD);
        grid.appendChild(dayDiv);
    }
}

/**
 * Gestión de Rachas (Streaks)
 */
function calcularRacha() {
    const guardado = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    let racha = 0, totalLogs = 0, f = new Date();
    
    Object.keys(guardado).forEach(k => { 
        if (!k.includes("_detalle_") && Object.values(guardado[k]).every(v => v === true)) totalLogs++; 
    });

    while (true) {
        const k = f.toDateString();
        if (guardado[k] && Object.values(guardado[k]).every(v => v === true)) { 
            racha++; 
            f.setDate(f.getDate() - 1); 
        } else {
            break;
        }
    }
    document.getElementById('racha-dias').innerText = racha;
    document.getElementById('total-completados').innerText = totalLogs;
}

/**
 * Persistencia: Guarda estado de checkboxes
 */
function guardarProgreso(f, n, e) {
    let d = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    if (!d[f]) d[f] = {}; 
    d[f][n] = e;
    localStorage.setItem('progresoHabitos', JSON.stringify(d));
    calcularRacha();
}

/**
 * Persistencia: Guarda texto de detalles
 */
function guardarDetalle(id, txt) {
    let d = JSON.parse(localStorage.getItem('progresoHabitos')) || {};
    d[id] = txt; 
    localStorage.setItem('progresoHabitos', JSON.stringify(d));
}

/**
 * Borra todo el LocalStorage (Reset total)
 */
function borrarTodo() {
    if(confirm("¿Estás seguro de que quieres borrar todo tu historial? Esta acción no se puede deshacer.")) {
        localStorage.clear();
        location.reload(); // Recarga la página para aplicar los cambios
    }
}

/**
 * FUNCIÓN DE ARRANQUE (Se ejecuta al cargar el DOM)
 */
function iniciarApp() {
    // Aplicar el tema guardado al cargar
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('dark-icon').innerText = savedTheme === 'light' ? '🌙' : '☀️';

    // Año del footer
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.innerText = new Date().getFullYear();

    // Fecha actual formateada
    const fechaSpan = document.getElementById('fecha');
    if (fechaSpan) {
        fechaSpan.innerText = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }

    // Título dinámico
    const tituloOriginal = document.title;
    window.onblur = () => { document.title = "¡No abandones tus hábitos! 🏃‍♂️"; };
    window.onfocus = () => { document.title = tituloOriginal; };

    nuevaFrase();
    cargarTareas();
}

// Escuchador que espera a que el HTML esté listo antes de ejecutar el JS
document.addEventListener('DOMContentLoaded', iniciarApp);