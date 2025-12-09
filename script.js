
// --- CONSTANTES Y CONFIGURACIÓN ---
const COLORS = {
    bg: '#050a14',
    node: '#1a2c4e',
    nodeActive: 'rgba(0, 243, 255, 0.2)',
    nodeFinal: 'rgba(0, 255, 157, 0.2)',
    nodeError: 'rgba(255, 0, 85, 0.2)',
    border: '#40c4ff',
    borderActive: '#00f3ff',
    borderFinal: '#00ff9d',
    borderError: '#ff0055',
    text: '#e0e6ed',
    edge: '#475569',
    edgeActive: '#bc13fe'
};

// --- CLASE AUTOMATA (MOTOR LÓGICO) ---
class Automaton {
    constructor(config) {
        this.states = config.states; // { id: { x, y, isFinal, isStart, label } }
        this.transitions = config.transitions; // { from: { input: to } }
        this.startState = config.startState;
        this.currentState = this.startState;
        this.history = [];
        this.grammar = config.grammar || [];
        this.description = config.description;
    }

    reset() {
        this.currentState = this.startState;
        this.history = [];
        return this.currentState;
    }

    /**
     * Realiza una transición dado un símbolo de entrada.
     * Retorna un objeto con el resultado de la transición.
     */
    step(symbol) {
        const stateConfig = this.transitions[this.currentState];
        let nextState = null;
        let error = null;

        if (stateConfig) {
            // Intentar coincidencia exacta
            if (stateConfig[symbol]) {
                nextState = stateConfig[symbol];
            } else {
                // Intentar coincidencia por grupos (ej: 'digit', 'letter')
                for (const key in stateConfig) {
                    if (this.matchSymbol(key, symbol)) {
                        nextState = stateConfig[key];
                        break;
                    }
                }
            }
        }

        if (nextState) {
            const transitionInfo = {
                from: this.currentState,
                to: nextState,
                symbol: symbol,
                valid: true
            };
            this.currentState = nextState;
            this.history.push(transitionInfo);
            return transitionInfo;
        } else {
            // Error: Transición no definida
            // Generar mensaje de error específico
            const expected = this.getExpectedSymbols(stateConfig);
            error = `Carácter inválido '${symbol}'. Se esperaba: ${expected}`;
            return { valid: false, error: error, from: this.currentState, symbol: symbol };
        }
    }

    matchSymbol(pattern, symbol) {
        if (pattern === symbol) return true;
        if (pattern === 'digit' && /[0-9]/.test(symbol)) return true;
        if (pattern === 'letter' && /[a-zA-Z]/.test(symbol)) return true;

        // Patrones específicos del ejercicio de email
        if (pattern === '[a-z0-9]' && /[a-z0-9]/i.test(symbol)) return true;
        if (pattern === '[.-]' && /[.\-]/.test(symbol)) return true;
        if (pattern === '_' && symbol === '_') return true;

        return false;
    }

    getExpectedSymbols(stateConfig) {
        if (!stateConfig) return "nada (estado pozo)";
        const keys = Object.keys(stateConfig);
        const readableKeys = keys.map(k => {
            if (k === '[a-z0-9]') return "letra o número";
            if (k === '[.-]') return "punto o guion";
            if (k === '_') return "guion bajo";
            if (k === '@') return "arroba '@'";
            if (k === '.') return "punto '.'";
            if (k === '-') return "guion '-'";
            if (['1', '2', '3'].includes(k)) return `'${k}'`;
            return `'${k}'`;
        });
        return readableKeys.join(' o ');
    }

    isAccepted() {
        return this.states[this.currentState].isFinal;
    }
}

// --- DEFINICIONES DE AUTÓMATAS ---

const EMAIL_DFA_CONFIG = {
    description: "Validador de Email Estricto",
    // Coordenadas normalizadas (0-1) para el canvas
    states: {
        q0: { x: 0.05, y: 0.5, isStart: true, label: 'Inicio' },
        q1: { x: 0.2, y: 0.5, label: 'Local' },
        q2: { x: 0.2, y: 0.2, label: 'Sep' },       // Arriba de Local
        q3: { x: 0.35, y: 0.5, label: '@' },
        q4: { x: 0.5, y: 0.5, label: 'Dom1' },
        q5: { x: 0.5, y: 0.2, label: 'Guion' },     // Arriba de Dom1
        q6: { x: 0.65, y: 0.5, label: 'Punto' },    // Punto obligatorio
        q7: { x: 0.8, y: 0.5, isFinal: true, label: 'Ext' },
        q8: { x: 0.8, y: 0.2, label: 'SepExt' }     // Arriba de Ext
    },
    transitions: {
        // LetraNum = [a-z0-9], Sep = [.-], GuionBajo = [_], Arroba = [@]
        // q0: Inicio. Solo acepta LetraNum o GuionBajo.
        q0: { '[a-z0-9]': 'q1', '_': 'q1' },

        // q1: Leyendo local-part.
        q1: { '[a-z0-9]': 'q1', '_': 'q1', '[.-]': 'q2', '@': 'q3' },

        // q2: Leído un separador en local-part. Debe seguir LetraNum o _.
        q2: { '[a-z0-9]': 'q1', '_': 'q1' },

        // q3: Leído @. Debe seguir LetraNum (inicio de dominio).
        q3: { '[a-z0-9]': 'q4' },

        // q4: Leyendo primera parte del dominio.
        q4: { '[a-z0-9]': 'q4', '-': 'q5', '.': 'q6' },

        // q5: Leído guion en dominio pre-punto. Debe seguir LetraNum.
        q5: { '[a-z0-9]': 'q4' },

        // q6: Leído punto obligatorio. Debe seguir LetraNum (extensión).
        q6: { '[a-z0-9]': 'q7' },

        // q7: Extensión (Aceptación).
        q7: { '[a-z0-9]': 'q7', '[.-]': 'q8' },

        // q8: Separador en extensión. Debe seguir LetraNum.
        q8: { '[a-z0-9]': 'q7' }
    },
    startState: 'q0',
    grammar: [
        "Sv -> LetraNum Q1 | _ Q1",
        "Q1 -> LetraNum Q1 | _ Q1 | Sep Q2 | @ Q3",
        "Q2 -> LetraNum Q1 | _ Q1",
        "Q3 -> LetraNum Q4",
        "Q4 -> LetraNum Q4 | - Q5 | . Q6",
        "Q5 -> LetraNum Q4",
        "Q6 -> LetraNum Q7",
        "Q7 -> LetraNum Q7 | Sep Q8",
        "Q8 -> LetraNum Q7"
    ]
};

const MODULO3_DFA_CONFIG = {
    description: "Suma de Dígitos Módulo 3",
    states: {
        q0: { x: 0.5, y: 0.2, isStart: true, isFinal: true, label: 'Res 0' },
        q1: { x: 0.8, y: 0.8, label: 'Res 1' },
        q2: { x: 0.2, y: 0.8, label: 'Res 2' }
    },
    transitions: {
        q0: { '1': 'q1', '2': 'q2', '3': 'q0' },
        q1: { '1': 'q2', '2': 'q0', '3': 'q1' },
        q2: { '1': 'q0', '2': 'q1', '3': 'q2' }
    },
    startState: 'q0',
    grammar: [
        "S -> 1 A | 2 B | 3 S | ε",
        "A -> 1 B | 2 S | 3 A",
        "B -> 1 S | 2 A | 3 B"
    ]
};

// --- RENDERER (VISUALIZACIÓN) ---
class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.automaton = null;
        this.activeState = null;
        this.animating = false;
        this.pulsePhase = 0;

        // Iniciar loop de renderizado
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    resize() {
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = this.canvas.parentElement.clientHeight;
    }

    setAutomaton(automaton) {
        this.automaton = automaton;
        this.activeState = automaton.currentState;
    }

    setActiveState(stateId) {
        this.activeState = stateId;
    }

    loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.automaton) {
            this.pulsePhase += 0.05;
            this.drawTransitions();
            this.drawStates();
        }

        requestAnimationFrame(this.loop);
    }

    getCoords(stateId) {
        const s = this.automaton.states[stateId];
        return {
            x: s.x * this.canvas.width,
            y: s.y * this.canvas.height
        };
    }

    drawStates() {
        for (const [id, state] of Object.entries(this.automaton.states)) {
            const pos = this.getCoords(id);
            const isActive = id === this.activeState;
            const isFinal = state.isFinal;
            const isStart = state.isStart;

            // Configurar estilos según estado
            let color = COLORS.node;
            let borderColor = COLORS.border;
            let glow = 0;

            if (isActive) {
                color = COLORS.nodeActive;
                borderColor = COLORS.borderActive;
                glow = 15 + Math.sin(this.pulsePhase) * 5; // Efecto de pulso
            } else if (isFinal) {
                borderColor = COLORS.borderFinal;
            }

            // Dibujar Glow
            if (glow > 0) {
                this.ctx.shadowBlur = glow;
                this.ctx.shadowColor = borderColor;
            } else {
                this.ctx.shadowBlur = 0;
            }

            // Dibujar Nodo
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.lineWidth = isActive ? 3 : 2;
            this.ctx.strokeStyle = borderColor;
            this.ctx.stroke();

            // Doble círculo para estado final
            if (isFinal) {
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
                this.ctx.strokeStyle = borderColor;
                this.ctx.stroke();
            }

            // Flecha de inicio
            if (isStart) {
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x - 45, pos.y);
                this.ctx.lineTo(pos.x - 30, pos.y);
                this.ctx.strokeStyle = COLORS.text;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                // Punta
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x - 35, pos.y - 5);
                this.ctx.lineTo(pos.x - 30, pos.y);
                this.ctx.lineTo(pos.x - 35, pos.y + 5);
                this.ctx.stroke();
            }

            // Etiqueta
            this.ctx.fillStyle = COLORS.text;
            this.ctx.font = "14px 'Fira Code'";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.shadowBlur = 0; // Reset shadow for text
            this.ctx.fillText(state.label || id, pos.x, pos.y);
        }
    }

    drawTransitions() {
        const transitions = this.automaton.transitions;
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = "12px 'Fira Code'";

        for (const [fromId, trans] of Object.entries(transitions)) {
            const fromPos = this.getCoords(fromId);

            for (const [symbol, toId] of Object.entries(trans)) {
                const toPos = this.getCoords(toId);

                this.ctx.beginPath();
                this.ctx.strokeStyle = COLORS.edge;
                this.ctx.fillStyle = COLORS.text;
                this.ctx.lineWidth = 1;

                // Detectar si es self-loop
                if (fromId === toId) {
                    // Dibujar arco sobre el nodo
                    this.ctx.beginPath();
                    this.ctx.arc(fromPos.x, fromPos.y - 25, 20, Math.PI, 0);
                    this.ctx.stroke();
                    // Texto
                    this.ctx.fillText(this.formatSymbol(symbol), fromPos.x, fromPos.y - 55);
                } else {
                    // Línea curva cuadrática para evitar superposición si hay ida y vuelta
                    const midX = (fromPos.x + toPos.x) / 2;
                    const midY = (fromPos.y + toPos.y) / 2;

                    // Vector dirección
                    const dx = toPos.x - fromPos.x;
                    const dy = toPos.y - fromPos.y;

                    // Offset para curvatura
                    let offsetX = -dy * 0.2;
                    let offsetY = dx * 0.2;

                    // Ajuste simple para evitar colisiones
                    if (toId < fromId) {
                        offsetX = -offsetX;
                        offsetY = -offsetY;
                    }

                    const cpX = midX + offsetX;
                    const cpY = midY + offsetY;

                    this.ctx.beginPath();
                    this.ctx.moveTo(fromPos.x, fromPos.y);
                    this.ctx.quadraticCurveTo(cpX, cpY, toPos.x, toPos.y);
                    this.ctx.stroke();

                    // Flecha en el medio (aproximado)
                    const t = 0.5;
                    // Texto en el punto de control
                    this.ctx.fillStyle = '#94a3b8';
                    this.ctx.fillText(this.formatSymbol(symbol), cpX, cpY);
                }
            }
        }
    }

    formatSymbol(s) {
        if (s.startsWith('[')) return 'char'; // Simplificar regex visualmente
        return s;
    }
}

// --- CONTROLADOR DE LA APLICACIÓN ---
class App {
    constructor() {
        this.renderer = new CanvasRenderer('automatonCanvas');
        this.currentModule = 'email';
        this.speed = 1000; // ms
        this.isPlaying = false;

        // Elementos UI
        this.els = {
            input: document.getElementById('inputString'),
            status: document.getElementById('validationStatus'),
            grammar: document.getElementById('grammarOutput'),
            log: document.getElementById('logConsole'),
            speedSlider: document.getElementById('speedSlider'),
            validateBtn: document.getElementById('validateBtn'),
            stepBtn: document.getElementById('stepBtn'),
            resetBtn: document.getElementById('resetBtn'),
            navBtns: document.querySelectorAll('.nav-btn'),
            vizTitle: document.getElementById('vizTitle'),
            grammarBtn: document.getElementById('grammarBtn'),
            grammarModal: document.getElementById('grammarModal'),
            closeModal: document.getElementById('closeModal')
        };

        this.initListeners();
        this.loadModule('email');
    }

    initListeners() {
        this.els.navBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const module = e.currentTarget.dataset.module;
                this.loadModule(module);
                // Actualizar estado activo de UI
                this.els.navBtns.forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        this.els.validateBtn.addEventListener('click', () => this.runValidation(true));
        this.els.stepBtn.addEventListener('click', () => this.stepForward());
        this.els.resetBtn.addEventListener('click', () => this.reset());
        this.els.speedSlider.addEventListener('input', (e) => {
            // Mapear 1-5 a 1000ms-200ms
            const val = parseFloat(e.target.value);
            this.speed = 1000 / val;
        });

        // Listeners del Modal
        this.els.grammarBtn.addEventListener('click', () => {
            this.els.grammarModal.classList.add('visible');
        });

        this.els.closeModal.addEventListener('click', () => {
            this.els.grammarModal.classList.remove('visible');
        });

        this.els.grammarModal.addEventListener('click', (e) => {
            if (e.target === this.els.grammarModal) {
                this.els.grammarModal.classList.remove('visible');
            }
        });

        // Validación con Enter
        this.els.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.runValidation(true);
        });
    }

    loadModule(moduleName) {
        this.currentModule = moduleName;
        this.reset();

        let config;
        if (moduleName === 'email') {
            config = EMAIL_DFA_CONFIG;
            this.els.vizTitle.innerText = "AFD: VALIDACIÓN DE EMAIL";
            this.els.input.placeholder = "ej: usuario@dominio.com";
        } else {
            config = MODULO3_DFA_CONFIG;
            this.els.vizTitle.innerText = "AFD: SUMA MÓDULO 3";
            this.els.input.placeholder = "ej: 12312";
        }

        this.automaton = new Automaton(config);
        this.renderer.setAutomaton(this.automaton);
        this.renderGrammar(config.grammar);
        this.log(`Módulo cargado: ${config.description}`, 'system');
    }

    renderGrammar(rules) {
        this.els.grammar.innerHTML = rules.map(r => {
            const [lhs, rhs] = r.split('->');
            return `<div class="grammar-rule">
                <span class="lhs">${lhs}</span>
                <span class="arrow">→</span>
                <span class="rhs">${rhs}</span>
            </div>`;
        }).join('');
    }

    reset() {
        if (this.automaton) this.automaton.reset();
        if (this.renderer) this.renderer.setActiveState(this.automaton ? this.automaton.startState : null);
        this.els.status.className = 'status-badge ready';
        this.els.status.innerText = 'ESPERANDO INPUT';
        this.els.input.value = '';
        this.isPlaying = false;
    }

    log(msg, type = 'step') {
        const div = document.createElement('div');
        div.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString();
        div.innerHTML = `<span class="timestamp">[${time}]</span> ${msg}`;
        this.els.log.appendChild(div);
        this.els.log.scrollTop = this.els.log.scrollHeight;
    }

    async runValidation(animate = true) {
        const input = this.els.input.value.trim();
        // En el ejercicio 1 (email) no aceptamos vacía. En el 2 (módulo 3) sí (representa 0).
        if (!input && this.currentModule === 'email') {
            this.log("Error: La entrada está vacía", "error");
            return;
        }

        this.automaton.reset();
        this.renderer.setActiveState(this.automaton.currentState);
        this.els.status.className = 'status-badge processing';
        this.els.status.innerText = 'PROCESANDO...';
        this.log(`Iniciando validación para: "${input}"`, 'system');

        let valid = true;
        let errorMsg = "";

        for (let i = 0; i < input.length; i++) {
            const char = input[i];

            if (animate) {
                await new Promise(r => setTimeout(r, this.speed));
            }

            const result = this.automaton.step(char);

            if (result.valid) {
                this.renderer.setActiveState(result.to);
                this.log(`Estado ${result.from} --(${char})--> ${result.to}`);
            } else {
                valid = false;
                errorMsg = result.error;
                this.log(`Error en posición ${i}: ${errorMsg}`, 'error');
                break;
            }
        }

        // Verificación final
        if (valid) {
            if (this.automaton.isAccepted()) {
                this.els.status.className = 'status-badge valid';
                this.els.status.innerText = 'CADENA ACEPTADA';
                this.log(this.getConclusion(true, input), 'success');
            } else {
                this.els.status.className = 'status-badge invalid';
                this.els.status.innerText = 'RECHAZADA (ESTADO NO FINAL)';
                this.log(this.getConclusion(false, input, "La cadena terminó en un estado intermedio incompleto."), 'error');
            }
        } else {
            this.els.status.className = 'status-badge invalid';
            this.els.status.innerText = 'RECHAZADA (ERROR)';
            this.log(this.getConclusion(false, input, errorMsg), 'error');
        }
    }

    getConclusion(accepted, input, reason = "") {
        if (this.currentModule === 'email') {
            if (accepted) return `CONCLUSIÓN: El email "${input}" es válido. Estructura correcta: Local@Dominio.Extensión.`;
            return `CONCLUSIÓN: El email es inválido. ${reason} Verifica que no empiece/termine con puntos y tenga un dominio con extensión válida (.com, etc).`;
        } else {
            // Lógica de conclusión para Módulo 3
            // Solo calculamos si la entrada es numérica para evitar NaN
            // Permitimos cadena vacía (input === "") -> tratado como 0
            if (/^\d*$/.test(input)) {
                const sum = input.split('').reduce((a, b) => a + parseInt(b), 0);
                const remainder = sum % 3;
                if (accepted) return `CONCLUSIÓN: El número "${input}" es aceptado. La suma de sus dígitos es ${sum}, que es múltiplo de 3 (Residuo ${remainder}).`;
                return `CONCLUSIÓN: El número es rechazado. La suma de sus dígitos es ${sum}, lo que deja un residuo de ${remainder} al dividir por 3.`;
            } else {
                return `CONCLUSIÓN: Entrada rechazada. Contiene caracteres no numéricos.`;
            }
        }
    }
}

// Inicializar Aplicación
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
