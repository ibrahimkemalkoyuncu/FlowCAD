using FlowCAD.Api.Models;
using System.Collections.Generic;
using System.Reflection.Emit;
using Microsoft.EntityFrameworkCore;

namespace FlowCAD.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Component> Components { get; set; }
        public DbSet<ProjectComponent> ProjectComponents { get; set; }
        public DbSet<Drawing> Drawings { get; set; }
        public DbSet<Material> Materials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Project
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Drawings)
                .WithOne(d => d.Project)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasMany(p => p.Components)
                .WithOne(pc => pc.Project)
                .HasForeignKey(pc => pc.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // Component indexing
            modelBuilder.Entity<Component>()
                .HasIndex(c => c.Type);

            modelBuilder.Entity<Component>()
                .HasIndex(c => c.Category);

            // Material indexing
            modelBuilder.Entity<Material>()
                .HasIndex(m => m.Code)
                .IsUnique();

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Örnek componentler
            modelBuilder.Entity<Component>().HasData(
                new Component { Id = 1, Name = "Kombi", Type = "Boiler", Category = "Device", UnitPrice = 3500, Unit = "adet" },
                new Component { Id = 2, Name = "Sayaç", Type = "Meter", Category = "Device", UnitPrice = 450, Unit = "adet" },
                new Component { Id = 3, Name = "Küresel Vana 1/2\"", Type = "Valve", Category = "Fitting", UnitPrice = 25, Unit = "adet" },
                new Component { Id = 4, Name = "T-Parça 1/2\"", Type = "T-Joint", Category = "Fitting", UnitPrice = 8, Unit = "adet" },
                new Component { Id = 5, Name = "Dirsek 90° 1/2\"", Type = "Elbow", Category = "Fitting", UnitPrice = 5, Unit = "adet" }
            );

            // Örnek malzemeler
            modelBuilder.Entity<Material>().HasData(
                new Material { Id = 1, Name = "Bakır Boru 1/2\"", Code = "BB-12", Diameter = "1/2\"", Price = 85, Unit = "metre", Type = "Pipe" },
                new Material { Id = 2, Name = "Bakır Boru 3/4\"", Code = "BB-34", Diameter = "3/4\"", Price = 125, Unit = "metre", Type = "Pipe" },
                new Material { Id = 3, Name = "Esnek Hortum 1/2\"", Code = "EH-12", Diameter = "1/2\"", Price = 45, Unit = "metre", Type = "Hose" }
            );
        }
    }
}
