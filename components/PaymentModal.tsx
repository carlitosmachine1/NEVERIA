import React, { useState, useEffect } from 'react';
import { X, Check, Banknote, CreditCard, Delete } from 'lucide-react';

interface PaymentModalProps {
  total: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (method: 'EFECTIVO' | 'TARJETA', receivedAmount: number) => void;
  isProcessing: boolean;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ total, isOpen, onClose, onConfirm, isProcessing }) => {
  const [method, setMethod] = useState<'EFECTIVO' | 'TARJETA'>('EFECTIVO');
  const [receivedInput, setReceivedInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setMethod('EFECTIVO');
      setReceivedInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNumClick = (num: string) => {
    setReceivedInput(prev => prev + num);
  };

  const handleClear = () => {
    setReceivedInput('');
  };

  const handleBackspace = () => {
    setReceivedInput(prev => prev.slice(0, -1));
  };

  // Quick cash options
  const quickCash = [20, 50, 100, 200, 500];
  const receivedAmount = parseFloat(receivedInput) || 0;
  const change = Math.max(0, receivedAmount - total);
  const isValid = method === 'TARJETA' || receivedAmount >= total;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-y-auto flex flex-col max-h-[95vh] my-auto">
        {/* Header */}
        <div className="bg-gray-100 p-3 sm:p-4 flex justify-between items-center border-b shrink-0">
          <h2 className="text-xl sm:text-2xl font-display font-bold text-gray-800">Procesar Pago</h2>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left Panel: Details & Method */}
          <div className="flex-1 p-3 sm:p-6 flex flex-col gap-3 sm:gap-6 bg-gray-50 border-r">
            <div className="text-center py-2.5 sm:py-4 bg-white rounded-xl shadow-xs border">
              <span className="text-gray-500 text-xs sm:text-sm uppercase font-bold tracking-wider">Total a Pagar</span>
              <div className="text-3xl sm:text-5xl font-bold text-green-600 font-display">${total.toFixed(2)}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <button 
                onClick={() => setMethod('EFECTIVO')}
                className={`p-3 sm:p-6 rounded-xl border-2 flex flex-col items-center gap-1 sm:gap-2 transition-all ${
                  method === 'EFECTIVO' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:bg-white text-gray-600'
                }`}
              >
                <Banknote className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-bold text-sm sm:text-lg">Efectivo</span>
              </button>
              <button 
                onClick={() => setMethod('TARJETA')}
                className={`p-3 sm:p-6 rounded-xl border-2 flex flex-col items-center gap-1 sm:gap-2 transition-all ${
                  method === 'TARJETA' 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:bg-white text-gray-600'
                }`}
              >
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="font-bold text-sm sm:text-lg">Tarjeta</span>
              </button>
            </div>

            {method === 'EFECTIVO' && (
              <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-xs">
                <div className="flex justify-between items-center mb-1 sm:mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">Recibido:</span>
                  <span className="text-lg sm:text-xl font-bold">${receivedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t">
                  <span className="text-gray-800 font-bold text-sm sm:text-base">Cambio:</span>
                  <span className={`text-xl sm:text-2xl font-bold ${change > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Numpad (Only visible for Cash) */}
          {method === 'EFECTIVO' ? (
            <div className="flex-1 p-3 sm:p-6 flex flex-col justify-between bg-white border-t md:border-t-0">
               <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                {quickCash.map(amt => (
                   <button 
                    key={amt}
                    onClick={() => setReceivedInput(amt.toString())}
                    className="py-1.5 sm:py-2 bg-green-50 text-green-700 font-bold text-xs sm:text-sm rounded-lg border border-green-200 hover:bg-green-100"
                  >
                    ${amt}
                  </button>
                ))}
               </div>

               <div className="grid grid-cols-3 gap-2 sm:gap-3 flex-1">
                 {[1,2,3,4,5,6,7,8,9].map(n => (
                   <button key={n} onClick={() => handleNumClick(n.toString())} className="text-xl sm:text-2xl font-bold py-2.5 sm:py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-xs transition-all">
                     {n}
                   </button>
                 ))}
                 <button onClick={handleClear} className="text-lg sm:text-xl font-bold py-2.5 sm:py-4 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 border border-red-100">C</button>
                 <button onClick={() => handleNumClick('0')} className="text-xl sm:text-2xl font-bold py-2.5 sm:py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-xs">0</button>
                 <button onClick={handleBackspace} className="flex items-center justify-center py-2.5 sm:py-4 bg-gray-50 text-gray-900 rounded-xl hover:bg-gray-100 active:bg-gray-200 border shadow-xs">
                   <Delete className="w-5 h-5 sm:w-6 sm:h-6" />
                 </button>
               </div>
            </div>
          ) : (
             <div className="flex-1 p-6 flex items-center justify-center bg-white border-t md:border-t-0">
                <div className="text-center text-gray-400">
                  <CreditCard size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-base sm:text-lg">Use la terminal de tarjetas externa</p>
                </div>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t bg-gray-50 flex gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={onClose}
            className="flex-1 py-3 sm:py-4 text-gray-600 font-bold text-base sm:text-lg hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            disabled={!isValid || isProcessing}
            onClick={() => onConfirm(method, method === 'EFECTIVO' ? receivedAmount : total)}
            className={`flex-1 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-2 shadow-lg transition-all
              ${!isValid || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-500 text-white hover:bg-green-600 hover:scale-[1.01] active:scale-[0.99]'
              }`}
          >
            {isProcessing ? (
               <span>Procesando...</span>
            ) : (
              <>
                <Check className="w-5 h-5 sm:w-7 sm:h-7" />
                <span>Cobrar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;