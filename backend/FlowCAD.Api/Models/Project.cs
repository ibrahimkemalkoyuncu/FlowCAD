namespace FlowCAD.Api.Models
{
    public class Project
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string ProjectData { get; set; } = "{}"; // JSON formatında 3D veriler

        public ICollection<Drawing> Drawings { get; set; } = new List<Drawing>();
        public ICollection<ProjectComponent> Components { get; set; } = new List<ProjectComponent>();
    }
}
