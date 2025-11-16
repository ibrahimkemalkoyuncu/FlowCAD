namespace FlowCAD.Api.Models
{
    public class Drawing
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string Type { get; set; } = string.Empty; // Pipe, Connection, etc.
        public string Points { get; set; } = "[]"; // JSON array of 3D points
        public string Properties { get; set; } = "{}"; // JSON properties

        public Project Project { get; set; } = null!;
    }
}
