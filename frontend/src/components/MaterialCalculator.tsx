// ============================================
// MATERIAL CALCULATOR - Malzeme Listesi ve Hesaplayıcı
// Konum: frontend/src/components/MaterialCalculator.tsx
// Boru ve cihaz malzemelerini hesaplar, rapor çıkarır
// Excel ve PDF dışa aktarma özelliği
// ============================================

import React, { useMemo, useState } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

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
// CONSTANTS
// ============================================

const COMPONENT_LABELS: Record<string, string> = {
  valve: 'Vana',
  meter: 'Sayaç',
  boiler: 'Kombi',
  elbow: 'Dirsek',
  tee: 'Te',
  reducer: 'Redüksiyon',
  pump: 'Pompa',
  filter: 'Filtre'
};

const COMPONENT_ICONS: Record<string, string> = {
  valve: '🔴',
  meter: '📟',
  boiler: '🔥',
  elbow: '↪️',
  tee: '⚡',
  reducer: '📐',
  pump: '💧',
  filter: '🔷'
};

// ============================================
// MATERIAL CALCULATOR COMPONENT
// ============================================

const MaterialCalculator: React.FC<MaterialCalculatorProps> = ({ onClose }) => {
  const { pipes, components } = useDrawingStore();
  const [activeTab, setActiveTab] = useState<'summary' | 'pipes' | 'components'>('summary');
  const [exporting, setExporting] = useState(false);

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
  // HELPER FUNCTIONS
  // ============================================

  const getComponentLabel = (type: string): string => {
    return COMPONENT_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getComponentIcon = (type: string): string => {
    return COMPONENT_ICONS[type] || '⚙️';
  };

  const formatDate = (): string => {
    return new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================
  // EXCEL EXPORT
  // ============================================

  const exportToExcel = async () => {
    setExporting(true);
    const loadingToast = toast.loading('Excel raporu hazırlanıyor...');

    try {
      // Workbook oluştur
      const wb = XLSX.utils.book_new();

      // Özet sayfası
      const summaryData = [
        ['FlowCAD Malzeme Raporu'],
        [''],
        ['Oluşturma Tarihi:', formatDate()],
        [''],
        ['PROJE ÖZETİ'],
        ['Toplam Boru Uzunluğu:', `${totalPipeLength.toFixed(2)} m`],
        ['Toplam Boru Parçası:', `${totalPipeCount} adet`],
        ['Toplam Cihaz:', `${totalComponentCount} adet`],
        ['Farklı Boru Tipi:', `${pipeSummary.length} çeşit`],
        ['Farklı Cihaz Tipi:', `${componentSummary.length} çeşit`]
      ];
      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Sütun genişlikleri
      summaryWs['!cols'] = [{ wch: 25 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Özet');

      // Boru malzemeleri sayfası
      if (pipeSummary.length > 0) {
        const pipeData = [
          ['Çap', 'Malzeme', 'Toplam Uzunluk (m)', 'Parça Sayısı'],
          ...pipeSummary.map(item => [
            item.diameter,
            item.material,
            Number(item.length.toFixed(2)),
            item.count
          ]),
          [''],
          ['TOPLAM', '', Number(totalPipeLength.toFixed(2)), totalPipeCount]
        ];
        const pipeWs = XLSX.utils.aoa_to_sheet(pipeData);
        pipeWs['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, pipeWs, 'Borular');
      }

      // Cihazlar sayfası
      if (componentSummary.length > 0) {
        const componentData = [
          ['Cihaz Tipi', 'Adet', 'İsimler'],
          ...componentSummary.map(item => [
            getComponentLabel(item.type),
            item.count,
            item.names.join(', ')
          ]),
          [''],
          ['TOPLAM', totalComponentCount, '']
        ];
        const componentWs = XLSX.utils.aoa_to_sheet(componentData);
        componentWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 50 }];
        XLSX.utils.book_append_sheet(wb, componentWs, 'Cihazlar');
      }

      // Detaylı boru listesi
      if (pipes.length > 0) {
        const detailData = [
          ['#', 'Çap', 'Malzeme', 'Uzunluk (m)', 'Başlangıç X', 'Başlangıç Z', 'Bitiş X', 'Bitiş Z'],
          ...pipes.map((pipe, index) => [
            index + 1,
            pipe.diameter,
            pipe.material,
            Number((pipe.length || 0).toFixed(2)),
            Number(pipe.start.x.toFixed(2)),
            Number(pipe.start.z.toFixed(2)),
            Number(pipe.end.x.toFixed(2)),
            Number(pipe.end.z.toFixed(2))
          ])
        ];
        const detailWs = XLSX.utils.aoa_to_sheet(detailData);
        detailWs['!cols'] = [
          { wch: 5 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
          { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
        ];
        XLSX.utils.book_append_sheet(wb, detailWs, 'Detaylı Boru Listesi');
      }

      // Excel dosyasını indir
      const fileName = `FlowCAD_Malzeme_Raporu_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success('Excel raporu başarıyla indirildi!', { id: loadingToast });
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Excel raporu oluşturulurken hata oluştu!', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // PDF EXPORT
  // ============================================

  const exportToPDF = async () => {
    setExporting(true);
    const loadingToast = toast.loading('PDF raporu hazırlanıyor...');

    try {
      const doc = new jsPDF();
      
      // Başlık
      doc.setFontSize(22);
      doc.setTextColor(16, 185, 129); // green-500
      doc.text('FlowCAD', 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text('Malzeme Listesi Raporu', 14, 28);
      
      doc.setFontSize(9);
      doc.setTextColor(150);
      doc.text(`Oluşturma: ${formatDate()}`, 14, 35);
      
      // Özet kutusu
      doc.setFillColor(240, 253, 244); // green-50
      doc.roundedRect(14, 42, 182, 30, 3, 3, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(21, 128, 61); // green-700
      doc.text('Proje Özeti', 20, 52);
      
      doc.setFontSize(10);
      doc.setTextColor(60);
      doc.text(`• Toplam Boru Uzunluğu: ${totalPipeLength.toFixed(2)} m`, 20, 60);
      doc.text(`• Toplam Boru Parçası: ${totalPipeCount} adet`, 80, 60);
      doc.text(`• Toplam Cihaz: ${totalComponentCount} adet`, 140, 60);
      doc.text(`• Farklı Boru Tipi: ${pipeSummary.length}`, 20, 68);
      doc.text(`• Farklı Cihaz Tipi: ${componentSummary.length}`, 80, 68);

      // Boru malzemeleri tablosu
      if (pipeSummary.length > 0) {
        (doc as any).autoTable({
          startY: 80,
          head: [['Çap', 'Malzeme', 'Toplam Uzunluk (m)', 'Parça Sayısı']],
          body: [
            ...pipeSummary.map(item => [
              item.diameter,
              item.material,
              item.length.toFixed(2),
              item.count.toString()
            ]),
            [{ content: 'TOPLAM', colSpan: 2, styles: { fontStyle: 'bold' } }, 
             { content: totalPipeLength.toFixed(2), styles: { fontStyle: 'bold' } },
             { content: totalPipeCount.toString(), styles: { fontStyle: 'bold' } }]
          ],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 4 },
          alternateRowStyles: { fillColor: [240, 253, 244] }
        });
      }

      // Cihazlar tablosu
      if (componentSummary.length > 0) {
        const startY = (doc as any).lastAutoTable?.finalY + 15 || 140;
        
        doc.setFontSize(12);
        doc.setTextColor(60);
        doc.text('Cihaz Listesi', 14, startY - 5);
        
        (doc as any).autoTable({
          startY,
          head: [['Cihaz Tipi', 'Adet', 'İsimler']],
          body: [
            ...componentSummary.map(item => [
              getComponentLabel(item.type),
              item.count.toString(),
              item.names.length > 3 ? item.names.slice(0, 3).join(', ') + '...' : item.names.join(', ')
            ]),
            [{ content: 'TOPLAM', styles: { fontStyle: 'bold' } },
             { content: totalComponentCount.toString(), styles: { fontStyle: 'bold' } },
             '']
          ],
          theme: 'striped',
          headStyles: { fillColor: [139, 92, 246], textColor: 255 },
          styles: { fontSize: 9, cellPadding: 4 },
          alternateRowStyles: { fillColor: [245, 243, 255] }
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`FlowCAD - Sayfa ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text('www.flowcad.app', doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
      }

      // PDF kaydet
      const fileName = `FlowCAD_Malzeme_Raporu_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success('PDF raporu başarıyla indirildi!', { id: loadingToast });
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF raporu oluşturulurken hata oluştu!', { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-w-5xl w-full mx-4">
      
      {/* ============================================
          HEADER - Başlık
          ============================================ */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span>Malzeme Listesi & Hesaplayıcı</span>
            </h3>
            <p className="text-xs sm:text-sm text-green-100 mt-1">
              Profesyonel malzeme raporu oluşturun
            </p>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-xl transition-colors"
              title="Kapat"
              aria-label="Kapat"
            >
              <span className="text-2xl leading-none">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================
          SUMMARY CARDS - Özet Kartları
          ============================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-b from-gray-50 to-white border-b">
        
        {/* Toplam Boru Uzunluğu */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📏</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Toplam Uzunluk</div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                {totalPipeLength.toFixed(2)} <span className="text-sm font-normal">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Boru Sayısı */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Boru Parçası</div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                {totalPipeCount} <span className="text-sm font-normal">adet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toplam Cihaz Sayısı */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚙️</span>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Toplam Cihaz</div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {totalComponentCount} <span className="text-sm font-normal">adet</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          TAB NAVIGATION - Sekme Navigasyonu
          ============================================ */}
      <div className="flex border-b bg-gray-50 px-4 sm:px-6">
        {[
          { id: 'summary', label: 'Özet', icon: '📋' },
          { id: 'pipes', label: 'Borular', icon: '🔧', count: pipeSummary.length },
          { id: 'components', label: 'Cihazlar', icon: '⚙️', count: componentSummary.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-emerald-500 text-emerald-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`
                text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ============================================
          MAIN CONTENT - Ana İçerik
          ============================================ */}
      <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
        
        {/* Boş Durum */}
        {pipeSummary.length === 0 && componentSummary.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📊</span>
            </div>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">
              Henüz malzeme yok
            </h4>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Çizim alanında boru çizerek veya cihaz ekleyerek malzeme listenizi oluşturmaya başlayın.
            </p>
          </div>
        )}

        {/* ÖZET GÖRÜNÜMÜ */}
        {activeTab === 'summary' && (pipeSummary.length > 0 || componentSummary.length > 0) && (
          <div className="space-y-6">
            {/* Hızlı İstatistikler */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{pipeSummary.length}</div>
                <div className="text-xs text-emerald-700">Boru Tipi</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalPipeCount}</div>
                <div className="text-xs text-blue-700">Boru Parçası</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{componentSummary.length}</div>
                <div className="text-xs text-purple-700">Cihaz Tipi</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{totalComponentCount}</div>
                <div className="text-xs text-orange-700">Toplam Cihaz</div>
              </div>
            </div>

            {/* Özet Listeler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Boru Özeti */}
              {pipeSummary.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🔧</span> En Çok Kullanılan Borular
                  </h5>
                  <div className="space-y-2">
                    {pipeSummary.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                        <span className="text-sm font-medium text-gray-700">{item.diameter} {item.material}</span>
                        <span className="text-sm text-emerald-600 font-semibold">{item.length.toFixed(1)}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cihaz Özeti */}
              {componentSummary.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>⚙️</span> Cihaz Dağılımı
                  </h5>
                  <div className="space-y-2">
                    {componentSummary.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span>{getComponentIcon(item.type)}</span>
                          {getComponentLabel(item.type)}
                        </span>
                        <span className="text-sm text-purple-600 font-semibold">{item.count} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BORU MALZEMELERİ */}
        {activeTab === 'pipes' && pipeSummary.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-200">
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
                    className="border-b hover:bg-emerald-50/50 transition-colors"
                  >
                    <td className="p-3 font-semibold text-emerald-600">{item.diameter}</td>
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
                <tr className="bg-gradient-to-r from-emerald-100 to-green-100 border-t-2 border-emerald-300 font-bold">
                  <td colSpan={2} className="p-3 text-gray-800">TOPLAM</td>
                  <td className="p-3 text-right text-emerald-700">
                    {totalPipeLength.toFixed(2)} m
                  </td>
                  <td className="p-3 text-right text-gray-800">
                    {totalPipeCount} adet
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* CİHAZ LİSTESİ */}
        {activeTab === 'components' && componentSummary.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {componentSummary.map((item, index) => (
              <div 
                key={index}
                className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                      <span className="text-xl">{getComponentIcon(item.type)}</span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800">
                        {getComponentLabel(item.type)}
                      </h5>
                      <p className="text-xs text-gray-500">
                        {item.count} adet
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {item.count}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 bg-white/50 rounded-lg p-2">
                  <span className="font-medium text-gray-700">İsimler: </span>
                  <span>{item.names.length > 5 ? item.names.slice(0, 5).join(', ') + '...' : item.names.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Boş Sekme Durumları */}
        {activeTab === 'pipes' && pipeSummary.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl">🔧</span>
            <p className="text-gray-500 mt-2">Henüz boru çizilmedi</p>
          </div>
        )}
        {activeTab === 'components' && componentSummary.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl">⚙️</span>
            <p className="text-gray-500 mt-2">Henüz cihaz eklenmedi</p>
          </div>
        )}
      </div>

      {/* ============================================
          FOOTER - Alt Butonlar
          ============================================ */}
      <div className="p-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* Sol: Bilgi */}
        <div className="text-xs text-gray-500 text-center sm:text-left">
          <p className="flex items-center gap-1 justify-center sm:justify-start">
            <span>📅</span>
            <span>{formatDate()}</span>
          </p>
        </div>

        {/* Sağ: Butonlar */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Kapat
          </button>
          
          <button
            onClick={exportToExcel}
            disabled={exporting || (pipeSummary.length === 0 && componentSummary.length === 0)}
            className={`
              px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 text-sm transition-all
              ${exporting || (pipeSummary.length === 0 && componentSummary.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600 hover:shadow-md'
              }
            `}
          >
            <span>📊</span>
            <span>Excel</span>
          </button>
          
          <button
            onClick={exportToPDF}
            disabled={exporting || (pipeSummary.length === 0 && componentSummary.length === 0)}
            className={`
              px-4 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 text-sm transition-all
              ${exporting || (pipeSummary.length === 0 && componentSummary.length === 0)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md'
              }
            `}
          >
            <span>📄</span>
            <span>PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCalculator;