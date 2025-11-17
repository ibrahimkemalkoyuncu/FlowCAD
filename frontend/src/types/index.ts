export interface Project {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  projectData?: string;
}

export interface Component {
  id: number;
  name: string;
  type: string;
  category: string;
  unitPrice: number;
  unit: string;
  specifications?: string;
  modelPath?: string;
}

export interface Material {
  id: number;
  name: string;
  code: string;
  diameter: string;
  price: number;
  unit: string;
  type: string;
}

export interface Drawing3D {
  id: string;
  type: 'pipe' | 'component' | 'connection';
  points: [number, number, number][];
  componentId?: number;
  properties: Record<string, any>;
}

export interface ProjectComponent {
  id: number;
  projectId: number;
  componentId: number;
  quantity: number;
  position: {
    x: number;
    y: number;
    z: number;
    rotation: [number, number, number];
  };
  component: Component;
}