const IVA_TIPO = 0.21;
const PRECIOS_PR_BASE = {
    vestel_base: 550.0,
    pulsar_5m: 699.0,
    pulsar_7m: 799.0,
    pulsar_tri_5m: 750.0,
    pulsar_tri_7m: 850.0,
};
const PRECIOS_INST_BASE = {
    uni: 699.0,
    uni_gdp: 898.0,
    com_mismo: 899.0,
    com_mismo_gdp: 1098.0,
    com_distinto: 1087.79,
};
const DETALLES_INSTALACION = {
    uni: {
        titulo: 'Instalación en vivienda unifamiliar',
        descripcion:
            'Alcance definido en el argumentario oficial para chalets o adosados en los que el contador y el garaje comparten parcela.',
        puntos: [
            'Montaje, conexionado y legalización del nuevo circuito dedicado, con protecciones en origen y en la vivienda.',
            'Canalización hasta 20 m desde el cuadro eléctrico hasta el punto de recarga.',
            'Cableados libres de halógenos y dimensionados para Smart Mobility Hogar.',
            'Legalización con memoria técnica y entrega de la documentación al cliente.',
            'Servicio Power Boost opcional para gestión dinámica de potencia.',
        ],
    },
    uni_gdp: {
        titulo: 'Instalación en vivienda unifamiliar + GDP',
        descripcion:
            'Mismo contenido que la instalación unifamiliar estándar incorporando el Gestor Dinámico de Potencia (GDP).',
        puntos: [
            'Montaje, conexionado y legalización del circuito dedicado con protecciones completas.',
            'Canalización hasta 20 m y cableados libres de halógenos específicos para el punto de recarga.',
            'Instalación y configuración del GDP junto al cuadro general para equilibrar consumos.',
            'Legalización con memoria técnica y entrega de boletín.',
            'Servicio Power Boost opcional integrado con el GDP.',
        ],
        nota: 'El GDP permite aprovechar toda la potencia contratada evitando disparos del ICP al sumar consumos en la vivienda.',
    },
    com_mismo: {
        titulo: 'Instalación en garaje comunitario (mismo edificio)',
        descripcion:
            'Corresponde al escenario A del argumentario (garaje comunitario en la misma finca que la vivienda).',
        puntos: [
            'Montaje de canalización hasta 40 m por zonas comunes según normativa vigente.',
            'Montaje, conexionado y legalización del nuevo circuito con protecciones en origen y en la vivienda.',
            'Legalización mediante memoria técnica con documentación completa para el cliente.',
            'Cableados libres de halógenos preparados para Smart Mobility Hogar.',
            'Documentación y comunicación a la comunidad conforme al art. 17.5 de la LPH.',
            'Servicio Power Boost opcional.',
        ],
    },
    com_mismo_gdp: {
        titulo: 'Instalación en garaje comunitario + GDP (mismo edificio)',
        descripcion:
            'Incluye el paquete del escenario A añadiendo la instalación y puesta en marcha del Gestor Dinámico de Potencia.',
        puntos: [
            'Canalización hasta 40 m por zonas comunes con soportes y protecciones homologadas.',
            'Montaje y legalización del nuevo circuito con protecciones completas en origen y vivienda.',
            'Instalación del GDP junto al contador para priorizar la vivienda frente a la plaza.',
            'Documentación técnica, boletín y comunicación a la comunidad (art. 17.5 LPH).',
            'Servicio Power Boost opcional ligado al GDP.',
        ],
        nota: 'El GDP es imprescindible para compartir potencia sin aumentar la contratada y mantener la seguridad de la instalación.',
    },
    com_distinto: {
        titulo: 'Instalación en garaje comunitario (distinto edificio)',
        descripcion:
            'Pensado para plazas ubicadas en comunidades que no comparten edificio con la vivienda o el contador.',
        puntos: [
            'Incluye visita técnica in situ, estudio del trazado exterior y memoria valorada para comunidad y distribuidora.',
            'Gestión de permisos municipales/comunitarios y coordinación con terceros para canalizaciones especiales.',
            'Documentación completa (proyecto o memoria técnica, boletín y certificaciones de puesta en servicio).',
            'Estimación inicial hasta 40 m de línea: si el recorrido es mayor se recalcula tras la visita.',
        ],
        nota: 'El precio final se confirma después de la visita técnica debido a la complejidad fuera de la finca.',
    },
    gdp: {
        titulo: 'Gestor Dinámico de Potencia (GDP)',
        descripcion:
            'Equipo que monitoriza el consumo de la vivienda y ajusta automáticamente la potencia disponible para el cargador.',
        puntos: [
            'Evita cortes al equilibrar el uso del PR con el resto de electrodomésticos.',
            'Permite aprovechar toda la potencia contratada sin ampliarla.',
            'Se instala junto al cuadro general y se integra con Power Boost cuando el cliente lo contrata.',
        ],
    },
};
const PRECIO_GDP_INFO = 240.79;
const PRECIO_MOVES_GENERAL_BASE = 199.0;
const PRECIO_MOVES_CLIENTE_BASE = 149.0;
const DTO_MOVES_PROMO_BASE = 100.0;
let estado = {
    tipoInstalacion: 'none',
    cargador: 'pulsar',
    fase: 'mono',
    clienteIberdrola: true,
    promoPack: false,
    moves: true,
    manguera7m: true,
    ipack: true,
};
function formatEUR(v) {
    return (
        v.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        ' €'
    );
}
function limpiarUI() {
    document.getElementById('precioSinIva').textContent = '0,00 €';
    document.getElementById('precioIva').textContent = '0,00 €';
    document.getElementById('precioTotal').textContent = '0,00 €';
    document.getElementById('precioTotalResumen').textContent = '0,00 €';
    document.getElementById('desglose').innerHTML = '';
    const promo = document.getElementById('promoBox');
    if (promo) promo.style.display = 'none';
    const movesLinea = document.getElementById('precioMovesLinea');
    if (movesLinea) movesLinea.textContent = '';
    const mangueraLinea = document.getElementById('precioMangueraLinea');
    if (mangueraLinea) mangueraLinea.textContent = '';
    const triBadge = document.getElementById('triBadge');
    if (triBadge) triBadge.classList.add('hidden');
    const triNote = document.getElementById('triNote');
    if (triNote) triNote.style.display = '';
}
function setTipoInstalacion(valor) {
    estado.tipoInstalacion = valor;
    const aviso = document.getElementById('avisoGarajeDistinto');
    if (aviso) aviso.classList.toggle('hidden', valor !== 'com_distinto');
    updateCalc();
}
function setCargador(tipo) {
    estado.cargador = tipo;
    document.getElementById('btnVestel').classList.toggle('active-purple', tipo === 'vestel');
    document.getElementById('btnPulsar').classList.toggle('active-purple', tipo === 'pulsar');
    const chkM = document.getElementById('checkManguera');
    const mangueraLinea = document.getElementById('precioMangueraLinea');
    const phaseWrap = document.getElementById('pulsarPhaseWrapper');
    if (tipo === 'vestel') {
        chkM.checked = false;
        chkM.disabled = true;
        estado.manguera7m = false;
        if (mangueraLinea) mangueraLinea.textContent = 'No disponible con Vestel';
        phaseWrap.classList.add('hidden');
    } else {
        chkM.disabled = false;
        phaseWrap.classList.remove('hidden');
        if (mangueraLinea)
            mangueraLinea.textContent = chkM.checked
                ? '+0,00 € (incluido en Pulsar 7 m)'
                : '+0,00 € (versión 5 m)';
    }
    updateCalc();
    showChargerInfo(tipo);
}
function setFase(fase) {
    estado.fase = fase;
    document.getElementById('btnMono').classList.toggle('active', fase === 'mono');
    document.getElementById('btnTri').classList.toggle('active', fase === 'tri');
    updateCalc();
}
function updateCalc() {
    const chkCliente = document.getElementById('checkCliente');
    const chkPromo = document.getElementById('checkPromoPack');
    const chkIPack = document.getElementById('checkIPack');
    const chkManguera = document.getElementById('checkManguera');
    let nuevoCliente = chkCliente.checked;
    let nuevoPromo = chkPromo.checked;
    if (nuevoCliente && nuevoPromo) {
        if (estado.clienteIberdrola && !estado.promoPack) {
            nuevoCliente = false;
            chkCliente.checked = false;
        } else if (!estado.clienteIberdrola && estado.promoPack) {
            nuevoPromo = false;
            chkPromo.checked = false;
        } else {
            nuevoPromo = false;
            chkPromo.checked = false;
        }
    }
    if (nuevoPromo && !chkIPack.checked) {
        chkIPack.checked = true;
    }
    estado.clienteIberdrola = nuevoCliente;
    estado.promoPack = nuevoPromo;
    estado.moves = document.getElementById('checkMoves').checked;
    if (estado.cargador === 'vestel') {
        chkManguera.checked = false;
        chkManguera.disabled = true;
        estado.manguera7m = false;
    } else {
        chkManguera.disabled = false;
        estado.manguera7m = chkManguera.checked;
    }
    estado.ipack = document.getElementById('checkIPack').checked;
    if (!estado.ipack && estado.promoPack) {
        estado.promoPack = false;
        chkPromo.checked = false;
    }
    calcularPresupuesto();
    actualizarAvisoTrifasico();
}
function calcularPresupuesto() {
    if (estado.tipoInstalacion === 'none') {
        const aviso = document.getElementById('avisoGarajeDistinto');
        if (aviso) aviso.classList.add('hidden');
        limpiarUI();
        return;
    }
    cerrarInstalacionInfo();
    let items = [];
    let baseTotal = 0;
    let prBase = 0;
    let conceptoPR = '';
    if (estado.cargador === 'vestel') {
        prBase = PRECIOS_PR_BASE.vestel_base;
        conceptoPR = 'Punto de Recarga Vestel Basic 7,4 kW Tipo 2 5 m';
    } else if (estado.fase === 'tri') {
        if (estado.manguera7m) {
            prBase = PRECIOS_PR_BASE.pulsar_tri_7m;
            conceptoPR = 'Pulsar Max Trifásico 22 kW Tipo 2 · 7 m';
        } else {
            prBase = PRECIOS_PR_BASE.pulsar_tri_5m;
            conceptoPR = 'Pulsar Max Trifásico 22 kW Tipo 2 · 5 m';
        }
    } else if (estado.manguera7m) {
        prBase = PRECIOS_PR_BASE.pulsar_7m;
        conceptoPR = 'Pulsar Max Monofásico 7,4 kW Tipo 2 · 7 m';
    } else {
        prBase = PRECIOS_PR_BASE.pulsar_5m;
        conceptoPR = 'Pulsar Max Monofásico 7,4 kW Tipo 2 · 5 m';
    }
    baseTotal += prBase;
    items.push({ concepto: conceptoPR, importe: prBase, destacado: true });
    const tipo = estado.tipoInstalacion;
    let instBase = PRECIOS_INST_BASE[tipo] || 0;
    let conceptoInst = '';
    const esUni = tipo === 'uni' || tipo === 'uni_gdp';
    const incluyeGDP = tipo === 'uni_gdp' || tipo === 'com_mismo_gdp';
    if (esUni && !incluyeGDP) conceptoInst = 'Paquete instalación Vivienda Unifamiliar';
    else if (esUni && incluyeGDP) conceptoInst = 'Paquete instalación Vivienda Unifamiliar + GDP';
    else if (tipo === 'com_mismo') conceptoInst = 'Paquete instalación Garaje Comunitario (mismo edificio)';
    else if (tipo === 'com_mismo_gdp')
        conceptoInst = 'Paquete instalación Garaje Comunitario + GDP (mismo edificio)';
    else if (tipo === 'com_distinto') conceptoInst = 'Paquete instalación Garaje Comunitario (distinto edificio)';
    const esPulsarTrifasico = estado.cargador === 'pulsar' && estado.fase === 'tri';
    const infoKeyInstalacion = tipo;
    if (esPulsarTrifasico) {
        items.push({
            concepto: `${conceptoInst} (a determinar in situ para Pulsar Max trifásico)`,
            importeTexto: '—',
            infoKey: infoKeyInstalacion,
        });
        instBase = 0;
    } else if (instBase > 0) {
        baseTotal += instBase;
        items.push({ concepto: conceptoInst, importe: instBase, destacado: true, infoKey: infoKeyInstalacion });
    }
    if (incluyeGDP) {
        items.push({
            concepto: 'Gestor Dinámico de Potencia (incluido en la instalación)',
            importeTexto: `${formatEUR(PRECIO_GDP_INFO)} IVA incl. (no suma, ya incluido en el paquete)`,
            infoKey: 'gdp',
        });
    }
    const promoActiva = estado.promoPack && estado.ipack;
    if (promoActiva) {
        const dtoPR = +(prBase * 0.1).toFixed(2);
        baseTotal -= dtoPR;
        items.push({ concepto: 'Descuento 10 % Punto de Recarga', importe: -dtoPR, descuento: true });
        if (instBase > 0) {
            const dtoInst = +(instBase * 0.1).toFixed(2);
            baseTotal -= dtoInst;
            items.push({ concepto: 'Descuento 10 % Paquete de instalación', importe: -dtoInst, descuento: true });
        }
    }
    if (estado.moves) {
        if (estado.clienteIberdrola && !estado.promoPack) {
            baseTotal += PRECIO_MOVES_CLIENTE_BASE;
            items.push({ concepto: 'Gestión Ayudas Smart Mobility (MOVES III)', importe: PRECIO_MOVES_CLIENTE_BASE });
        } else if (promoActiva && !estado.clienteIberdrola) {
            baseTotal += PRECIO_MOVES_GENERAL_BASE;
            items.push({ concepto: 'Gestión Ayudas Smart Mobility (MOVES III)', importe: PRECIO_MOVES_GENERAL_BASE });
            baseTotal -= DTO_MOVES_PROMO_BASE;
            items.push({ concepto: 'Descuento Gestión Ayudas MOVES III (oferta 10 %)', importe: -DTO_MOVES_PROMO_BASE, descuento: true });
        } else {
            baseTotal += PRECIO_MOVES_GENERAL_BASE;
            items.push({ concepto: 'Gestión Ayudas Smart Mobility (MOVES III)', importe: PRECIO_MOVES_GENERAL_BASE });
        }
    }
    if (estado.ipack) {
        items.push({ concepto: 'Servicio i+Pack Mobility (no incluido en el total)', importeTexto: '12,95 €/mes + IVA' });
    }
    const baseSinIva = +baseTotal.toFixed(2);
    const ivaImporte = +(baseSinIva * IVA_TIPO).toFixed(2);
    const totalConIva = +(baseSinIva + ivaImporte).toFixed(2);
    document.getElementById('precioSinIva').textContent = formatEUR(baseSinIva);
    document.getElementById('precioIva').textContent = formatEUR(ivaImporte);
    document.getElementById('precioTotal').textContent = formatEUR(totalConIva);
    document.getElementById('precioTotalResumen').textContent = formatEUR(totalConIva);
    const promo = document.getElementById('promoBox');
    if (promo) promo.style.display = promoActiva ? 'block' : 'none';
    const precioMovesBaseLinea =
        estado.clienteIberdrola && !estado.promoPack ? PRECIO_MOVES_CLIENTE_BASE : PRECIO_MOVES_GENERAL_BASE;
    let textoMoves = '+';
    if (estado.moves) {
        let neto = precioMovesBaseLinea;
        if (promoActiva && !estado.clienteIberdrola) neto -= DTO_MOVES_PROMO_BASE;
        textoMoves += formatEUR(neto);
    } else {
        if (promoActiva && !estado.clienteIberdrola) textoMoves += formatEUR(precioMovesBaseLinea - DTO_MOVES_PROMO_BASE);
        else textoMoves += formatEUR(precioMovesBaseLinea);
    }
    document.getElementById('precioMovesLinea').textContent = textoMoves;
    const mangueraLinea = document.getElementById('precioMangueraLinea');
    if (estado.cargador === 'vestel') {
        if (mangueraLinea) mangueraLinea.textContent = 'No disponible con Vestel';
    } else if (mangueraLinea) {
        mangueraLinea.textContent = estado.manguera7m
            ? '+0,00 € (incluido en Pulsar 7 m)'
            : '+0,00 € (versión 5 m)';
    }
    const desgloseHTML = items
        .map((i) => {
            let importeStr = '';
            let clases = 'desglose-precio';
            if (typeof i.importe === 'number') {
                importeStr = formatEUR(i.importe);
                if (i.importe < 0) clases += ' negativo';
            } else if (i.importeTexto) {
                importeStr = i.importeTexto;
            }
            if (i.descuento) clases += ' descuento';
            const infoBtn = i.infoKey
                ? `<button type="button" class="info-btn" data-info-key="${i.infoKey}" aria-label="Qué incluye esta instalación">ℹ️</button>`
                : '';
            return `
                <div class="desglose-item ${i.destacado ? 'destacado' : ''}">
                    <div class="desglose-concepto-wrapper">
                        <span class="desglose-concepto">${i.concepto}</span>
                        ${infoBtn}
                    </div>
                    <span class="${clases}">${importeStr}</span>
                </div>
            `;
        })
        .join('');
    document.getElementById('desglose').innerHTML = desgloseHTML;
}
function mostrarInfoInstalacion(key) {
    if (!key) return;
    const detalle = DETALLES_INSTALACION[key];
    const panel = document.getElementById('instalacionInfoPanel');
    const titulo = document.getElementById('instalacionInfoTitle');
    const contenido = document.getElementById('instalacionInfoContent');
    if (!detalle || !panel || !titulo || !contenido) return;
    titulo.textContent = detalle.titulo;
    let html = '';
    if (detalle.descripcion) {
        html += `<p>${detalle.descripcion}</p>`;
    }
    if (Array.isArray(detalle.puntos) && detalle.puntos.length) {
        const items = detalle.puntos.map((p) => `<li>${p}</li>`).join('');
        html += `<ul>${items}</ul>`;
    }
    if (detalle.nota) {
        html += `<p class="instalacion-info-note">${detalle.nota}</p>`;
    }
    contenido.innerHTML = html;
    panel.classList.remove('hidden');
}
function cerrarInstalacionInfo() {
    const panel = document.getElementById('instalacionInfoPanel');
    if (!panel) return;
    panel.classList.add('hidden');
    const contenido = document.getElementById('instalacionInfoContent');
    if (contenido) contenido.innerHTML = '';
    const titulo = document.getElementById('instalacionInfoTitle');
    if (titulo) titulo.textContent = '';
}
function showChargerInfo(tipo) {
    const box = document.getElementById('chargerInfoBox');
    const chipVestel = document.getElementById('chipVestel');
    const chipPulsar = document.getElementById('chipPulsar');
    if (!box || !chipVestel || !chipPulsar) return;
    chipVestel.classList.toggle('active-chip', tipo === 'vestel');
    chipPulsar.classList.toggle('active-chip', tipo === 'pulsar');
    let html = '';
    if (tipo === 'vestel') {
        html = `
            <strong>Vestel EVC04</strong>
            <ul>
                <li>Equipo doméstico robusto con manguera integrada de 5 m.</li>
                <li>Disponible con conector Tipo 2, hasta 7,4 kW en monofásico y 22 kW en trifásico.</li>
                <li>Grados de protección IP54 / IK10: apto para interior y exterior.</li>
                <li>Incluye detector de fugas de continua y cumple normativa Z.E. Ready 1.4.</li>
                <li>Acceso mediante tarjetas RFID para bloquear/desbloquear el equipo.</li>
                <li>No es “smart”: no se gestiona desde app, ideal para quien busca algo sencillo y económico.</li>
            </ul>
            <p class="info-detail-note">Recomendado para clientes que priorizan precio y robustez frente a funciones avanzadas.</p>
        `;
    } else {
        html = `
            <strong>Wallbox Pulsar Max</strong>
            <ul>
                <li>Cargador “smart” con manguera integrada (5 m u opcional 7 m) y conector Tipo 2.</li>
                <li>Gestión completa desde app Wallbox (Wi-Fi y Bluetooth): programar carga, ver histórico, bloquear equipo, etc.</li>
                <li>Compatible con control por voz (Alexa / Google Assistant).</li>
                <li>Diseño mejorado: carcasa negro mate antiarañazos, menor peso y mejor integración estética en garaje.</li>
                <li>Mayor protección: IP55 (polvo/agua) e IK10 (resistencia a golpes y caídas).</li>
                <li>Rango de temperatura ampliado: de -30 ºC a 50 ºC.</li>
                <li>Incluye placa posterior deslizante y soporte integrado para enrollar la manguera.</li>
                <li>Preparado para balanceo de carga de hasta 100 cargadores y adaptado a normativa de ciberseguridad RED 2025.</li>
            </ul>
            <p class="info-detail-note">Ideal para clientes que buscan un equipo premium, conectado y preparado para futuras ampliaciones.</p>
        `;
    }
    box.innerHTML = html;
    box.style.display = 'block';
}
function toggleSSAA() {
    const body = document.getElementById('ssaaBody');
    const acc = document.getElementById('accordionSSAA');
    const toggle = document.getElementById('accordionToggle');
    if (!body || !acc || !toggle) return;
    const open = body.style.display === 'block';
    body.style.display = open ? 'none' : 'block';
    acc.classList.toggle('open', !open);
    toggle.setAttribute('aria-expanded', (!open).toString());
}
function actualizarAvisoTrifasico() {
    const es = estado.cargador === 'pulsar' && estado.fase === 'tri';
    const triBadge = document.getElementById('triBadge');
    const triNote = document.getElementById('triNote');
    if (triBadge) triBadge.classList.toggle('hidden', !es);
    if (triNote) triNote.style.display = es ? 'block' : '';
}
updateCalc();
showChargerInfo(estado.cargador);
document.getElementById('pulsarPhaseWrapper').classList.toggle('hidden', estado.cargador !== 'pulsar');
actualizarAvisoTrifasico();
const desgloseContainer = document.getElementById('desglose');
if (desgloseContainer) {
    desgloseContainer.addEventListener('click', (event) => {
        const btn = event.target.closest('.info-btn');
        if (!btn) return;
        const key = btn.getAttribute('data-info-key');
        mostrarInfoInstalacion(key);
    });
}
