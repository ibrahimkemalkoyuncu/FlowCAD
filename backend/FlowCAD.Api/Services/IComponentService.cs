using FlowCAD.Api.Data;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel;

namespace FlowCAD.Api.Services
{
    public interface IComponentService
    {
        Task<IEnumerable<Component>> GetAllComponentsAsync();
        Task<IEnumerable<Component>> GetComponentsByTypeAsync(string type);
    }


}
