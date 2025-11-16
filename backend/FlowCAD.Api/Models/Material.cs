namespace FlowCAD.Api.Models
{
    public class Material
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Diameter { get; set; } = string.Empty; // Örn: "1/2", "3/4"
        public decimal Price { get; set; }
        public string Unit { get; set; } = "metre";
        public string Type { get; set; } = string.Empty; // Boru, Dirsek, T-parça, vb.
    }
}
