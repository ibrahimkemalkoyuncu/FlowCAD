namespace FlowCAD.Api.Models
{
    public class Component
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // Pipe, Valve, Meter, Boiler, etc.
        public string Category { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public string Unit { get; set; } = "adet";
        public string? Specifications { get; set; } // JSON formatında özellikler
        public string? ModelPath { get; set; } // 3D model dosya yolu
    }
}
