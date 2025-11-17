// ============================================
// 11. src/App.tsx
// ============================================
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProjectList } from './components/ProjectList';
import { EditorPage } from './pages/EditorPage';
import { useProjectStore } from './store/useProjectStore';

function App() {
  const { setCurrentProject } = useProjectStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
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
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;