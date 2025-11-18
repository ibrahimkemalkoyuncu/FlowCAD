// ============================================
// BlueprintUploader.tsx - Blueprint Yükleme
// ============================================
import React, { useState, useRef } from 'react';
import { useBlueprintStore, type Blueprint } from '../store/useBlueprintStore';
import { blueprintApi } from '../services/blueprintApi';
import toast from 'react-hot-toast'; // ✅ YENİ EKLEME
import { config } from '../config/env'; // ✅ YENİ EKLEME

interface BlueprintUploaderProps {
  onClose: () => void;
}

export const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBlueprint } = useBlueprintStore();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
    const validExtensions = ['.dxf', '.dwg'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast.error('Desteklenmeyen dosya formatı! PNG, JPG, GIF, BMP, DXF veya DWG seçin.'); // ✅ DÜZELTİLDİ
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const loadingToast = toast.loading('Dosya yükleniyor...'); // ✅ YENİ

    try {
      const result = await blueprintApi.upload(selectedFile);
      
      if (result.type === 'dxf' || result.type === 'dwg') {
        // DXF/DWG dosyası
        const blueprint: Blueprint = {
          id: `blueprint_${Date.now()}`,
          name: selectedFile.name,
          type: 'dxf',
          url: `${config.apiUrl}${result.url}`, // ✅ DÜZELTİLDİ
          width: 20,
          height: 20,
          scale: 1,
          position: { x: 0, y: 0, z: 0 },
          rotation: 0,
          opacity: 0.5,
          visible: true,
          locked: false
        };
        addBlueprint(blueprint);
        toast.success('DXF dosyası başarıyla yüklendi!', { id: loadingToast }); // ✅ DÜZELTİLDİ
        onClose();
      } else {
        // Resim dosyası
        const img = new Image();
        img.onload = () => {
          const blueprint: Blueprint = {
            id: `blueprint_${Date.now()}`,
            name: selectedFile.name,
            type: result.type === 'dxf' ? 'dxf' : 'image',
            url: `${config.apiUrl}${result.url}`, // ✅ DÜZELTİLDİ
            width: img.width / 100,
            height: img.height / 100,
            scale: 1,
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            opacity: 0.7,
            visible: true,
            locked: false
          };
          
          addBlueprint(blueprint);
          toast.success('Resim başarıyla yüklendi!', { id: loadingToast }); // ✅ DÜZELTİLDİ
          onClose();
        };
        
        img.onerror = () => {
          toast.error('Resim yüklenirken hata oluştu!', { id: loadingToast }); // ✅ YENİ
        };
        
        if (result.type !== 'dxf') {
          img.src = `${config.apiUrl}${result.url}`; // ✅ DÜZELTİLDİ
        }
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Dosya yüklenirken hata oluştu!', { id: loadingToast }); // ✅ DÜZELTİLDİ
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Klavuz Yükle</h2>
            <p className="text-sm text-blue-100 mt-1">Plan, çizim veya fotoğraf ekleyin</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-3xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Drag & Drop Area */}
          <div
            className={`
              border-3 border-dashed rounded-xl p-8 text-center transition-all
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <>
                <div className="text-5xl mb-3">📄</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Dosyayı Değiştir
                </button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Dosya sürükle-bırak
                </h3>
                <p className="text-gray-500 mb-4">
                  veya
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Dosya Seç
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.gif,.bmp,.dxf,.dwg"
                  onChange={handleFileInput}
                />
              </>
            )}
          </div>
          
          {/* Supported formats */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Desteklenen Formatlar:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-700 font-medium mb-1">📷 Resim Dosyaları:</p>
                <p className="text-blue-600">PNG, JPG, JPEG, GIF, BMP</p>
              </div>
              <div>
                <p className="text-blue-700 font-medium mb-1">📐 CAD Dosyaları:</p>
                <p className="text-blue-600">DXF (AutoCAD)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t flex justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`
              px-6 py-2 rounded-lg font-medium transition-colors
              ${selectedFile && !uploading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Yükleniyor...
              </span>
            ) : (
              'Yükle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};