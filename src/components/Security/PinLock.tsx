import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Lock, Shield, X, Delete } from 'lucide-react';

interface PinLockProps {
  onUnlock: (pin: string) => Promise<boolean>;
  onSetup?: (pin: string) => Promise<boolean>;
  mode: 'unlock' | 'setup' | 'change';
  title?: string;
}

export function PinLock({ onUnlock, onSetup, mode, title }: PinLockProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'enter');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleKeyPress = (key: string) => {
    if (error) setError('');
    
    if (key === 'delete') {
      if (step === 'confirm') {
        setConfirmPin(confirmPin.slice(0, -1));
      } else {
        setPin(pin.slice(0, -1));
      }
      return;
    }

    if (key === 'clear') {
      if (step === 'confirm') {
        setConfirmPin('');
      } else {
        setPin('');
      }
      return;
    }

    const currentPin = step === 'confirm' ? confirmPin : pin;
    if (currentPin.length >= 6) return;

    if (step === 'confirm') {
      const newConfirmPin = confirmPin + key;
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length >= 4) {
        if (newConfirmPin === pin) {
          handleSetup(newConfirmPin);
        } else {
          setError('Los PINs no coinciden');
          setConfirmPin('');
          triggerShake();
        }
      }
    } else {
      const newPin = pin + key;
      setPin(newPin);
      
      if (newPin.length >= 4) {
        if (mode === 'setup') {
          setStep('confirm');
        } else {
          handleUnlock(newPin);
        }
      }
    }
  };

  const handleUnlock = async (pinToVerify: string) => {
    const isValid = await onUnlock(pinToVerify);
    if (!isValid) {
      setError('PIN incorrecto');
      setPin('');
      triggerShake();
    }
  };

  const handleSetup = async (finalPin: string) => {
    if (onSetup) {
      const success = await onSetup(finalPin);
      if (!success) {
        setError('Error al configurar PIN');
        setPin('');
        setConfirmPin('');
        setStep('enter');
      }
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const renderDots = () => {
    const currentPin = step === 'confirm' ? confirmPin : pin;
    return (
      <div className="flex justify-center gap-3 mb-8">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all ${
              i < currentPin.length
                ? 'bg-primary-600 scale-110'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getTitle = () => {
    if (title) return title;
    if (mode === 'setup') {
      return step === 'enter' ? 'Crea tu PIN' : 'Confirma tu PIN';
    }
    if (mode === 'change') return 'Ingresa PIN actual';
    return 'Ingresa tu PIN';
  };

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'delete'],
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {mode === 'unlock' ? (
                <Lock className="w-8 h-8 text-primary-600" />
              ) : (
                <Shield className="w-8 h-8 text-primary-600" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'setup' 
                ? 'PIN de 4-6 dígitos' 
                : 'Protege tus finanzas'}
            </p>
          </div>

          {renderDots()}

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm text-center rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {keypadKeys.map((row) => (
              row.map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`aspect-square rounded-xl font-semibold text-xl transition-all ${
                    key === 'delete' || key === 'clear'
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-white border border-gray-200 hover:bg-gray-50 active:scale-95'
                  }`}
                >
                  {key === 'delete' && <Delete className="w-6 h-6 mx-auto" />}
                  {key === 'clear' && <X className="w-6 h-6 mx-auto" />}
                  {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key) && key}
                </button>
              ))
            ))}
          </div>

          {mode === 'unlock' && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Tu información está segura
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
