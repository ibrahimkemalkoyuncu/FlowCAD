// ============================================
// APP - Ana Uygulama Routing
// Konum: frontend/src/App.tsx
// React Router ile sayfa yönlendirmeleri
// ============================================

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ProjectList } from './components/ProjectList';
import { EditorPage } from './pages/EditorPage';
import { useProjectStore } from './store/useProjectStore';

// ============================================
// PROJECT LIST WRAPPER - Navigation Hook İçin
// ============================================

function ProjectListWrapper() {
  const navigate = useNavigate();
  const { setCurrentProject } = useProjectStore();

  return (
    <ProjectList 
      onSelect={(project) => {
        setCurrentProject(project);
        navigate('/editor');
      }} 
    />
  );
}

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Ana Sayfa - Proje Listesi */}
          <Route 
            path="/" 
            element={<ProjectListWrapper />} 
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