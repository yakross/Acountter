import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PinLock } from './PinLock';
import { CurrencySelector } from '@/contexts/CurrencySelector';
import { capacitorStorage } from '@/utils/capacitorStorage';
import type { SecuritySettings as SecuritySettingsType } from '@/hooks/useSecurity';
import {
  Shield, Lock, Unlock, Clock, ChevronRight,
  Fingerprint, AlertTriangle, CheckCircle2,
  Download, Upload, Database, Moon, Sun, FileText, FileSpreadsheet
} from 'lucide-react';

interface SecuritySettingsProps {
  settings: SecuritySettingsType;
  onSetupPin: (pin: string) => Promise<boolean>;
  onVerifyPin: (pin: string) => Promise<boolean>;
  onDisableSecurity: () => Promise<void>;
  onUpdateTimeout: (minutes: number) => Promise<void>;
}

export function SecuritySettingsPanel({
  settings,
  onSetupPin,
  onVerifyPin,
  onDisableSecurity,
  onUpdateTimeout,
}: SecuritySettingsProps) {
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = () => {
    const isDark = !isDarkMode;
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const flash = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleExport = async () => {
    const json = await capacitorStorage.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeai_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash('Datos exportados correctamente');
  };

  const handleExportPDF = async () => {
    const txs = await capacitorStorage.getTransactions();
    const doc = new jsPDF();
    doc.text('Reporte de Transacciones - FinanceAI', 14, 15);
    
    const tableData = txs.map(t => [t.date, t.description, t.category, t.type === 'income' ? '+' : '-', t.amount.toString()]);
    
    autoTable(doc, {
      head: [['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Monto']],
      body: tableData,
      startY: 20,
    });
    
    doc.save(`transacciones_${new Date().toISOString().split('T')[0]}.pdf`);
    flash('PDF exportado correctamente');
  };

  const handleExportExcel = async () => {
    const txs = await capacitorStorage.getTransactions();
    const ws = XLSX.utils.json_to_sheet(txs.map(t => ({
      Fecha: t.date,
      Descripción: t.description,
      Categoría: t.category,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Monto: t.amount
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transacciones");
    XLSX.writeFile(wb, `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`);
    flash('Excel exportado correctamente');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await capacitorStorage.importAll(text);
      flash('Datos importados correctamente. Recargando…');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      alert('Error al importar el archivo. Asegúrate de que sea un respaldo válido.');
    }
  };

  if (showPinSetup) {
    return (
      <PinLock
        mode="setup"
        onUnlock={async () => true}
        onSetup={async pin => {
          const ok = await onSetupPin(pin);
          if (ok) { setShowPinSetup(false); flash('PIN configurado correctamente'); }
          return ok;
        }}
        title="Configurar PIN"
      />
    );
  }

  if (showPinChange) {
    return (
      <div className="space-y-4">
        <PinLock
          mode="unlock"
          onUnlock={async oldPin => {
            const ok = await onVerifyPin(oldPin);
            if (ok) { setShowPinChange(false); setTimeout(() => setShowPinSetup(true), 100); }
            return ok;
          }}
          title="Verificar PIN actual"
        />
        <Button variant="outline" onClick={() => setShowPinChange(false)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Seguridad y Ajustes</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          settings.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {settings.enabled ? 'Protegido' : 'Sin protección'}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          {successMsg}
        </div>
      )}

      {/* ── Preferencias generales ──────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias y Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Moneda Principal</label>
            <CurrencySelector />
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                Modo Oscuro
              </p>
              <p className="text-sm text-gray-500">Cambia la apariencia de la aplicación</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── Security status ─────────────────────────────────── */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-full ${settings.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
              {settings.enabled
                ? <Lock className="w-8 h-8 text-green-600" />
                : <Unlock className="w-8 h-8 text-gray-400" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">
                {settings.enabled ? 'Seguridad activada' : 'Sin seguridad'}
              </h3>
              <p className="text-sm text-gray-500">
                {settings.enabled
                  ? `Método: ${settings.method === 'pin' ? 'PIN (PBKDF2-SHA256)' : 'Biométrico'}`
                  : 'Tu información no está protegida'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Setup ───────────────────────────────────────────── */}
      {!settings.enabled && (
        <Card>
          <CardHeader><CardTitle>Activar seguridad</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => setShowPinSetup(true)}
                className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">PIN numérico</p>
                  <p className="text-sm text-gray-500">4-6 dígitos, cifrado PBKDF2</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              <button
                disabled
                className="w-full p-4 border border-gray-200 rounded-xl opacity-50 cursor-not-allowed flex items-center gap-4"
              >
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Fingerprint className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-900">Huella digital / Face ID</p>
                  <p className="text-sm text-gray-500">Próximamente</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Settings when enabled ───────────────────────────── */}
      {settings.enabled && (
        <>
          <Card>
            <CardHeader><CardTitle>Configuración de seguridad</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  Bloqueo automático
                </label>
                <select
                  value={settings.autoLockTimeout}
                  onChange={e => onUpdateTimeout(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value={1}>1 minuto</option>
                  <option value={5}>5 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
              </div>
              <Button variant="outline" onClick={() => setShowPinChange(true)} className="w-full">
                Cambiar PIN
              </Button>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Zona de peligro
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showDisableConfirm ? (
                <div className="space-y-4">
                  <p className="text-sm text-red-600">
                    ¿Estás seguro? Esto eliminará toda la protección de tu aplicación.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDisableConfirm(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={async () => {
                        await onDisableSecurity();
                        setShowDisableConfirm(false);
                        flash('Seguridad desactivada');
                      }}
                      className="flex-1"
                    >
                      Desactivar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowDisableConfirm(true)}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  Desactivar seguridad
                </Button>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Backup ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary-600" />
            Respaldo de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Exporta todos tus datos en JSON para guardarlos de forma segura, o importa un respaldo anterior. También puedes exportar tus transacciones como PDF o Excel.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="flex items-center justify-center gap-2" onClick={handleExportPDF}>
              <FileText className="w-4 h-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" className="flex items-center justify-center gap-2 text-green-700 border-green-200 hover:bg-green-50" onClick={handleExportExcel}>
              <FileSpreadsheet className="w-4 h-4" />
              Exportar Excel
            </Button>
            <Button className="flex items-center justify-center gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Backup JSON
            </Button>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              Importar JSON
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
