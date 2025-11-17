import React from 'react';
import { Scene3D } from '../components/Scene3D';
import { Toolbar } from '../components/Toolbar';

export const EditorPage: React.FC = () => {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex-1">
        <Scene3D />
      </div>
    </div>
  );
};