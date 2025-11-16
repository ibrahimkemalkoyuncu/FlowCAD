using FlowCAD.Api.Data;
using FlowCAD.Api.DTOs;
using FlowCAD.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace FlowCAD.Api.Services
{
    public class ProjectService : IProjectService
    {
        private readonly ApplicationDbContext _context;

        public ProjectService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Project>> GetAllProjectsAsync(string userId)
        {
            return await _context.Projects
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.UpdatedAt)
                .ToListAsync();
        }

        public async Task<Project?> GetProjectByIdAsync(int id, string userId)
        {
            return await _context.Projects
                .Include(p => p.Drawings)
                .Include(p => p.Components)
                    .ThenInclude(pc => pc.Component)
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);
        }

        public async Task<Project> CreateProjectAsync(CreateProjectDto dto, string userId)
        {
            var project = new Project
            {
                Name = dto.Name,
                Description = dto.Description,
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return project;
        }

        public async Task<Project?> UpdateProjectAsync(int id, UpdateProjectDto dto, string userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null) return null;

            if (!string.IsNullOrEmpty(dto.Name))
                project.Name = dto.Name;

            if (!string.IsNullOrEmpty(dto.Description))
                project.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.ProjectData))
                project.ProjectData = dto.ProjectData;

            project.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return project;
        }

        public async Task<bool> DeleteProjectAsync(int id, string userId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == userId);

            if (project == null) return false;

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<string> GenerateMaterialListAsync(int projectId, string userId)
        {
            var project = await GetProjectByIdAsync(projectId, userId);
            if (project == null) return "{}";

            var materialList = project.Components
                .GroupBy(pc => pc.Component.Name)
                .Select(g => new
                {
                    Name = g.Key,
                    Quantity = g.Sum(pc => pc.Quantity),
                    Unit = g.First().Component.Unit,
                    UnitPrice = g.First().Component.UnitPrice,
                    TotalPrice = g.Sum(pc => pc.Quantity * pc.Component.UnitPrice)
                })
                .ToList();

            return JsonSerializer.Serialize(new
            {
                ProjectName = project.Name,
                Materials = materialList,
                TotalCost = materialList.Sum(m => m.TotalPrice),
                GeneratedAt = DateTime.UtcNow
            });
        }
    }
}
