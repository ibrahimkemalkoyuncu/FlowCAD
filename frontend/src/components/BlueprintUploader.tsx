// ============================================
// BlueprintUploader.tsx - Blueprint Yükleme
// Konum: frontend/src/components/BlueprintUploader.tsx
// Backend olmadan lokal dosya yükleme desteği eklendi
// ============================================
import React, { useState, useRef, useEffect } from 'react';
import { useBlueprintStore, type Blueprint } from '../store/useBlueprintStore';
import toast from 'react-hot-toast';

// Sabitler
const PIXELS_PER_METER = 100;
const DEFAULT_CAD_WIDTH = 20;
const DEFAULT_CAD_HEIGHT = 20;

interface BlueprintUploaderProps {
  onClose: () => void;
}

export const BlueprintUploader: React.FC<BlueprintUploaderProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null); // Memory leak önleme için
  const { addBlueprint } = useBlueprintStore();

  // Temizlik: component unmount olduğunda URL'leri temizle
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

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
      toast.error('Desteklenmeyen dosya formatı! PNG, JPG, GIF, BMP, DXF veya DWG seçin.');
      return;
    }

    setSelectedFile(file);
    
    // Önceki önizleme URL'ini temizle
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    
    // Resim dosyaları için önizleme oluştur
    if (validTypes.includes(file.type)) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const loadingToast = toast.loading('Klavuz yükleniyor...');

    try {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(fileExtension || '');
      
      if (isImage) {
        // Resim dosyası - lokal olarak yükle
        const url = URL.createObjectURL(selectedFile);
        
        const img = new Image();
        img.onload = () => {
          const blueprint: Blueprint = {
            id: `blueprint_${Date.now()}`,
            name: selectedFile.name,
            type: 'image',
            url: url,
            width: img.width / PIXELS_PER_METER,
            height: img.height / PIXELS_PER_METER,
            scale: 1,
            position: { x: 0, y: 0.01, z: 0 },
            rotation: 0,
            opacity: 0.7,
            visible: true,
            locked: false
          };
          
          addBlueprint(blueprint);
          toast.success(`"${selectedFile.name}" başarıyla yüklendi!`, { id: loadingToast });
          onClose();
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          toast.error('Resim yüklenirken hata oluştu!', { id: loadingToast });
          setUploading(false);
        };
        
        img.src = url;
      } else {
        // DXF/DWG dosyası - lokal olarak yükle
        const url = URL.createObjectURL(selectedFile);
        
        const blueprint: Blueprint = {
          id: `blueprint_${Date.now()}`,
          name: selectedFile.name,
          type: fileExtension === 'dwg' ? 'dwg' : 'dxf',
          url: url,
          width: DEFAULT_CAD_WIDTH,
          height: DEFAULT_CAD_HEIGHT,
          scale: 1,
          position: { x: 0, y: 0.01, z: 0 },
          rotation: 0,
          opacity: 0.5,
          visible: true,
          locked: false
        };
        
        addBlueprint(blueprint);
        toast.success(`"${selectedFile.name}" başarıyla yüklendi!`, { id: loadingToast });
        onClose();
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Dosya yüklenirken hata oluştu!', { id: loadingToast });
      setUploading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 sm:px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">📋 Klavuz Yükle</h2>
            <p className="text-xs sm:text-sm text-purple-100 mt-1">Plan, çizim veya fotoğraf ekleyin</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Kapat"
          >
            <span className="text-2xl leading-none">✕</span>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Drag & Drop Area */}
          <div
            className={`
              border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all cursor-pointer
              ${dragActive 
                ? 'border-purple-500 bg-purple-50' 
                : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="space-y-3">
                {/* Önizleme */}
                {previewUrl && (
                  <div className="flex justify-center mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Önizleme" 
                      className="max-w-full max-h-32 rounded-lg shadow-md object-contain"
                    />
                  </div>
                )}
                
                <div className="text-4xl sm:text-5xl mb-2">
                  {previewUrl ? '🖼️' : '📄'}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-700 break-all px-2">
                  {selectedFile.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                >
                  ✕ Dosyayı Değiştir
                </button>
              </div>
            ) : (
              <>
                <div className="text-5xl sm:text-6xl mb-4">📋</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
                  Dosya sürükle-bırak
                </h3>
                <p className="text-gray-500 mb-4">
                  veya tıklayarak seçin
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-5 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium shadow-sm"
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
          <div className="mt-4 sm:mt-6 bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
            <h4 className="font-medium text-purple-900 mb-2 text-sm sm:text-base">📁 Desteklenen Formatlar:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-purple-700 font-medium mb-1">📷 Resim Dosyaları:</p>
                <p className="text-purple-600">PNG, JPG, JPEG, GIF, BMP</p>
              </div>
              <div>
                <p className="text-purple-700 font-medium mb-1">📐 CAD Dosyaları:</p>
                <p className="text-purple-600">DXF, DWG (AutoCAD)</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-4 rounded-b-xl border-t flex flex-col sm:flex-row justify-between gap-3 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium order-2 sm:order-1"
          >
            İptal
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors order-1 sm:order-2
              ${selectedFile && !uploading
                ? 'bg-purple-500 text-white hover:bg-purple-600 shadow-sm'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Yükleniyor...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>📥</span>
                Yükle
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};