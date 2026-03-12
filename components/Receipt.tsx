import React from 'react';
import { Order } from '../types';
import { useStore } from '../context/StoreContext';

interface ReceiptProps {
  order: Order | null;
}

const Receipt: React.FC<ReceiptProps> = ({ order }) => {
  const { businessName, receiptLogo } = useStore();
  
  if (!order) return null;

  return (
    <div id="printable-receipt" className="hidden print:block font-mono text-black p-2 max-w-[80mm] mx-auto text-xs leading-tight">
      <div className="text-center mb-4 flex flex-col items-center">
        {receiptLogo ? (
          <img 
            src={receiptLogo} 
            alt="Logo" 
            className="max-h-20 max-w-[80%] object-contain mb-2 grayscale" 
          />
        ) : null}
        <h1 className="text-xl font-bold uppercase mb-1">{businessName}</h1>
        <p>Av. Principal #123, Centro</p>
        <p>Tel: 555-0000</p>
        <p className="mt-2">{order.date.toLocaleDateString()} {order.date.toLocaleTimeString()}</p>
        <p>Ticket: #{order.id.slice(0, 8)}</p>
      </div>

      <div className="border-b-2 border-dashed border-black my-2"></div>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-1">Cant</th>
            <th className="py-1">Prod</th>
            <th className="py-1 text-right">Tot</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, idx) => (
            <tr key={`${item.id}-${idx}`}>
              <td className="align-top py-1">{item.quantity}</td>
              <td className="align-top py-1">{item.name}</td>
              <td className="align-top text-right py-1">${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-b-2 border-dashed border-black my-2"></div>

      <div className="flex justify-between font-bold text-sm">
        <span>TOTAL</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
      
      <div className="flex justify-between text-xs mt-1">
        <span>Pago ({order.paymentMethod})</span>
        <span>${(order.receivedAmount || order.total).toFixed(2)}</span>
      </div>
      
      {order.change !== undefined && order.change > 0 && (
        <div className="flex justify-between text-xs mt-1">
          <span>Cambio</span>
          <span>${order.change.toFixed(2)}</span>
        </div>
      )}

      <div className="border-b-2 border-dashed border-black my-4"></div>

      <div className="text-center">
        {order.aiMessage && (
            <p className="italic font-bold mb-2">"{order.aiMessage}"</p>
        )}
        <p className="font-semibold">¡Vuelva Pronto!</p>
        <p className="text-[10px] mt-2 text-gray-500">Desarrollado con Gemini AI</p>
      </div>
    </div>
  );
};

export default Receipt;