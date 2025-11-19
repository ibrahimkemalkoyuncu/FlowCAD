// ============================================
// APP - Ana Uygulama Routing
// Konum: frontend/src/App.tsx
// React Router ile sayfa yönlendirmeleri
// ============================================

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectList } from './components/ProjectList';
import { EditorPage } from './pages/EditorPage';
import { useProjectStore } from './store/useProjectStore';

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  const { setCurrentProject } = useProjectStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Ana Sayfa - Proje Listesi */}
          <Route 
            path="/" 
            element={
              <ProjectList 
                onSelect={(project) => {
                  setCurrentProject(project);
                  window.location.href = '/editor';
                }} 
              />
            } 
          />
          
          {/* Editor Sayfası */}
          <Route 
            path="/editor" 
            element={<EditorPage />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;