import React, { useState } from 'react';
import { Lock, Store, AlertCircle, Delete } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LoginScreenProps {
  onLogin: (role: 'ADMIN' | 'CAJERO') => void;
  message?: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, message }) => {
  const { businessName, adminPin, cajeroPin } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumClick = (n: string) => {
    setError('');
    setPin(prev => {
      const newPin = prev + n;
      if (newPin.length === 4) {
        if (newPin === adminPin) {
          onLogin('ADMIN');
        } else if (newPin === cajeroPin) {
          onLogin('CAJERO');
        } else {
          setError('PIN incorrecto');
          setTimeout(() => setPin(''), 500); // Clear after a short delay
        }
      }
      return newPin.slice(0, 4); // Keep max 4 chars
    });
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Decorative Side (Hidden on mobile) */}
        <div className="hidden md:block w-32 bg-pink-500 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>
           <div className="h-full flex flex-col items-center justify-center text-white gap-4">
              <Store size={40} />
              <div className="w-1 bg-white/30 h-16 rounded-full"></div>
              <div className="w-1 bg-white/30 h-4 rounded-full"></div>
           </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-500 mb-4 shadow-sm">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-800">{businessName}</h1>
            <p className="text-sm text-gray-500">{message || 'Ingrese su PIN de acceso'}</p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[0, 1, 2, 3].map(i => (
              <div 
                key={i} 
                className={`w-4 h-4 rounded-full transition-colors ${i < pin.length ? 'bg-pink-500' : 'bg-gray-200'}`} 
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded-lg mb-4 animate-pulse">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
             {[1,2,3,4,5,6,7,8,9].map(n => (
               <button 
                 key={n} 
                 onClick={() => handleNumClick(n.toString())} 
                 className="text-2xl font-bold py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-sm transition-all"
               >
                 {n}
               </button>
             ))}
             <button onClick={handleClear} className="text-xl font-bold py-4 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 border border-red-100">C</button>
             <button onClick={() => handleNumClick('0')} className="text-2xl font-bold py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-sm">0</button>
             <button onClick={handleBackspace} className="flex items-center justify-center py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-sm">
               <Delete size={24} />
             </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">Sistema Seguro v1.0 • GelatoPOS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;