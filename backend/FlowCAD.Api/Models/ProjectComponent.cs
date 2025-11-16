namespace FlowCAD.Api.Models
{
    public class ProjectComponent
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public int ComponentId { get; set; }
        public int Quantity { get; set; }
        public string Position { get; set; } = "{}"; // JSON: {x, y, z, rotation}
        public string? CustomProperties { get; set; } // JSON formatında özel özellikler

        public Project Project { get; set; } = null!;
        public Component Component { get; set; } = null!;
    }
}
