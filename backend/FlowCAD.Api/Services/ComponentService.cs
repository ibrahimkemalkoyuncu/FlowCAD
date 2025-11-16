

using FlowCAD.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace FlowCAD.Api.Services
{
    public class ComponentService : IComponentService
    {
        private readonly ApplicationDbContext _context;

        public ComponentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Component>> GetAllComponentsAsync()
        {
            return (IEnumerable<Component>)await _context.Components.ToListAsync();
        }

        public async Task<IEnumerable<Component>> GetComponentsByTypeAsync(string type)
        {
            return (IEnumerable<Component>)await _context.Components
                .Where(c => c.Type == type)
                .ToListAsync();
        }
    }
}
