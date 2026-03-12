import React, { useState } from 'react';
import { Lock, User, LogIn, Store, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { businessName } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials as requested
    if (username === 'ADMIN' && password === 'ADMIN') {
      onLogin();
    } else {
      setError('Credenciales incorrectas. Intente nuevamente.');
      setPassword('');
    }
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
        <div className="flex-1 p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-500 mb-4 shadow-sm">
              <Lock size={32} />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-800">{businessName}</h1>
            <p className="text-sm text-gray-500">Punto de Venta</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <User size={20} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Usuario"
                  autoFocus
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-pink-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  placeholder="Contraseña"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg animate-pulse">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              <LogIn size={18} />
              INICIAR SISTEMA
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">Sistema Seguro v1.0 • GelatoPOS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;