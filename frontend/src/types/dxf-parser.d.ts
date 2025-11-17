// types/dxf-parser.d.ts
declare module 'dxf-parser' {
  export interface DxfParser {
    parseSync(data: string): any;
    parse(data: string, callback: (err: Error | null, result: any) => void): void;
  }
  
  const DxfParser: {
    new(): DxfParser;
  };
  
  export default DxfParser;
}