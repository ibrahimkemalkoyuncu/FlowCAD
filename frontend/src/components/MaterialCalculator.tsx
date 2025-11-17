// ============================================
// 12. MaterialCalculator.tsx - Malzeme Hesaplayıcı

import { useDrawingStore } from "./InteractiveScene3D";

// ============================================
export const MaterialCalculator: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { pipes, components } = useDrawingStore();
  
  // Boru malzemeleri hesaplama
  const pipeMaterials = pipes.reduce((acc, pipe) => {
    const key = `${pipe.diameter}-${pipe.material}`;
    if (!acc[key]) {
      acc[key] = {
        diameter: pipe.diameter,
        material: pipe.material,
        length: 0,
        count: 0,
        unitPrice: pipe.diameter === '3/4"' ? 125 : 85 // Örnek fiyat
      };
    }
    acc[key].length += pipe.length || 0;
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);
  
  // Cihaz malzemeleri hesaplama
  const componentMaterials = components.reduce((acc, comp) => {
    const key = comp.type;
    if (!acc[key]) {
      acc[key] = {
        name: comp.name,
        type: comp.type,
        count: 0,
        unitPrice: comp.type === 'boiler' ? 3500 : comp.type === 'meter' ? 450 : 25
      };
    }
    acc[key].count += 1;
    return acc;
  }, {} as Record<string, any>);
  
  const pipeTotal = Object.values(pipeMaterials).reduce((sum: number, item: any) => 
    sum + (item.length * item.unitPrice), 0
  );
  
  const componentTotal = Object.values(componentMaterials).reduce((sum: number, item: any) => 
    sum + (item.count * item.unitPrice), 0
  );
  
  const grandTotal = pipeTotal + componentTotal;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Malzeme Listesi ve Maliyet</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Borular */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Borular</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Malzeme</th>
                  <th className="text-left py-2 px-3">Çap</th>
                  <th className="text-right py-2 px-3">Uzunluk (m)</th>
                  <th className="text-right py-2 px-3">Birim Fiyat</th>
                  <th className="text-right py-2 px-3">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(pipeMaterials).map((item: any, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3 capitalize">{item.material}</td>
                    <td className="py-2 px-3">{item.diameter}</td>
                    <td className="py-2 px-3 text-right">{item.length.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">{item.unitPrice} ₺/m</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {(item.length * item.unitPrice).toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={4} className="py-2 px-3 text-right">Boru Toplamı:</td>
                  <td className="py-2 px-3 text-right">{pipeTotal.toFixed(2)} ₺</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Cihazlar */}
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">Cihazlar ve Ekipmanlar</h3>
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-3">Cihaz</th>
                  <th className="text-right py-2 px-3">Adet</th>
                  <th className="text-right py-2 px-3">Birim Fiyat</th>
                  <th className="text-right py-2 px-3">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(componentMaterials).map((item: any, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 px-3">{item.name}</td>
                    <td className="py-2 px-3 text-right">{item.count}</td>
                    <td className="py-2 px-3 text-right">{item.unitPrice} ₺</td>
                    <td className="py-2 px-3 text-right font-medium">
                      {(item.count * item.unitPrice).toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan={3} className="py-2 px-3 text-right">Cihaz Toplamı:</td>
                  <td className="py-2 px-3 text-right">{componentTotal.toFixed(2)} ₺</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Genel Toplam */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">GENEL TOPLAM:</span>
              <span className="text-2xl font-bold text-blue-600">{grandTotal.toFixed(2)} ₺</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              * Fiyatlar KDV dahil örnek fiyatlardır
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex gap-3 justify-end">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            🖨️ Yazdır
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};