// ============================================
// SNAP PANEL - Detaylı Snap Ayarları Paneli
// Tüm snap özelliklerini kontrol etmek için kullanılır
// ============================================

import React from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import { getSnapColor, getSnapIcon, getSnapDescription } from '../utils/snapUtils';

interface SnapPanelProps {
  onClose?: () => void;
}

export const SnapPanel: React.FC<SnapPanelProps> = ({ onClose }) => {
  const { snapSettings, toggleSnap, updateSnapSettings } = useDrawingStore();

  // Snap türleri tanımları
  const snapTypes = [
    { 
      key: 'snapToEndpoints' as const, 
      label: 'Uç Nokta', 
      icon: '□', 
      color: '#3b82f6',
      description: 'Boru başlangıç ve bitiş noktalarına yapış',
      shortcut: 'E'
    },
    { 
      key: 'snapToMidpoints' as const, 
      label: 'Orta Nokta', 
      icon: '△', 
      color: '#10b981',
      description: 'Boru orta noktalarına yapış',
      shortcut: 'Q'
    },
    { 
      key: 'snapToIntersections' as const, 
      label: 'Kesişim', 
      icon: '×', 
      color: '#f59e0b',
      description: 'Boru kesişim noktalarına yapış',
      shortcut: 'I'
    },
    { 
      key: 'snapToPerpendicular' as const, 
      label: 'Dik', 
      icon: '⊥', 
      color: '#8b5cf6',
      description: 'Dik noktalara yapış',
      shortcut: ''
    },
    { 
      key: 'snapToCenter' as const, 
      label: 'Merkez', 
      icon: '○', 
      color: '#ef4444',
      description: 'Component merkez noktalarına yapış',
      shortcut: ''
    },
    { 
      key: 'snapToGrid' as const, 
      label: 'Grid', 
      icon: '⊞', 
      color: '#6b7280',
      description: 'Grid noktalarına yapış',
      shortcut: 'G'
    }
  ];

  return (
    <div className="fixed right-4 top-20 bg-white rounded-xl shadow-2xl p-5 w-80 z-50 border border-gray-200">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧲</span>
          <h3 className="font-bold text-gray-800 text-lg">Snap Ayarları</h3>
        </div>
        
        {/* Kapat butonu */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Master Snap Toggle */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="font-semibold text-gray-800">Master Snap</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={snapSettings.enabled}
              onChange={() => toggleSnap('enabled')}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </label>
      </div>

      {/* Snap türleri */}
      <div className="space-y-2 mb-4">
        {snapTypes.map((snap) => (
          <button
            key={snap.key}
            onClick={() => toggleSnap(snap.key)}
            disabled={!snapSettings.enabled}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
              ${!snapSettings.enabled 
                ? 'opacity-40 cursor-not-allowed' 
                : 'cursor-pointer'
              }
              ${snapSettings[snap.key] && snapSettings.enabled
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-400 shadow-sm'
                : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }
            `}
            title={snap.description}
          >
            {/* İkon */}
            <span 
              style={{ color: snapSettings[snap.key] ? snap.color : '#9ca3af' }} 
              className="text-2xl font-bold"
            >
              {snap.icon}
            </span>
            
            {/* Label */}
            <span className="flex-1 text-left">
              <span className="font-medium text-gray-800 block">
                {snap.label}
              </span>
              <span className="text-xs text-gray-500">
                {snap.description}
              </span>
            </span>
            
            {/* Durum ve kısayol */}
            <div className="flex flex-col items-end gap-1">
              {snap.shortcut && (
                <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded">
                  {snap.shortcut}
                </kbd>
              )}
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${snapSettings[snap.key]
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {snapSettings[snap.key] ? 'AÇIK' : 'KAPALI'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Ayarlar */}
      <div className="border-t pt-4 space-y-4">
        {/* Snap Radius */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Snap Mesafesi
            </label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {snapSettings.snapRadius.toFixed(1)}m
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={snapSettings.snapRadius}
            onChange={(e) => updateSnapSettings({ snapRadius: parseFloat(e.target.value) })}
            disabled={!snapSettings.enabled}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.1m</span>
            <span>2.0m</span>
          </div>
        </div>
        
        {/* Grid Size */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Grid Boyutu
            </label>
            <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {snapSettings.gridSize.toFixed(2)}m
            </span>
          </div>
          <input
            type="range"
            min="0.25"
            max="5"
            step="0.25"
            value={snapSettings.gridSize}
            onChange={(e) => updateSnapSettings({ gridSize: parseFloat(e.target.value) })}
            disabled={!snapSettings.enabled || !snapSettings.snapToGrid}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.25m</span>
            <span>5.0m</span>
          </div>
        </div>
      </div>

      {/* Bilgi kutusu */}
      <div className="mt-4 text-xs text-gray-600 bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
        <p className="font-semibold mb-2 flex items-center gap-1">
          <span>💡</span> Klavye Kısayolları
        </p>
        <div className="space-y-1">
          <p>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">S</kbd> - Snap Paneli Aç/Kapat</p>
          <p>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">G</kbd> - Grid Snap</p>
          <p>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">E</kbd> - Endpoint Snap</p>
          <p>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">Q</kbd> - Midpoint Snap</p>
          <p>• <kbd className="px-1 py-0.5 bg-white border rounded text-xs">I</kbd> - Intersection Snap</p>
        </div>
      </div>
    </div>
  );
};

export default SnapPanel;