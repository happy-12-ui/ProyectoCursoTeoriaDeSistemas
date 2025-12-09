# Proyecto de Teoría de Sistemas - Visualizador de Autómatas

Este proyecto implementa una herramienta interactiva para la visualización y validación de Autómatas Finitos Deterministas (AFD). Ha sido desarrollado utilizando tecnologías web estándar (HTML5, CSS3, JavaScript) sin dependencias externas, asegurando portabilidad y facilidad de ejecución.

## 🚀 Acceso Rápido (Despliegue)

La aplicación se encuentra desplegada y accesible para su revisión en el siguiente enlace:

👉 [**Ver Proyecto en GitHub Pages**](https://happy-12-ui.github.io/ProyectoCursoTeoriaDeSistemas/?authuser=0)
👉 [**Ver Código Fuente (Repositorio)**](https://github.com/happy-12-ui/ProyectoCursoTeoriaDeSistemas)

---

## 💻 Instrucciones para Ejecución Local

Si dispone del código fuente en formato comprimido (`.zip` o `.rar`), siga estos pasos para ejecutar la aplicación en su máquina local:

1.  **Descomprimir el Archivo**
    - Extraiga el contenido del archivo comprimido en una carpeta de su elección.

2.  **Localizar el Punto de Entrada**
    - Navegue a la carpeta `automata_project`.
    - Localice el archivo `index.html`.

3.  **Ejecutar la Aplicación**
    - Haga **doble clic** en `index.html` para abrirlo.
    - O haga clic derecho y seleccione *Abrir con* > *Google Chrome* (o su navegador de preferencia).

> **Nota Técnica:** La aplicación no requiere un servidor web local (Node.js, Apache, etc.) para funcionar sus características básicas. Se ejecuta directamente en el navegador mediante el protocolo `file://`.

---

## 🛠 Descripción Técnica

El sistema consta de dos módulos principales de validación mediante AFDs:

### 1. Validación de Direcciones de Email
Un autómata diseñado rigurosamente para validar correos electrónicos bajo un formato simplificado pero estricto:
- **Estructura**: `local-part@dominio`.
- **Reglas**:
    - `local-part`: Admite letras, números, puntos, guiones y guiones bajos. No puede comenzar ni terminar con punto o guion.
    - `separadores`: Validaciones estrictas para evitar separadores consecutivos si así se define.
    - `dominio`: Requiere obligatoriamente al menos un punto para separar el subdominio/nombre de la extensión (TLD).

### 2. Suma Módulo 3
Un autómata matemático que procesa cadenas de dígitos:
- **Lógica**: Calcula el residuo de la suma de los dígitos de entrada dividida por 3.
- **Estados**: 
    - `S` (Residuo 0 - Estado Inicial/Final)
    - `A` (Residuo 1)
    - `B` (Residuo 2)
- **Caso Especial**: Acepta la cadena vacía como representación del valor 0 (Residuo 0).

---

## 📂 Estructura del Proyecto

- `index.html`: Estructura semántica y contenedores de la UI.
- `style.css`: Estilos visuales, diseño responsivo y tema "Dark Sci-Fi".
- `script.js`:
    - Definición formal de los AFDs (`states`, `transitions`, `grammar`).
    - Motor lógico `Automaton` para el procesamiento de cadenas.
    - Motor de renderizado `CanvasRenderer` para la visualización gráfica en tiempo real.
