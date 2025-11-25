// ============================================
// CONTEXT MENU - Sağ Tıklama Menüsü
// Konum: frontend/src/components/ContextMenu.tsx
// Sağ tıklama ile açılan context menu bileşeni
// ============================================

import React, { useEffect, useRef } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import toast from 'react-hot-toast';

// ============================================
// TYPES & INTERFACES
// ============================================

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onShowBlueprints: () => void;
  onShowMaterials: () => void;
  onShowSnapPanel: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  shortcut?: string;
  divider?: boolean;
  disabled?: boolean;
  submenu?: MenuItem[];
}

// ============================================
// CONTEXT MENU COMPONENT
// ============================================

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onShowBlueprints,
  onShowMaterials,
  onShowSnapPanel
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [submenuOpen, setSubmenuOpen] = React.useState<string | null>(null);
  
  const {
    mode,
    setMode,
    selectedId,
    deleteSelected,
    undo,
    redo,
    clearAll,
    pipes,
    components
  } = useDrawingStore();

  // ============================================
  // Click outside handler
  // ============================================
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // ============================================
  // Position adjustment to keep menu in viewport
  // ============================================
  
  const [adjustedPosition, setAdjustedPosition] = React.useState({ x, y });
  
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let newX = x;
      let newY = y;
      
      // Adjust if menu goes off right edge
      if (x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 10;
      }
      
      // Adjust if menu goes off bottom edge
      if (y + rect.height > viewportHeight) {
        newY = viewportHeight - rect.height - 10;
      }
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [x, y]);

  // ============================================
  // Menu Items Definition
  // ============================================
  
  const menuItems: MenuItem[] = [
    {
      id: 'select',
      label: 'Seç',
      icon: '👆',
      shortcut: 'V',
      action: () => {
        setMode('select');
        onClose();
        toast.success('Seçim modu aktif');
      }
    },
    {
      id: 'pipe',
      label: 'Boru Çiz',
      icon: '│',
      shortcut: 'P',
      action: () => {
        setMode('pipe');
        onClose();
        toast.success('Boru çizim modu aktif');
      }
    },
    {
      id: 'divider1',
      label: '',
      icon: '',
      action: () => {},
      divider: true
    },
    {
      id: 'components',
      label: 'Komponent Ekle',
      icon: '🔧',
      action: () => {},
      submenu: [
        {
          id: 'valve',
          label: 'Vana',
          icon: '⊗',
          shortcut: 'A',
          action: () => {
            setMode('valve');
            onClose();
            toast.success('Vana ekleme modu');
          }
        },
        {
          id: 'meter',
          label: 'Sayaç',
          icon: '⊞',
          shortcut: 'M',
          action: () => {
            setMode('meter');
            onClose();
            toast.success('Sayaç ekleme modu');
          }
        },
        {
          id: 'boiler',
          label: 'Kombi',
          icon: '⊡',
          shortcut: 'B',
          action: () => {
            setMode('boiler');
            onClose();
            toast.success('Kombi ekleme modu');
          }
        },
        {
          id: 'elbow',
          label: 'Dirsek',
          icon: '⌐',
          shortcut: 'E',
          action: () => {
            setMode('elbow');
            onClose();
            toast.success('Dirsek ekleme modu');
          }
        }
      ]
    },
    {
      id: 'divider2',
      label: '',
      icon: '',
      action: () => {},
      divider: true
    },
    {
      id: 'blueprint',
      label: 'Klavuz Ekle',
      icon: '📋',
      action: () => {
        onShowBlueprints();
        onClose();
      }
    },
    {
      id: 'materials',
      label: 'Malzeme Listesi',
      icon: '📦',
      action: () => {
        onShowMaterials();
        onClose();
      }
    },
    {
      id: 'snap',
      label: 'Snap Ayarları',
      icon: '🎯',
      shortcut: 'S',
      action: () => {
        onShowSnapPanel();
        onClose();
      }
    },
    {
      id: 'divider3',
      label: '',
      icon: '',
      action: () => {},
      divider: true
    },
    {
      id: 'delete',
      label: 'Seçili Sil',
      icon: '🗑️',
      shortcut: 'Del',
      disabled: !selectedId,
      action: () => {
        if (selectedId) {
          deleteSelected();
          onClose();
          toast.success('Seçili obje silindi');
        }
      }
    },
    {
      id: 'undo',
      label: 'Geri Al',
      icon: '↩️',
      shortcut: 'Ctrl+Z',
      action: () => {
        undo();
        onClose();
        toast.success('Geri alındı');
      }
    },
    {
      id: 'redo',
      label: 'İleri Al',
      icon: '↪️',
      shortcut: 'Ctrl+Y',
      action: () => {
        redo();
        onClose();
        toast.success('İleri alındı');
      }
    },
    {
      id: 'divider4',
      label: '',
      icon: '',
      action: () => {},
      divider: true
    },
    {
      id: 'clearAll',
      label: 'Tümünü Temizle',
      icon: '🧹',
      action: () => {
        if (pipes.length > 0 || components.length > 0) {
          toast((t) => (
            <div className="text-center">
              <p className="font-medium mb-3">Tüm çizim silinsin mi?</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => {
                    clearAll();
                    toast.dismiss(t.id);
                    toast.success('Tüm çizim temizlendi');
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Evet
                </button>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                >
                  İptal
                </button>
              </div>
            </div>
          ), { duration: Infinity });
        }
        onClose();
      }
    }
  ];

  // ============================================
  // Render Menu Item
  // ============================================
  
  const renderMenuItem = (item: MenuItem, _isSubmenu: boolean = false) => {
    if (item.divider) {
      return <div key={item.id} className="border-t border-gray-200 my-1" />;
    }

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = mode === item.id;

    return (
      <div
        key={item.id}
        className="relative"
        onMouseEnter={() => hasSubmenu && setSubmenuOpen(item.id)}
        onMouseLeave={() => hasSubmenu && setSubmenuOpen(null)}
      >
        <button
          onClick={() => !hasSubmenu && !item.disabled && item.action()}
          disabled={item.disabled}
          className={`
            w-full flex items-center gap-3 px-3 py-2 text-left text-sm
            ${item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-blue-50'}
            ${isActive ? 'bg-blue-100 text-blue-700' : ''}
            transition-colors duration-150
          `}
        >
          <span className="w-5 text-center">{item.icon}</span>
          <span className="flex-1">{item.label}</span>
          {item.shortcut && (
            <span className="text-xs text-gray-400">{item.shortcut}</span>
          )}
          {hasSubmenu && (
            <span className="text-gray-400">▶</span>
          )}
        </button>

        {/* Submenu */}
        {hasSubmenu && submenuOpen === item.id && (
          <div className="absolute left-full top-0 ml-1 bg-white rounded-lg shadow-xl border border-gray-200 min-w-[180px] py-1 z-50">
            {item.submenu!.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 min-w-[220px] py-1 z-50"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          FlowCAD Menü
        </span>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {menuItems.map(item => renderMenuItem(item))}
      </div>

      {/* Footer - Stats */}
      <div className="px-3 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Borular: {pipes.length}</span>
          <span>Komponentler: {components.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextMenu;
