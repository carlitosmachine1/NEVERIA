import React from 'react';
import { ReportData } from '../types';
import { useStore } from '../context/StoreContext';

interface ReportReceiptProps {
  report: ReportData | null;
  filter: string;
  timeframe: string;
}

const ReportReceipt: React.FC<ReportReceiptProps> = ({ report, filter, timeframe }) => {
  const { businessName, receiptLogo, address, phone } = useStore();
  
  if (!report) return null;

  const paymentMethodLabel = filter === 'ALL' ? 'Todos' : filter === 'EFECTIVO' ? 'Efectivo' : 'Tarjeta';
  
  return (
    <div id="printable-report" className="hidden print:block font-mono text-black p-2 max-w-[80mm] mx-auto text-xs leading-tight">
      <div className="text-center mb-4 flex flex-col items-center">
        {receiptLogo ? (
          <img 
            src={receiptLogo} 
            alt="Logo" 
            className="max-h-20 max-w-[80%] object-contain mb-2 grayscale" 
          />
        ) : null}
        <h1 className="text-xl font-bold uppercase mb-1">{businessName}</h1>
        <p>{address}</p>
        <p>Tel: {phone}</p>
        <p className="mt-2 text-sm font-bold border-b border-t border-black py-1">CORTE DE CAJA</p>
        <p className="mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
      </div>

      <div className="border-b-2 border-dashed border-black my-2"></div>

      <div className="space-y-1 font-bold">
        <div className="flex justify-between">
          <span>FILTRO:</span>
          <span>{paymentMethodLabel}</span>
        </div>
        <div className="flex justify-between">
          <span>ÓRDENES TOTALES:</span>
          <span>{report.totalOrders}</span>
        </div>
        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-dotted border-black">
          <span>VENTAS TOTALES:</span>
          <span>${report.totalSales.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b-2 border-dashed border-black my-3"></div>

      <p className="font-bold mb-2 text-center">PRODUCTOS VENDIDOS</p>
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1">Cant</th>
            <th className="py-1">Prod</th>
            <th className="py-1 text-right">Tot</th>
          </tr>
        </thead>
        <tbody>
          {report.sortedProducts.slice(0, 20).map((item, idx) => (
            <tr key={idx}>
              <td className="align-top py-1">{item.qty}</td>
              <td className="align-top py-1 break-words">{item.name}</td>
              <td className="align-top text-right py-1">${item.total.toFixed(2)}</td>
            </tr>
          ))}
          {report.sortedProducts.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-2 italic">Sin ventas</td>
            </tr>
          )}
        </tbody>
      </table>

      {report.sortedProducts.length > 20 && (
        <p className="text-center mt-2 italic">* Mostrando top 20 productos *</p>
      )}

      <div className="border-b-2 border-dashed border-black my-4"></div>

      <div className="text-center">
        <p className="font-semibold">*** FIN DEL REPORTE ***</p>
      </div>
    </div>
  );
};

export default ReportReceipt;
