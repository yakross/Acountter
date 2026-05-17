<h1 align="center">
  <br>
  📊 Acountter (FinanceAI)
  <br>
</h1>

<h4 align="center">Una aplicación inteligente para la gestión de finanzas personales, presupuestos y control de gastos.</h4>

<p align="center">
  <a href="#características-principales">Características</a> •
  <a href="#stack-tecnológico">Tecnologías</a> •
  <a href="#instalación-y-uso">Instalación</a> •
  <a href="#estructura-del-proyecto">Estructura</a> •
  <a href="#licencia">Licencia</a>
</p>

![Screenshot de la Aplicación](https://via.placeholder.com/1000x500.png?text=Acountter+Dashboard+Preview)

## 📋 Descripción General

**Acountter** es una aplicación integral diseñada para empoderar a los usuarios en la gestión de sus finanzas personales. Integrando un robusto sistema de seguimiento de gastos con análisis inteligentes, la plataforma facilita la creación de presupuestos, el ahorro y la planificación financiera a largo plazo. Su interfaz moderna y minimalista, construida con React y Tailwind CSS, garantiza una experiencia de usuario fluida tanto en dispositivos de escritorio como móviles.

---

## ✨ Características Principales

- **📈 Panel de Control (Dashboard):** Visión general de ingresos, gastos y balances en tiempo real.
- **🤖 Insights de IA:** Sugerencias y análisis predictivo de gastos generados automáticamente.
- **💸 Gestión de Transacciones:** Creación, edición y categorización rápida de ingresos y egresos.
- **🎯 Metas de Ahorro:** Define objetivos financieros y haz un seguimiento visual de tu progreso.
- **🔄 Pagos Recurrentes:** Configura y automatiza el registro de suscripciones y facturas fijas.
- **📊 Administrador de Presupuestos:** Aplica la regla **50/30/20** o crea distribuciones personalizadas por categoría.
- **🔒 Seguridad Avanzada:** Bloqueo de la aplicación mediante **PIN de seguridad** para proteger tu información financiera.
- **🌙 Modo Oscuro:** Interfaz adaptable a las preferencias del sistema del usuario.
- **🌍 Soporte Multidivisa:** Cambia entre múltiples monedas (ej. USD/COP) dinámicamente.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo un stack moderno y escalable:

- **Frontend:** React 18, TypeScript, Vite.
- **Estilos:** Tailwind CSS.
- **Estado y Contextos:** React Context API, Custom Hooks.
- **Despliegue y Móvil:** Preparado para PWA y empaquetado móvil con **Capacitor**.
- **Iconos y UI:** Componentes modulares y Lucide Icons (o similar).

---

## 🚀 Instalación y Uso

Sigue estos pasos para ejecutar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/yakross/Acountter.git
cd Acountter
```

### 2. Instalar las dependencias
Asegúrate de tener Node.js instalado (v18+).
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
├── android/               # Configuración nativa para compilación móvil (Capacitor)
├── src/
│   ├── components/        # Componentes UI reutilizables (Dashboard, Forms, etc.)
│   ├── components/ui/     # Sistema de diseño base (Botones, Inputs, Cards)
│   ├── contexts/          # Estado global (Ej: CurrencyContext)
│   ├── data/              # Datos estáticos y categorías predefinidas
│   ├── hooks/             # Lógica de negocio (useTransactions, useBudgets, etc.)
│   ├── services/          # Integración con servicios externos (Ej: AI Service)
│   ├── types/             # Definiciones de interfaces en TypeScript
│   ├── utils/             # Funciones de ayuda (formateo, persistencia)
│   ├── App.tsx            # Enrutador principal y configuración de Vistas
│   └── main.tsx           # Punto de entrada de la aplicación
├── capacitor.config.ts    # Configuración de Capacitor para PWA/Mobile
├── tailwind.config.js     # Configuración de los estilos globales
└── package.json           # Dependencias y scripts
```

---

## 🛡️ Licencia

Este proyecto fue desarrollado como parte del portafolio profesional de [Leiner Suarez (yakross)](https://github.com/yakross). Todos los derechos reservados.
