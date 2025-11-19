// ============================================
// Akıllı Boru Bağlantı Sistemi
// ============================================
import { getConnectionPoint } from '../components/3DModels/ComponentModels';
import type { Point3D, ComponentInstance } from '../store/useDrawingStore';

// Bir noktanın component bağlantı noktasına yakın olup olmadığını kontrol et
export const findNearbyConnectionPoint = (
  point: Point3D,
  components: ComponentInstance[],
  threshold: number = 0.3
): { component: ComponentInstance; connectionType: 'input' | 'output'; position: Point3D } | null => {
  
  for (const component of components) {
    const componentPos: [number, number, number] = [
      component.position.x,
      component.position.y,
      component.position.z
    ];

    // Component tipine göre bağlantı noktalarını kontrol et
    if (component.type === 'boiler') {
      const coldIn = getConnectionPoint('boiler', componentPos, 'input');
      const hotOut = getConnectionPoint('boiler', componentPos, 'output');

      if (distance3D(point, coldIn) < threshold) {
        return {
          component,
          connectionType: 'input',
          position: { x: coldIn[0], y: coldIn[1], z: coldIn[2] }
        };
      }

      if (distance3D(point, hotOut) < threshold) {
        return {
          component,
          connectionType: 'output',
          position: { x: hotOut[0], y: hotOut[1], z: hotOut[2] }
        };
      }
    }

    if (component.type === 'meter' || component.type === 'valve') {
      const input = getConnectionPoint(component.type, componentPos, 'input');
      const output = getConnectionPoint(component.type, componentPos, 'output');

      if (distance3D(point, input) < threshold) {
        return {
          component,
          connectionType: 'input',
          position: { x: input[0], y: input[1], z: input[2] }
        };
      }

      if (distance3D(point, output) < threshold) {
        return {
          component,
          connectionType: 'output',
          position: { x: output[0], y: output[1], z: output[2] }
        };
      }
    }
  }

  return null;
};

// 3D uzaklık hesaplama
const distance3D = (p1: Point3D | [number, number, number], p2: [number, number, number]): number => {
  const x1 = Array.isArray(p1) ? p1[0] : p1.x;
  const y1 = Array.isArray(p1) ? p1[1] : p1.y;
  const z1 = Array.isArray(p1) ? p1[2] : p1.z;

  return Math.sqrt(
    Math.pow(x1 - p2[0], 2) +
    Math.pow(y1 - p2[1], 2) +
    Math.pow(z1 - p2[2], 2)
  );
};