<h1 align="center">
  <br>
  📊 Acountter (FinanceAI)
  <br>
</h1>

<h4 align="center">Una aplicación inteligente para la gestión de finanzas personales, presupuestos y control de gastos.</h4>

<p align="center">
  <a href="#-mini-resumen-de-un-vistazo">Mini Resumen</a> •
  <a href="#-características-principales">Características</a> •
  <a href="#-stack-tecnológico">Tecnologías</a> •
  <a href="#-instalación-y-uso">Instalación</a> •
  <a href="#-estructura-del-proyecto">Estructura</a>
</p>

---

## ⚡ Mini Resumen (De un vistazo)

**Acountter** es tu **asistente financiero personal inteligente**. Es una aplicación diseñada para responder a la pregunta: *¿A dónde se va mi dinero?* 

En pocas palabras, la plataforma te permite:
1. **Registrar tus finanzas:** Anota tus ingresos y gastos diarios de forma rápida y sencilla.
2. **Presupuestar inteligentemente:** Distribuye tus ingresos usando metodologías profesionales como la **regla 50/30/20** (Necesidades, Deseos, Ahorro/Deudas).
3. **Automatizar tus cuentas:** Olvídate de recordar pagos mensuales; la app calcula y registra tus suscripciones y servicios recurrentes de forma automática.
4. **Analizar con IA:** Recibe consejos financieros personalizados y alertas inteligentes sobre tus hábitos de consumo.
5. **Proteger tus datos:** Mantén tu información privada a salvo de miradas indiscretas con un sistema de **bloqueo por PIN**.

---

## ✨ Características Principales

- **📈 Panel de Control (Dashboard):** Visión general de ingresos, gastos y balances en tiempo real con gráficos dinámicos.
- **🤖 Insights de IA:** Sugerencias y análisis predictivo de gastos generados automáticamente a partir de tus transacciones.
- **💸 Gestión de Transacciones:** Creación, edición, eliminación y categorización rápida de ingresos y egresos.
- **🎯 Metas de Ahorro:** Define objetivos financieros (ej. "Comprar PC", "Vacaciones") y haz un seguimiento visual de tu progreso.
- **🔄 Pagos Recurrentes:** Configura y automatiza el registro de suscripciones y facturas fijas mensuales/anuales.
- **📊 Administrador de Presupuestos:** Aplica la regla **50/30/20** o crea distribuciones personalizadas por categoría para evitar gastar de más.
- **🔒 Seguridad Avanzada:** Bloqueo de la aplicación mediante **PIN de seguridad** con auto-bloqueo configurable.
- **🌙 Modo Oscuro:** Interfaz adaptable que cuida tu vista y ahorra batería.
- **🌍 Soporte Multidivisa:** Cambia entre múltiples monedas (USD / COP) de forma dinámica e instantánea.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo un stack moderno, rápido y escalable:

- **Frontend:** React 18, TypeScript, Vite (para un inicio y desarrollo ultrarrápido).
- **Estilos:** Tailwind CSS (diseño responsivo y premium).
- **Estado y Contextos:** React Context API y Custom Hooks para una lógica limpia.
- **Despliegue y Móvil:** Preparado para PWA y empaquetado móvil híbrido con **Capacitor**.
- **Seguridad y Almacenamiento:** Integración con almacenamiento local persistente y seguro.

---

## 🚀 Instalación y Uso

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/yakross/Acountter.git
cd Acountter
```

### 2. Instalar las dependencias
Asegúrate de tener Node.js instalado (v18 o superior).
```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

### 4. Compilar para producción
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```text
Acountter/
├── android/               # Carpeta del proyecto nativo Android (Capacitor)
├── src/
│   ├── components/        # Componentes de las vistas (Dashboard, Forms, etc.)
│   ├── components/ui/     # Botones, entradas y tarjetas del sistema de diseño base
│   ├── contexts/          # Estado global de la aplicación (Ej: CurrencyContext)
│   ├── data/              # Datos estáticos y categorías predefinidas
│   ├── hooks/             # Ganchos personalizados (useTransactions, useBudgets, etc.)
│   ├── services/          # Integración con lógica inteligente de IA
│   ├── types/             # Tipado seguro con TypeScript
│   ├── utils/             # Funciones utilitarias de formateo y almacenamiento
│   ├── App.tsx            # Enrutador de vistas principal
│   └── main.tsx           # Punto de entrada de la aplicación
├── capacitor.config.ts    # Configuración de Capacitor para PWA/Mobile
├── tailwind.config.js     # Configuración de estilos y colores personalizados
└── package.json           # Dependencias y comandos del proyecto
```

---

## 🛡️ Licencia

Este proyecto fue desarrollado con dedicación por **[Leiner Suarez (yakross)](https://github.com/yakross)** como un proyecto clave para su portafolio profesional. Todos los derechos reservados.
