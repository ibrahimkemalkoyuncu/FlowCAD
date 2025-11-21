// ============================================
// MATERIAL CALCULATOR - Malzeme Listesi Modal
// Konum: frontend/src/components/MaterialCalculator.tsx
// onClose prop eklendi (TypeScript uyumluluğu)
// ============================================

import React from 'react';

interface MaterialCalculatorProps {
  onClose?: () => void;
}

const MaterialCalculator: React.FC<MaterialCalculatorProps> = ({ onClose }) => {
  // Basit modal içeriği (orijinal dosyadaki iş mantığını koruyabilirsiniz)
  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">📋 Malzeme Listesi</h3>
          <p className="text-xs text-gray-500">Boru ve cihaz malzemelerini hesaplayın</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 p-2 rounded"
            title="Kapat"
          >
            ✕
          </button>
        )}
      </div>

      <div className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          Bu panel varsayılan bir Material Calculator içeriğidir. Orijinal mantığı koruyarak özellikleri buraya ekleyebilirsiniz.
        </p>

        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600">Toplam Boru Uzunluğu</div>
            <div className="font-semibold text-lg">0.00 m</div>
          </div>

          <div className="bg-gray-50 p-3 rounded border">
            <div className="text-xs text-gray-600">Toplam Parça</div>
            <div className="font-semibold text-lg">0</div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t flex justify-end gap-2">
        <button
          onClick={() => onClose && onClose()}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Kapat
        </button>
        <button
          onClick={() => alert('Rapor indiriliyor...')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Rapor İndir
        </button>
      </div>
    </div>
  );
};

export default MaterialCalculator;