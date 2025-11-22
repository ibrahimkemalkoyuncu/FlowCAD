// ============================================
// MATERIAL CALCULATOR - Malzeme Listesi ve Hesaplayıcı
// Konum: frontend/src/components/MaterialCalculator.tsx
// Boru ve cihaz malzemelerini hesaplar, rapor çıkarır
// ============================================

import React, { useMemo } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ============================================
// INTERFACE - Component Props
// ============================================

interface MaterialCalculatorProps {
  onClose?: () => void;
}

// ============================================
// MATERIAL CALCULATION TYPES
// ============================================

interface MaterialSummary {
  diameter: string;
  length: number;
  count: number;
  material: string;
}

interface ComponentSummary {
  type: string;
  count: number;
  names: string[];
}

// ============================================
// MATERIAL CALCULATOR COMPONENT
// ============================================

const MaterialCalculator: React.FC<MaterialCalculatorProps> = ({ onClose }) => {
  const { pipes, components } = useDrawingStore();

  // ============================================
  // CALCULATIONS - Hesaplamalar
  // ============================================

  // Boru malzemesi hesaplama
  const pipeSummary = useMemo(() => {
    const summary: Record<string, MaterialSummary> = {};

    pipes.forEach(pipe => {
      const key = `${pipe.diameter}_${pipe.material}`;
      
      if (!summary[key]) {
        summary[key] = {
          diameter: pipe.diameter,
          length: 0,
          count: 0,
          material: pipe.material
        };
      }

      summary[key].length += pipe.length || 0;
      summary[key].count += 1;
    });

    return Object.values(summary).sort((a, b) => 
      a.diameter.localeCompare(b.diameter)
    );
  }, [pipes]);

  // Component (cihaz) özeti
  const componentSummary = useMemo(() => {
    const summary: Record<string, ComponentSummary> = {};

    components.forEach(comp => {
      if (!summary[comp.type]) {
        summary[comp.type] = {
          type: comp.type,
          count: 0,
          names: []
        };
      }

      summary[comp.type].count += 1;
      summary[comp.type].names.push(comp.name);
    });

    return Object.values(summary).sort((a, b) => 
      b.count - a.count
    );
  }, [components]);

  // Toplam hesaplamalar
  const totalPipeLength = pipeSummary.reduce((sum, item) => sum + item.length, 0);
  const totalPipeCount = pipeSummary.reduce((sum, item) => sum + item.count, 0);
  const totalComponentCount = componentSummary.reduce((sum, item) => sum + item.count, 0);

  // ============================================
  // PDF EXPORT
  // ============================================

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Başlık
    doc.setFontSize(20);
    doc.setTextColor(59, 130, 246); // blue-500
    doc.text('FlowCAD Malzeme Listesi', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Oluşturma Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 14, 28);
    
    // Özet bilgiler
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Proje Özeti', 14, 40);
    
    doc.setFontSize(10);
    doc.text(`Toplam Boru Uzunluğu: ${totalPipeLength.toFixed(2)} m`, 14, 48);
    doc.text(`Toplam Boru Sayısı: ${totalPipeCount} adet`, 14, 54);
    doc.text(`Toplam Cihaz Sayısı: ${totalComponentCount} adet`, 14, 60);

    // Boru malzemeleri tablosu
    if (pipeSummary.length > 0) {
      (doc as any).autoTable({
        startY: 70,
        head: [['Çap', 'Malzeme', 'Toplam Uzunluk (m)', 'Adet']],
        body: pipeSummary.map(item => [
          item.diameter,
          item.material,
          item.length.toFixed(2),
          item.count
        ]),
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });
    }

    // Cihazlar tablosu
    if (componentSummary.length > 0) {
      const startY = (doc as any).lastAutoTable?.finalY + 10 || 140;
      
      (doc as any).autoTable({
        startY,
        head: [['Cihaz Tipi', 'Adet', 'İsimler']],
        body: componentSummary.map(item => [
          item.type.charAt(0).toUpperCase() + item.type.slice(1),
          item.count,
          item.names.join(', ')
        ]),
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 9 }
      });
    }

    // PDF kaydet
    doc.save(`FlowCAD_Malzeme_Listesi_${new Date().getTime()}.pdf`);
  };

  // ============================================
  // EXCEL EXPORT (gelişmiş)
  // ============================================

  const exportToExcel = () => {
    // XLSX kütüphanesi kullanılabilir (package.json'da mevcut)
    alert('Excel raporu özelliği yakında eklenecek!');
  };

  // ============================================
  // COMPONENT TYPE LABELS
  // ============================================

  const getComponentLabel = (type: string): string => {
    const labels: Record<string, string> = {
      valve: 'Vana',
      meter: 'Sayaç',
      boiler: 'Kombi',
      elbow: 'Dirsek'
    };
    return labels[type] || type;
  };

  const getComponentIcon = (type: string): string => {
    const icons: Record<string, string> = {
      valve: '⊗',
      meter: '⊞',
      boiler: '⊡',
      elbow: '↪'
    };
    return icons[type] || '⚙️';
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 max-w-5xl w-full">
      
      {/* ============================================
          HEADER - Başlık
          ============================================ */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span>📋</span>
              <span>Malzeme Listesi & Hesaplayıcı</span>
            </h3>
            <p className="text-sm text-green-100 mt-1">
              Boru ve cihaz malzemelerini detaylı hesaplayın
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Kapat"
            >
              <span className="text-2xl leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================
          SUMMARY CARDS - Özet Kartları
          ============================================ */}
      <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b">
        
        {/* Toplam Boru Uzunluğu */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📏</div>
            <div>
              <div className="text-xs text-gray-600 font-medium">Toplam Boru Uzunluğu</div>
              <div className="text-2xl font-bold text-green-600">
                {totalPipeLength.toFixed(2)} <span className="text-sm">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Boru Sayısı */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔧</div>
            <div>
              <div className="text-xs text-gray-600 font-medium">Toplam Boru Parçası</div>
              <div className="text-2xl font-bold text-blue-600">
                {totalPipeCount} <span className="text-sm">adet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Cihaz Sayısı */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚙️</div>
            <div>
              <div className="text-xs text-gray-600 font-medium">Toplam Cihaz</div>
              <div className="text-2xl font-bold text-purple-600">
                {totalComponentCount} <span className="text-sm">adet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT - Ana İçerik
          ============================================ */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        
        {/* Boş Durum */}
        {pipeSummary.length === 0 && componentSummary.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Henüz malzeme yok
            </h4>
            <p className="text-sm text-gray-500">
              Boru çizerek veya cihaz ekleyerek başlayın
            </p>
          </div>
        )}

        {/* BORU MALZEMELERİ */}
        {pipeSummary.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>🔧</span>
              <span>Boru Malzemeleri</span>
            </h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-50 border-b-2 border-blue-200">
                    <th className="text-left p-3 font-semibold text-gray-700">Çap</th>
                    <th className="text-left p-3 font-semibold text-gray-700">Malzeme</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Toplam Uzunluk</th>
                    <th className="text-right p-3 font-semibold text-gray-700">Parça Sayısı</th>
                  </tr>
                </thead>
                <tbody>
                  {pipeSummary.map((item, index) => (
                    <tr 
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-3 font-semibold text-blue-600">{item.diameter}</td>
                      <td className="p-3 text-gray-700">{item.material}</td>
                      <td className="p-3 text-right font-semibold text-green-600">
                        {item.length.toFixed(2)} m
                      </td>
                      <td className="p-3 text-right text-gray-700">
                        {item.count} adet
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-green-50 border-t-2 border-green-200 font-bold">
                    <td colSpan={2} className="p-3 text-gray-800">TOPLAM</td>
                    <td className="p-3 text-right text-green-700">
                      {totalPipeLength.toFixed(2)} m
                    </td>
                    <td className="p-3 text-right text-gray-800">
                      {totalPipeCount} adet
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* CİHAZ LİSTESİ */}
        {componentSummary.length > 0 && (
          <div>
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>⚙️</span>
              <span>Cihazlar</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {componentSummary.map((item, index) => (
                <div 
                  key={index}
                  className="bg-purple-50 border border-purple-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getComponentIcon(item.type)}</span>
                      <div>
                        <h5 className="font-semibold text-gray-800">
                          {getComponentLabel(item.type)}
                        </h5>
                        <p className="text-xs text-gray-600">
                          {item.count} adet
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {item.count}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">İsimler: </span>
                    <span>{item.names.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================
          FOOTER - Alt Butonlar
          ============================================ */}
      <div className="p-4 border-t bg-gray-50 flex justify-between items-center gap-3">
        
        {/* Sol: Bilgi */}
        <div className="text-xs text-gray-600">
          <p>
            📊 <span className="font-semibold">{pipeSummary.length}</span> farklı boru tipi, 
            <span className="font-semibold ml-1">{componentSummary.length}</span> farklı cihaz tipi
          </p>
        </div>

        {/* Sağ: Butonlar */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Kapat
          </button>
          
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm flex items-center gap-2"
          >
            <span>📊</span>
            <span>Excel İndir</span>
          </button>
          
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm flex items-center gap-2"
          >
            <span>📄</span>
            <span>PDF Rapor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCalculator;