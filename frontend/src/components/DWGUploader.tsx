// ============================================
// 4. src/components/DWGUploader.tsx - DWG Yükleme UI
// ============================================
import React, { useState, useRef } from 'react';
import { dwgParser } from '../services/dwgParser';
import { useBlueprintStore } from '../store/useBlueprintStore';
import type { ParsedDWG } from '../types/dwg';

interface DWGUploaderProps {
  onClose: () => void;
}

// AutoCAD renk tablosu fonksiyonu
const getACADColor = (colorIndex: number): string => {
  const acadColors: Record<number, string> = {
    1: '#FF0000', 2: '#FFFF00', 3: '#00FF00', 4: '#00FFFF',
    5: '#0000FF', 6: '#FF00FF', 7: '#FFFFFF', 8: '#808080'
  };
  return acadColors[colorIndex] || '#FFFFFF';
};

export const DWGUploader: React.FC<DWGUploaderProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedDWG, setParsedDWG] = useState<ParsedDWG | null>(null);
  const [scale, setScale] = useState(0.01); // AutoCAD genelde mm, biz metre
  const [centerDWG, setCenterDWG] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBlueprint } = useBlueprintStore();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.dxf') && !fileName.endsWith('.dwg')) {
      alert('Sadece DXF veya DWG dosyaları desteklenir!');
      return;
    }

    setSelectedFile(file);
    setParsing(true);

    try {
      const content = await file.text();
      let parsed = await dwgParser.parseDWG(content);
      
      // Ölçeklendir
      if (scale !== 1) {
        parsed = dwgParser.scaleDWG(parsed, scale);
      }
      
      // Merkeze al
      if (centerDWG) {
        parsed = dwgParser.centerDWG(parsed);
      }
      
      setParsedDWG(parsed);
      console.log('DWG parsed successfully:', parsed);
    } catch (error) {
      alert('DWG dosyası okunamadı: ' + (error as Error).message);
      console.error(error);
    } finally {
      setParsing(false);
    }
  };

  const handleImport = () => {
    if (!parsedDWG || !selectedFile) return;

    // DWG'yi blueprint olarak ekle
    const blueprint = {
      id: `dwg_${Date.now()}`,
      name: selectedFile.name,
      type: 'dxf' as const,
      url: '', // DWG verisi parsedDWG içinde
      width: parsedDWG.bounds.maxX - parsedDWG.bounds.minX,
      height: parsedDWG.bounds.maxY - parsedDWG.bounds.minY,
      scale: 1,
      position: { x: 0, y: 0, z: 0 },
      rotation: 0,
      opacity: 0.7,
      visible: true,
      locked: false,
      dwgData: parsedDWG // Ekstra veri
    };

    addBlueprint(blueprint as any);
    alert(`${parsedDWG.entities.length} entity içe aktarıldı!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">DWG/DXF İçe Aktar</h2>
              <p className="text-sm text-orange-100 mt-1">AutoCAD dosyalarını yükleyin</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          {/* File selector */}
          {!selectedFile && (
            <div className="border-3 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="text-6xl mb-4">📐</div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                DWG/DXF Dosyası Seçin
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium mt-4"
              >
                Dosya Seç
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".dxf,.dwg"
                onChange={handleFileSelect}
              />
              <div className="mt-4 text-sm text-gray-500">
                Desteklenen: .DXF, .DWG (AutoCAD R12-R2018)
              </div>
            </div>
          )}

          {/* Parsing */}
          {parsing && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mb-4"></div>
              <p className="text-lg font-medium text-gray-700">
                DWG dosyası işleniyor...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Bu işlem birkaç saniye sürebilir
              </p>
            </div>
          )}

          {/* Parsed result */}
          {parsedDWG && !parsing && (
            <div className="space-y-6">
              {/* File info */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">✅</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 text-lg">
                      {selectedFile?.name}
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Başarıyla parse edildi
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Toplam Entity</div>
                  <div className="text-3xl font-bold text-blue-900">
                    {parsedDWG.entities.length}
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Katmanlar</div>
                  <div className="text-3xl font-bold text-purple-900">
                    {parsedDWG.layers.length}
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Çizgiler</div>
                  <div className="text-3xl font-bold text-green-900">
                    {parsedDWG.entities.filter(e => e.type === 'LINE').length}
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="text-sm text-yellow-600 mb-1">Daireler</div>
                  <div className="text-3xl font-bold text-yellow-900">
                    {parsedDWG.entities.filter(e => e.type === 'CIRCLE').length}
                  </div>
                </div>
              </div>

              {/* Entity breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Entity Dağılımı</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(
                    parsedDWG.entities.reduce((acc, e) => {
                      acc[e.type] = (acc[e.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-gray-600">{type}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layers */}
              {parsedDWG.layers.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Katmanlar</h4>
                  <div className="max-h-40 overflow-y-auto space-y-1 text-sm">
                    {parsedDWG.layers.map((layer, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1">
                        <span className="text-gray-700">{layer.name}</span>
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: getACADColor(layer.color) }}
                          ></span>
                          {layer.visible && <span className="text-green-600 text-xs">👁️</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bounds */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-900 mb-3">Boyutlar</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-indigo-600">Genişlik:</span>
                    <span className="ml-2 font-semibold">
                      {(parsedDWG.bounds.maxX - parsedDWG.bounds.minX).toFixed(2)}m
                    </span>
                  </div>
                  <div>
                    <span className="text-indigo-600">Yükseklik:</span>
                    <span className="ml-2 font-semibold">
                      {(parsedDWG.bounds.maxY - parsedDWG.bounds.minY).toFixed(2)}m
                    </span>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-3">⚙️ İçe Aktarma Ayarları</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-yellow-800 block mb-1">
                      Ölçek Faktörü (AutoCAD mm → GasLine m)
                    </label>
                    <input
                      type="number"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      step="0.001"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-yellow-600 mt-1">
                      Önerilen: 0.01 (mm'den m'ye çevrim)
                    </p>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={centerDWG}
                      onChange={(e) => setCenterDWG(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-yellow-800">
                      DWG'yi merkeze al
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-between">
          <button
            onClick={() => {
              setSelectedFile(null);
              setParsedDWG(null);
            }}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            disabled={!selectedFile}
          >
            ← Geri
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              İptal
            </button>
            <button
              onClick={handleImport}
              disabled={!parsedDWG}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              ✅ İçe Aktar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};