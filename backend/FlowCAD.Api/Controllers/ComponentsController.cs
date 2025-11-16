using FlowCAD.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlowCAD.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComponentsController : ControllerBase
    {
        private readonly IComponentService _componentService;

        public ComponentsController(IComponentService componentService)
        {
            _componentService = componentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var components = await _componentService.GetAllComponentsAsync();
            return Ok(components);
        }

        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetByType(string type)
        {
            var components = await _componentService.GetComponentsByTypeAsync(type);
            return Ok(components);
        }
    }
}
