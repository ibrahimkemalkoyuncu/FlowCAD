// useDrawingStore.ts içinde updateSnapSettings fonksiyonunu bul ve değiştir:

/**
 * Snap ayarlarını toplu günceller
 * @param settings - Güncellenecek ayarlar (partial)
 */
updateSnapSettings: (settings) => {
  set((state) => {
    const newSettings = { 
      ...state.snapSettings, 
      ...settings 
    };
    
    // snapRadius ve snapTolerance sync tut
    if (settings.snapRadius !== undefined) {
      newSettings.snapTolerance = settings.snapRadius;
    }
    if (settings.snapTolerance !== undefined) {
      newSettings.snapRadius = settings.snapTolerance;
    }
    
    return {
      snapSettings: newSettings
    };
  });
},