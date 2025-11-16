using FlowCAD.Api.DTOs;
using FlowCAD.Api.Models;

namespace FlowCAD.Api.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<Project>> GetAllProjectsAsync(string userId);
        Task<Project?> GetProjectByIdAsync(int id, string userId);
        Task<Project> CreateProjectAsync(CreateProjectDto dto, string userId);
        Task<Project?> UpdateProjectAsync(int id, UpdateProjectDto dto, string userId);
        Task<bool> DeleteProjectAsync(int id, string userId);
        Task<string> GenerateMaterialListAsync(int projectId, string userId);
    }
}
