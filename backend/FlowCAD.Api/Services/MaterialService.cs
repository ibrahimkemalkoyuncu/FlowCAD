using FlowCAD.Api.Data;
using FlowCAD.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FlowCAD.Api.Services
{
    public class MaterialService : IMaterialService
    {
        private readonly ApplicationDbContext _context;

        public MaterialService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Material>> GetAllMaterialsAsync()
        {
            return await _context.Materials.ToListAsync();
        }

        public async Task<IEnumerable<Material>> GetMaterialsByTypeAsync(string type)
        {
            return await _context.Materials
                .Where(m => m.Type == type)
                .ToListAsync();
        }
    }
}
