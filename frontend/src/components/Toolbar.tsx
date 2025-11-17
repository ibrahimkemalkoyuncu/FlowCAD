export const Toolbar: React.FC = () => {
  const tools = [
    { id: 'pipe', name: 'Boru', icon: '|' },
    { id: 'elbow', name: 'Dirsek', icon: '⌐' },
    { id: 'valve', name: 'Vana', icon: '⊗' },
    { id: 'meter', name: 'Sayaç', icon: '⊞' },
    { id: 'boiler', name: 'Kombi', icon: '⊡' },
  ];

  return (
    <div className="bg-white border-b p-4 flex gap-2">
      {tools.map(tool => (
        <button
          key={tool.id}
          className="px-4 py-2 border rounded hover:bg-blue-50 transition-colors"
          title={tool.name}
        >
          <span className="text-xl">{tool.icon}</span>
          <span className="ml-2 text-sm">{tool.name}</span>
        </button>
      ))}
      
      <div className="ml-auto flex gap-2">
        <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          Kaydet
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Malzeme Listesi
        </button>
      </div>
    </div>
  );
};