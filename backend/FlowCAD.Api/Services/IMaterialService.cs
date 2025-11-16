using FlowCAD.Api.Models;

namespace FlowCAD.Api.Services
{
    public interface IMaterialService
    {
        Task<IEnumerable<Material>> GetAllMaterialsAsync();
        Task<IEnumerable<Material>> GetMaterialsByTypeAsync(string type);
    }
}
