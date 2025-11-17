// ============================================
// 2. src/components/BlueprintUploader.tsx - Upload Modal
// ============================================
import React, { useState, useRef } from 'react';
import { useBlueprintStore, type Blueprint } from '../store/useBlueprintStore';
import { blueprintApi } from '../services/blueprintApi';

interface BlueprintUploaderProps {
  onClose: () => void;
}

export const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({ onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addBlueprint } = useBlueprintStore();
  
  const supportedFormats = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'],
    cad: ['application/dxf', 'application/dwg', '.dxf', '.dwg']
  };
  
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
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const fileType = file.type.toLowerCase();
    
    // Check if file is supported
    const isImage = supportedFormats.image.some(type => 
      fileType.includes(type.replace('image/', ''))
    );
    const isCAD = fileName.endsWith('.dxf') || fileName.endsWith('.dwg');
    
    if (!isImage && !isCAD) {
      alert('Desteklenmeyen dosya formatı! PNG, JPG, DXF veya DWG yükleyebilirsiniz.');
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    try {
      // Dosyayı backend'e yükle
      const result = await blueprintApi.upload(selectedFile);
      
      // Blueprint objesini oluştur
      const img = new Image();
      img.onload = () => {
        const blueprint: Blueprint = {
          id: `blueprint_${Date.now()}`,
          name: selectedFile.name,
          type: result.type === 'dxf' ? 'dxf' : 'image',
          url: `https://localhost:7121${result.url}`, // Backend URL
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
        onClose();
      };
      
      if (result.type !== 'dxf') {
        img.src = `https://localhost:7121${result.url}`;
      } else {
        // DXF için direkt ekle
        const blueprint: Blueprint = {
          id: `blueprint_${Date.now()}`,
          name: selectedFile.name,
          type: 'dxf',
          url: `https://localhost:7121${result.url}`,
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
        onClose();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Dosya yüklenirken hata oluştu!');
    } finally {
      setUploading(false);
    }
  };
  
  // handleDXFUpload fonksiyonu kaldırıldı - kullanılmıyor
  
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
            {previewUrl ? (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <p className="text-sm text-gray-600">{selectedFile?.name}</p>
              </div>
            ) : (
              <>
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Dosyayı buraya sürükleyin
                </p>
                <p className="text-sm text-gray-500 mb-4">veya</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Dosya Seç
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.jpg,.jpeg,.gif,.bmp,.dxf,.dwg"
                  onChange={handleFileSelect}
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
                <p className="text-xs text-blue-500 mt-1">DWG desteği yakında...</p>
              </div>
            </div>
          </div>
          
          {/* Tips */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">💡 İpuçları:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Yüksek çözünürlüklü görseller daha iyi sonuç verir</li>
              <li>• DXF dosyaları otomatik olarak ölçeklendirilir</li>
              <li>• Yüklenen klavuzun üzerinde çizim yapabilirsiniz</li>
              <li>• Birden fazla klavuz ekleyebilirsiniz</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex justify-end gap-3">
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
              px-5 py-2 rounded-lg transition-colors
              ${selectedFile && !uploading
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {uploading ? 'Yükleniyor...' : 'Klavuzu Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};