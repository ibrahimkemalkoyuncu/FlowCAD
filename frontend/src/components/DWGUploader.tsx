// ============================================
// DWGUploader.tsx - DWG Dosya Yükleme
// ============================================
import React, { useState, useRef } from 'react';
import { useBlueprintStore } from '../store/useBlueprintStore';
import { dwgParser } from '../services/dwgParser';
import type { ParsedDWG } from '../types/dwg';
import toast from 'react-hot-toast'; // ✅ YENİ EKLEME

interface DWGUploaderProps {
  onClose: () => void;
}

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
      toast.error('Sadece DXF veya DWG dosyaları desteklenir!'); // ✅ DÜZELTİLDİ
      return;
    }

    setSelectedFile(file);
    setParsing(true);
    toast.loading('DWG dosyası işleniyor...', { id: 'dwg-parse' }); // ✅ YENİ

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
      toast.success(`DWG başarıyla yüklendi! ${parsed.entities.length} entity bulundu.`, { id: 'dwg-parse' }); // ✅ DÜZELTİLDİ
      console.log('DWG parsed successfully:', parsed);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
      toast.error(`DWG dosyası okunamadı: ${errorMsg}`, { id: 'dwg-parse' }); // ✅ DÜZELTİLDİ
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
    toast.success(`${parsedDWG.entities.length} entity içe aktarıldı!`); // ✅ DÜZELTİLDİ
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">DWG/DXF Yükle</h2>
              <p className="text-sm text-orange-100 mt-1">AutoCAD çizimlerini içe aktarın</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-3xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* File Selection */}
          {!selectedFile && (
            <div className="text-center">
              <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-6xl mb-4">📐</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  DWG/DXF Dosyası Seçin
                </h3>
                <p className="text-gray-500 mb-4">
                  AutoCAD çizim dosyanızı yükleyin
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
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
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">ℹ️ Bilgi</h4>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• DXF dosyaları direkt olarak desteklenir</li>
                  <li>• DWG dosyaları için önce DXF'e dönüştürün</li>
                  <li>• AutoCAD, LibreCAD, QCAD çizimleri uyumludur</li>
                </ul>
              </div>
            </div>
          )}

          {/* Parsing Indicator */}
          {parsing && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-700">DWG dosyası işleniyor...</p>
              <p className="text-sm text-gray-500 mt-2">Bu işlem birkaç saniye sürebilir</p>
            </div>
          )}

          {/* Parsed Result */}
          {parsedDWG && selectedFile && !parsing && (
            <div className="space-y-6">
              {/* File Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">✅ Dosya Başarıyla Okundu</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Dosya:</span>
                    <span className="ml-2 text-green-900">{selectedFile.name}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Entity Sayısı:</span>
                    <span className="ml-2 text-green-900">{parsedDWG.entities.length}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Layer Sayısı:</span>
                    <span className="ml-2 text-green-900">{parsedDWG.layers.length}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Versiyon:</span>
                    <span className="ml-2 text-green-900">{parsedDWG.version}</span>
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-4">⚙️ İçe Aktarma Ayarları</h4>
                
                {/* Scale */}
                <div className="mb-4">
                  <label className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Ölçek Faktörü: {scale}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0.001"
                    max="1"
                    step="0.001"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.001 (mm → m)</span>
                    <span>0.01 (cm → m)</span>
                    <span>1.0 (m → m)</span>
                  </div>
                </div>

                {/* Center */}
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={centerDWG}
                      onChange={(e) => setCenterDWG(e.target.checked)}
                      className="w-5 h-5 text-orange-500 rounded"
                    />
                    <span className="text-sm text-gray-700 font-medium">
                      DWG'yi merkeze al
                    </span>
                  </label>
                </div>
              </div>

              {/* Entity Breakdown */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">📊 Entity Dağılımı</h4>
                <div className="space-y-2">
                  {Object.entries(
                    parsedDWG.entities.reduce((acc, e) => {
                      acc[e.type] = (acc[e.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-700">{type}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
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
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={!selectedFile}
          >
            ← Geri
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleImport}
              disabled={!parsedDWG}
              className={`
                px-6 py-2 rounded-lg font-medium transition-colors
                ${parsedDWG
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              İçe Aktar →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};