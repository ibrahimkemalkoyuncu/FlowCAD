// ============================================
// BLUEPRINT ADD MODAL - Klavuz Ekle Modal Penceresi
// Konum: frontend/src/components/BlueprintAddModal.tsx
// Issue #7 - Sağ tıklama menüsünden "Klavuz Ekle" ile açılır
// ============================================

import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Text, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useBlueprintStore, type Blueprint } from '../store/useBlueprintStore';
import { dwgParser } from '../services/dwgParser';
import { blueprintApi } from '../services/blueprintApi';
import toast from 'react-hot-toast';
import type { ParsedDWG } from '../types/dwg';

// ============================================
// TYPES & INTERFACES
// ============================================

interface BlueprintAddModalProps {
  onClose: () => void;
}

interface PreviewState {
  parsedDWG: ParsedDWG | null;
  fileName: string;
  fileContent: string | null;
  file: File | null;
}

// ============================================
// DXF PREVIEW RENDERER
// ============================================

const DXFPreviewRenderer: React.FC<{ 
  parsedDWG: ParsedDWG | null; 
  scale: number;
  visibleLayers: string[];
}> = ({ parsedDWG, scale, visibleLayers }) => {
  if (!parsedDWG) return null;

  const filteredEntities = parsedDWG.entities.filter(e => 
    visibleLayers.includes(e.layer) || visibleLayers.length === 0
  );

  return (
    <group scale={scale}>
      {filteredEntities.map((entity, index) => {
        if (!entity.visible) return null;

        const color = getEntityColor(entity.color);

        switch (entity.type) {
          case 'LINE':
            if (!entity.vertices || entity.vertices.length < 2) return null;
            return (
              <Line
                key={index}
                points={entity.vertices.map(v => new THREE.Vector3(v.x, v.z || 0, -v.y))}
                color={color}
                lineWidth={1.5}
              />
            );
          
          case 'CIRCLE':
            if (!entity.position || !entity.radius) return null;
            const circlePoints: THREE.Vector3[] = [];
            for (let i = 0; i <= 64; i++) {
              const angle = (i / 64) * Math.PI * 2;
              circlePoints.push(new THREE.Vector3(
                entity.position.x + entity.radius * Math.cos(angle),
                entity.position.z || 0,
                -(entity.position.y + entity.radius * Math.sin(angle))
              ));
            }
            return <Line key={index} points={circlePoints} color={color} lineWidth={1.5} />;
          
          case 'ARC':
            if (!entity.position || !entity.radius) return null;
            const arcPoints: THREE.Vector3[] = [];
            const startAngle = (entity.startAngle || 0) * Math.PI / 180;
            const endAngle = (entity.endAngle || 360) * Math.PI / 180;
            for (let i = 0; i <= 32; i++) {
              const angle = startAngle + ((endAngle - startAngle) * i / 32);
              arcPoints.push(new THREE.Vector3(
                entity.position.x + entity.radius * Math.cos(angle),
                entity.position.z || 0,
                -(entity.position.y + entity.radius * Math.sin(angle))
              ));
            }
            return <Line key={index} points={arcPoints} color={color} lineWidth={1.5} />;
          
          case 'POLYLINE':
            if (!entity.vertices || entity.vertices.length < 2) return null;
            return (
              <Line
                key={index}
                points={entity.vertices.map(v => new THREE.Vector3(v.x, v.z || 0, -v.y))}
                color={color}
                lineWidth={1.5}
              />
            );
          
          case 'TEXT':
            if (!entity.position || !entity.text) return null;
            return (
              <Text
                key={index}
                position={[entity.position.x, (entity.position.z || 0) + 0.05, -entity.position.y]}
                rotation={[-Math.PI / 2, 0, entity.rotation || 0]}
                fontSize={(entity.height || 1) * 0.5}
                color={color}
                anchorX="left"
                anchorY="bottom"
              >
                {entity.text}
              </Text>
            );
          
          default:
            return null;
        }
      })}
    </group>
  );
};

// AutoCAD renk tablosu
function getEntityColor(colorIndex: number): string {
  const acadColors: Record<number, string> = {
    1: '#FF0000', 2: '#FFFF00', 3: '#00FF00', 4: '#00FFFF',
    5: '#0000FF', 6: '#FF00FF', 7: '#FFFFFF', 8: '#808080',
    9: '#C0C0C0', 250: '#333333',
  };
  return acadColors[colorIndex] || '#888888';
}

// ============================================
// MAIN MODAL COMPONENT
// ============================================

export const BlueprintAddModal: React.FC<BlueprintAddModalProps> = ({ onClose }) => {
  const { addBlueprint } = useBlueprintStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [preview, setPreview] = useState<PreviewState>({
    parsedDWG: null,
    fileName: '',
    fileContent: null,
    file: null
  });
  
  const [scale, setScale] = useState<number>(1.0);
  const [selectedUnit, setSelectedUnit] = useState<string>('mm');
  const [showLayerManager, setShowLayerManager] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculated dimensions
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  // ============================================
  // HANDLERS
  // ============================================

  // Dosya Aç butonu
  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  // Dosya seçildiğinde
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'dxf') {
      toast.error('Sadece DXF dosyaları desteklenmektedir!');
      return;
    }

    setIsLoading(true);
    
    try {
      const content = await file.text();
      const parsed = await dwgParser.parseDWG(content);
      
      // Set all layers as visible initially
      const layerNames = parsed.layers.map(l => l.name);
      setVisibleLayers(layerNames);
      
      // Calculate dimensions
      const width = parsed.bounds.maxX - parsed.bounds.minX;
      const height = parsed.bounds.maxY - parsed.bounds.minY;
      setDimensions({ width, height });
      
      setPreview({
        parsedDWG: parsed,
        fileName: file.name,
        fileContent: content,
        file: file
      });
      
      toast.success(`${file.name} yüklendi! ${parsed.entities.length} entity bulundu.`);
    } catch (error) {
      console.error('DXF parse error:', error);
      toast.error('DXF dosyası okunamadı!');
    } finally {
      setIsLoading(false);
    }
    
    e.target.value = '';
  };

  // Ölçeği Hesapla
  const handleCalculateScale = () => {
    if (!dimensions) {
      toast.error('Önce bir DXF dosyası yükleyin!');
      return;
    }
    
    // Birim dönüşümleri (hedef: metre)
    const unitFactors: Record<string, number> = {
      'mm': 0.001,
      'cm': 0.01,
      'm': 1,
      'inch': 0.0254,
      'feet': 0.3048
    };
    
    const factor = unitFactors[selectedUnit] || 1;
    const calculatedScale = factor;
    
    setScale(calculatedScale);
    toast.success(`Ölçek hesaplandı: ${calculatedScale.toFixed(4)} (${selectedUnit} → metre)`);
  };

  // Layer toggle
  const handleLayerToggle = (layerName: string) => {
    setVisibleLayers(prev => {
      if (prev.includes(layerName)) {
        return prev.filter(l => l !== layerName);
      } else {
        return [...prev, layerName];
      }
    });
  };

  // Tüm layerları seç/kaldır
  const handleSelectAllLayers = (select: boolean) => {
    if (select && preview.parsedDWG) {
      setVisibleLayers(preview.parsedDWG.layers.map(l => l.name));
    } else {
      setVisibleLayers([]);
    }
  };

  // Duvar Oluştur
  const handleCreateWall = () => {
    if (!preview.parsedDWG) {
      toast.error('Önce bir DXF dosyası yükleyin!');
      return;
    }
    
    // TODO: Duvar oluşturma işlevi - gelecek geliştirme
    toast.success('Duvar oluşturma özelliği yakında eklenecek!');
  };

  // Klavuz Olarak Al
  const handleImportAsBlueprint = async () => {
    if (!preview.parsedDWG || !preview.file) {
      toast.error('Önce bir DXF dosyası yükleyin!');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Klavuz olarak alınıyor...');

    try {
      // Scale and center the DWG
      let processedDWG = dwgParser.scaleDWG(preview.parsedDWG, scale);
      processedDWG = dwgParser.centerDWG(processedDWG);
      
      // Filter by visible layers
      processedDWG = {
        ...processedDWG,
        entities: processedDWG.entities.filter(e => 
          visibleLayers.includes(e.layer) || visibleLayers.length === 0
        )
      };
      
      // Upload file to server
      const result = await blueprintApi.upload(preview.file);
      const apiUrl = import.meta.env.VITE_API_URL || 'https://localhost:7121';
      
      // Create blueprint with proper type
      const blueprint: Blueprint = {
        id: `blueprint_${Date.now()}`,
        name: preview.fileName,
        type: 'dxf',
        url: `${apiUrl}${result.url}`,
        width: processedDWG.bounds.maxX - processedDWG.bounds.minX,
        height: processedDWG.bounds.maxY - processedDWG.bounds.minY,
        scale: 1,
        position: { x: 0, y: 0.1, z: 0 },
        rotation: 0,
        opacity: 1.0,
        visible: true,
        locked: false,
        dwgData: processedDWG
      };
      
      addBlueprint(blueprint);
      toast.success('Klavuz başarıyla eklendi!', { id: loadingToast });
      onClose();
      
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Klavuz eklenirken hata oluştu!', { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="font-bold text-xl">Klavuz Ekle</h2>
              <p className="text-xs text-purple-200">DXF dosyası yükle ve ayarla</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-100 border-b px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".dxf"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          
          {/* 1. Dosya Aç */}
          <button
            onClick={handleOpenFile}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 font-medium"
            disabled={isLoading}
          >
            <span>📂</span>
            <span>Dosya Aç</span>
          </button>
          
          {/* 2. Layer Yöneticisi */}
          <button
            onClick={() => setShowLayerManager(!showLayerManager)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium ${
              showLayerManager 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            disabled={!preview.parsedDWG}
          >
            <span>📐</span>
            <span>Layer Yöneticisi</span>
          </button>
          
          {/* 3. Birim Seçimi (Combobox) */}
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white text-gray-700 focus:ring-2 focus:ring-purple-500"
          >
            <option value="mm">Milimetre (mm)</option>
            <option value="cm">Santimetre (cm)</option>
            <option value="m">Metre (m)</option>
            <option value="inch">İnç (inch)</option>
            <option value="feet">Feet (ft)</option>
          </select>
          
          {/* 4. Çizim Ölçeği */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Ölçek:</label>
            <input
              type="number"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
              step="0.001"
              min="0.001"
              className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* 5. Ölçeği Hesapla */}
          <button
            onClick={handleCalculateScale}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 font-medium"
            disabled={!preview.parsedDWG}
          >
            <span>🧮</span>
            <span>Ölçeği Hesapla</span>
          </button>
          
          {/* 6. Duvar Oluştur */}
          <button
            onClick={handleCreateWall}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 font-medium"
            disabled={!preview.parsedDWG}
          >
            <span>🧱</span>
            <span>Duvar Oluştur</span>
          </button>
          
          {/* 7. Klavuz Olarak Al */}
          <button
            onClick={handleImportAsBlueprint}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
            disabled={!preview.parsedDWG || isLoading}
          >
            <span>✅</span>
            <span>Klavuz Olarak Al</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Layer Manager Sidebar */}
          {showLayerManager && preview.parsedDWG && (
            <div className="w-64 bg-gray-50 border-r overflow-y-auto">
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Katmanlar</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSelectAllLayers(true)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      title="Tümünü Seç"
                    >
                      ✓ Tümü
                    </button>
                    <button
                      onClick={() => handleSelectAllLayers(false)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      title="Tümünü Kaldır"
                    >
                      ✗ Hiçbiri
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {preview.parsedDWG.layers.map((layer, index) => (
                    <label
                      key={index}
                      className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleLayers.includes(layer.name)}
                        onChange={() => handleLayerToggle(layer.name)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: getEntityColor(layer.color) }}
                      />
                      <span className="text-sm text-gray-700 truncate flex-1">
                        {layer.name || '(Adsız)'}
                      </span>
                      {layer.frozen && <span className="text-xs">❄️</span>}
                      {layer.locked && <span className="text-xs">🔒</span>}
                    </label>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Toplam Katman:</span>
                    <span className="font-semibold">{preview.parsedDWG.layers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Görünen:</span>
                    <span className="font-semibold">{visibleLayers.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Canvas */}
          <div className="flex-1 relative bg-gray-900">
            {preview.parsedDWG ? (
              <Canvas
                camera={{ position: [0, 50, 0], fov: 60 }}
                className="w-full h-full"
              >
                <color attach="background" args={['#1a1a2e']} />
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} />
                
                {/* Grid */}
                <Grid
                  args={[100, 100]}
                  cellSize={1}
                  cellColor="#333366"
                  sectionSize={10}
                  sectionColor="#4444aa"
                  fadeDistance={100}
                  position={[0, 0, 0]}
                />
                
                {/* DXF Preview */}
                <DXFPreviewRenderer 
                  parsedDWG={preview.parsedDWG} 
                  scale={scale}
                  visibleLayers={visibleLayers}
                />
                
                <OrbitControls 
                  makeDefault
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                />
              </Canvas>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                <span className="text-8xl mb-4">📋</span>
                <p className="text-xl font-medium">DXF Dosyası Seçin</p>
                <p className="text-sm mt-2">Önizleme görmek için "Dosya Aç" butonuna tıklayın</p>
              </div>
            )}
            
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin text-4xl mb-2">⚙️</div>
                  <p>İşleniyor...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - File Info */}
        {preview.parsedDWG && (
          <div className="bg-gray-100 border-t px-6 py-3 flex justify-between items-center text-sm">
            <div className="flex gap-6 text-gray-600">
              <span><strong>Dosya:</strong> {preview.fileName}</span>
              <span><strong>Entity:</strong> {preview.parsedDWG.entities.length}</span>
              <span><strong>Katman:</strong> {preview.parsedDWG.layers.length}</span>
              {dimensions && (
                <>
                  <span><strong>Genişlik:</strong> {(dimensions.width * scale).toFixed(2)} m</span>
                  <span><strong>Yükseklik:</strong> {(dimensions.height * scale).toFixed(2)} m</span>
                </>
              )}
            </div>
            <div className="text-gray-500">
              <span>DXF Version: {preview.parsedDWG.version}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlueprintAddModal;
