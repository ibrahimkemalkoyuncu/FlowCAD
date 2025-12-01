// ============================================
// COMMAND LINE - AutoCAD Benzeri Komut Satırı
// Konum: frontend/src/components/CommandLine.tsx
// AutoCAD tarzı komut satırı arayüzü
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import toast from 'react-hot-toast';

// ============================================
// INTERFACE
// ============================================

interface CommandLineProps {
  onOpenDXF?: () => void;
  onShowMaterials?: () => void;
  onShowBlueprints?: () => void;
  onNewProject?: () => void;
}

interface CommandHistory {
  command: string;
  response: string;
  timestamp: Date;
  type: 'success' | 'error' | 'info';
}

// ============================================
// COMMAND DEFINITIONS
// ============================================

const COMMANDS: Record<string, { description: string; aliases: string[] }> = {
  LINE: { description: 'Boru çizimi başlat', aliases: ['L', 'BORU', 'PIPE'] },
  SELECT: { description: 'Seçim modu', aliases: ['S', 'SEC', 'SEÇ'] },
  DELETE: { description: 'Seçili nesneyi sil', aliases: ['D', 'DEL', 'SIL', 'ERASE', 'E'] },
  UNDO: { description: 'Son işlemi geri al', aliases: ['U', 'GERI'] },
  REDO: { description: 'Geri alınan işlemi yinele', aliases: ['R', 'ILERI'] },
  ZOOM: { description: 'Yakınlaştır/Uzaklaştır', aliases: ['Z'] },
  PAN: { description: 'Görünümü kaydır', aliases: ['P'] },
  SNAP: { description: 'Snap ayarlarını aç/kapat', aliases: ['SN', 'YAKALAMA'] },
  GRID: { description: 'Grid görünümünü aç/kapat', aliases: ['G', 'IZGARA'] },
  ORTHO: { description: 'Ortogonal modu aç/kapat', aliases: ['O', 'DORTGEN'] },
  NEW: { description: 'Yeni proje oluştur', aliases: ['N', 'YENI'] },
  OPEN: { description: 'DXF dosyası aç', aliases: ['CTRL+O', 'AC', 'AÇ'] },
  SAVE: { description: 'Projeyi kaydet', aliases: ['CTRL+S', 'KAYDET'] },
  EXPORT: { description: 'Dışa aktar', aliases: ['EXP', 'DISARI'] },
  MATERIALS: { description: 'Malzeme listesi', aliases: ['M', 'MAT', 'MALZEME'] },
  BLUEPRINT: { description: 'Klavuz panel', aliases: ['B', 'KLAVUZ'] },
  CLEAR: { description: 'Tüm çizimleri temizle', aliases: ['CL', 'TEMIZLE'] },
  HELP: { description: 'Komut yardımı', aliases: ['?', 'H', 'YARDIM'] },
  VALVE: { description: 'Vana ekle', aliases: ['V', 'VA', 'VANA'] },
  METER: { description: 'Sayaç ekle', aliases: ['ME', 'SAYAC'] },
  BOILER: { description: 'Kombi ekle', aliases: ['BO', 'KOMBI'] },
  DIAMETER: { description: 'Boru çapı ayarla', aliases: ['DI', 'CAP', 'ÇAP'] },
  LIST: { description: 'Nesneleri listele', aliases: ['LS', 'LISTE'] },
  PROPERTIES: { description: 'Özellikler paneli', aliases: ['PR', 'OZELLIK'] },
  DISTANCE: { description: 'Mesafe ölç', aliases: ['DIS', 'MESAFE'] },
  AREA: { description: 'Alan hesapla', aliases: ['AR', 'ALAN'] },
  LAYER: { description: 'Katman yönetimi', aliases: ['LA', 'KATMAN'] },
  COLOR: { description: 'Renk ayarla', aliases: ['COL', 'RENK'] },
  REGEN: { description: 'Görünümü yenile', aliases: ['RE', 'YENILE'] },
  QUIT: { description: 'Çıkış', aliases: ['Q', 'EXIT', 'CIKIS'] },
};

// ============================================
// COMPONENT
// ============================================

export const CommandLine: React.FC<CommandLineProps> = ({
  onOpenDXF,
  onShowMaterials,
  onShowBlueprints,
  onNewProject
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
  const {
    mode,
    setMode,
    undo,
    redo,
    clearAll,
    toggleSnap,
    snapSettings,
    setCurrentDiameter,
    currentDiameter,
    pipes,
    components,
    clearTempPoints
  } = useDrawingStore();

  // Scroll to bottom when history changes
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Initial welcome message
  useEffect(() => {
    addToHistory('FlowCAD Komut Satırı - Yardım için HELP yazın', 'info');
  }, []);

  // Auto-complete suggestions
  useEffect(() => {
    if (input.length > 0) {
      const upperInput = input.toUpperCase();
      const matches = Object.entries(COMMANDS)
        .filter(([cmd, { aliases }]) => 
          cmd.startsWith(upperInput) || aliases.some(a => a.startsWith(upperInput))
        )
        .map(([cmd]) => cmd)
        .slice(0, 5);
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const addToHistory = useCallback((response: string, type: 'success' | 'error' | 'info' = 'info') => {
    setHistory(prev => [...prev.slice(-50), {
      command: '',
      response,
      timestamp: new Date(),
      type
    }]);
  }, []);

  const executeCommand = useCallback((cmd: string) => {
    const upperCmd = cmd.trim().toUpperCase();
    const parts = upperCmd.split(' ');
    const mainCmd = parts[0];
    const args = parts.slice(1);

    // Find matching command
    let matchedCommand: string | null = null;
    for (const [command, { aliases }] of Object.entries(COMMANDS)) {
      if (command === mainCmd || aliases.includes(mainCmd)) {
        matchedCommand = command;
        break;
      }
    }

    // Add to command history
    setCommandHistory(prev => [...prev.slice(-20), cmd]);
    setHistoryIndex(-1);

    // Execute command
    switch (matchedCommand) {
      case 'LINE':
        setMode('pipe');
        clearTempPoints();
        addToHistory('✏️ Boru çizim modu aktif. İlk noktayı seçin.', 'success');
        toast.success('Boru çizim modu aktif');
        break;

      case 'SELECT':
        setMode('select');
        clearTempPoints();
        addToHistory('👆 Seçim modu aktif.', 'success');
        break;

      case 'DELETE':
        setMode('delete');
        addToHistory('🗑️ Silme modu aktif. Silinecek nesneyi seçin.', 'success');
        break;

      case 'UNDO':
        undo();
        addToHistory('↶ Son işlem geri alındı.', 'success');
        break;

      case 'REDO':
        redo();
        addToHistory('↷ İşlem yinelendi.', 'success');
        break;

      case 'SNAP':
        toggleSnap('enabled');
        addToHistory(`🧲 Snap: ${!snapSettings.enabled ? 'AÇIK' : 'KAPALI'}`, 'success');
        break;

      case 'GRID':
        toggleSnap('snapToGrid');
        addToHistory(`📐 Grid snap: ${!snapSettings.snapToGrid ? 'AÇIK' : 'KAPALI'}`, 'success');
        break;

      case 'NEW':
        if (onNewProject) {
          onNewProject();
          addToHistory('📄 Yeni proje oluşturuluyor...', 'info');
        }
        break;

      case 'OPEN':
        if (onOpenDXF) {
          onOpenDXF();
          addToHistory('📂 Dosya açma iletişim kutusu açılıyor...', 'info');
        }
        break;

      case 'MATERIALS':
        if (onShowMaterials) {
          onShowMaterials();
          addToHistory('📋 Malzeme listesi açıldı.', 'success');
        }
        break;

      case 'BLUEPRINT':
        if (onShowBlueprints) {
          onShowBlueprints();
          addToHistory('📋 Klavuz paneli açıldı.', 'success');
        }
        break;

      case 'CLEAR':
        if (confirm('Tüm çizimleri silmek istediğinizden emin misiniz?')) {
          clearAll();
          addToHistory('🗑️ Tüm çizimler temizlendi.', 'success');
        }
        break;

      case 'VALVE':
        setMode('valve');
        addToHistory('🔴 Vana ekleme modu aktif. Konum seçin.', 'success');
        break;

      case 'METER':
        setMode('meter');
        addToHistory('📟 Sayaç ekleme modu aktif. Konum seçin.', 'success');
        break;

      case 'BOILER':
        setMode('boiler');
        addToHistory('🔥 Kombi ekleme modu aktif. Konum seçin.', 'success');
        break;

      case 'DIAMETER':
        if (args[0]) {
          const validDiameters = ['1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"'];
          const diameter = args.join(' ');
          if (validDiameters.includes(diameter + '"') || validDiameters.includes(diameter)) {
            setCurrentDiameter(diameter.includes('"') ? diameter : diameter + '"');
            addToHistory(`📏 Boru çapı: ${diameter}`, 'success');
          } else {
            addToHistory(`❌ Geçersiz çap. Geçerli değerler: ${validDiameters.join(', ')}`, 'error');
          }
        } else {
          addToHistory(`📏 Mevcut çap: ${currentDiameter}. Değiştirmek için: DIAMETER [çap]`, 'info');
        }
        break;

      case 'LIST':
        const pipeCount = pipes.length;
        const compCount = components.length;
        const totalLength = pipes.reduce((sum, p) => sum + (p.length || 0), 0);
        addToHistory(`📊 İstatistikler:`, 'info');
        addToHistory(`   • Borular: ${pipeCount} adet, ${totalLength.toFixed(2)}m toplam`, 'info');
        addToHistory(`   • Cihazlar: ${compCount} adet`, 'info');
        break;

      case 'DISTANCE':
        addToHistory('📏 Mesafe ölçümü: İki nokta seçin (yakında eklenecek)', 'info');
        break;

      case 'REGEN':
        addToHistory('🔄 Görünüm yenilendi.', 'success');
        break;

      case 'HELP':
        addToHistory('═══════════════════════════════════════', 'info');
        addToHistory('📖 FLOWCAD KOMUT REHBERİ', 'info');
        addToHistory('═══════════════════════════════════════', 'info');
        addToHistory('', 'info');
        addToHistory('🔧 ÇİZİM KOMUTLARI:', 'info');
        addToHistory('  LINE (L)     - Boru çiz', 'info');
        addToHistory('  VALVE (V)    - Vana ekle', 'info');
        addToHistory('  METER (ME)   - Sayaç ekle', 'info');
        addToHistory('  BOILER (BO)  - Kombi ekle', 'info');
        addToHistory('', 'info');
        addToHistory('📝 DÜZENLEME KOMUTLARI:', 'info');
        addToHistory('  SELECT (S)   - Seçim modu', 'info');
        addToHistory('  DELETE (D)   - Nesne sil', 'info');
        addToHistory('  UNDO (U)     - Geri al', 'info');
        addToHistory('  REDO (R)     - Yinele', 'info');
        addToHistory('', 'info');
        addToHistory('⚙️ AYAR KOMUTLARI:', 'info');
        addToHistory('  SNAP (SN)    - Snap aç/kapat', 'info');
        addToHistory('  GRID (G)     - Grid aç/kapat', 'info');
        addToHistory('  DIAMETER     - Boru çapı', 'info');
        addToHistory('', 'info');
        addToHistory('📁 DOSYA KOMUTLARI:', 'info');
        addToHistory('  NEW (N)      - Yeni proje', 'info');
        addToHistory('  OPEN         - Dosya aç', 'info');
        addToHistory('  MATERIALS    - Malzeme listesi', 'info');
        addToHistory('', 'info');
        addToHistory('💡 İpucu: TAB ile otomatik tamamlama', 'info');
        addToHistory('═══════════════════════════════════════', 'info');
        break;

      case 'QUIT':
        if (confirm('FlowCAD\'den çıkmak istediğinizden emin misiniz?')) {
          window.location.href = '/';
        }
        break;

      default:
        if (mainCmd) {
          addToHistory(`❌ Bilinmeyen komut: "${mainCmd}". Yardım için HELP yazın.`, 'error');
        }
    }
  }, [setMode, clearTempPoints, undo, redo, toggleSnap, snapSettings, clearAll, 
      onNewProject, onOpenDXF, onShowMaterials, onShowBlueprints, 
      currentDiameter, setCurrentDiameter, pipes, components, addToHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      setHistory(prev => [...prev, {
        command: input,
        response: '',
        timestamp: new Date(),
        type: 'info'
      }]);
      executeCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setInput(suggestions[0]);
        setSuggestions([]);
      }
    } else if (e.key === 'Escape') {
      setInput('');
      setSuggestions([]);
      clearTempPoints();
      setMode('select');
      addToHistory('❌ İşlem iptal edildi.', 'info');
    }
  };

  return (
    <div className={`
      fixed bottom-0 left-0 right-0 z-50 
      bg-gray-900 border-t-2 border-blue-500 
      transition-all duration-300
      ${isExpanded ? 'h-48' : 'h-10'}
    `}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-3 py-1.5 bg-gray-800 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-400 font-mono text-sm">⌨️ Komut Satırı</span>
          <span className="text-gray-500 text-xs">|</span>
          <span className="text-gray-400 text-xs font-mono">
            Mod: {mode.toUpperCase()} | Snap: {snapSettings.enabled ? 'AÇIK' : 'KAPALI'} | Çap: {currentDiameter}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">{isExpanded ? '▼' : '▲'}</span>
        </div>
      </div>

      {/* History */}
      {isExpanded && (
        <div 
          ref={historyRef}
          className="h-24 overflow-y-auto px-3 py-2 font-mono text-sm bg-gray-900"
        >
          {history.map((item, index) => (
            <div key={index} className="leading-relaxed">
              {item.command && (
                <div className="text-yellow-400">
                  <span className="text-gray-500">Komut: </span>
                  {item.command}
                </div>
              )}
              {item.response && (
                <div className={`
                  ${item.type === 'error' ? 'text-red-400' : ''}
                  ${item.type === 'success' ? 'text-green-400' : ''}
                  ${item.type === 'info' ? 'text-gray-300' : ''}
                `}>
                  {item.response}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center px-3 py-2 bg-gray-800 border-t border-gray-700">
        <span className="text-green-400 font-mono mr-2">{'>'}</span>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Komut girin (HELP için yardım)..."
            className="w-full bg-transparent text-white font-mono text-sm outline-none placeholder-gray-500"
            autoFocus
          />
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 bg-gray-700 rounded shadow-lg border border-gray-600">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion}
                  className={`
                    px-3 py-1 text-sm font-mono cursor-pointer
                    ${index === 0 ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}
                  `}
                  onClick={() => {
                    setInput(suggestion);
                    setSuggestions([]);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                  <span className="text-gray-400 ml-2 text-xs">
                    {COMMANDS[suggestion]?.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick buttons */}
        <div className="flex gap-1 ml-2">
          <button
            onClick={() => executeCommand('HELP')}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 font-mono"
            title="Yardım"
          >
            ?
          </button>
          <button
            onClick={() => setHistory([])}
            className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 font-mono"
            title="Geçmişi Temizle"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandLine;
