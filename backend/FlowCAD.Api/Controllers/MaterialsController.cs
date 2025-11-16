using FlowCAD.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FlowCAD.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialsController : ControllerBase
    {
        private readonly IMaterialService _materialService;

        public MaterialsController(IMaterialService materialService)
        {
            _materialService = materialService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var materials = await _materialService.GetAllMaterialsAsync();
            return Ok(materials);
        }

        [HttpGet("type/{type}")]
        public async Task<IActionResult> GetByType(string type)
        {
            var materials = await _materialService.GetMaterialsByTypeAsync(type);
            return Ok(materials);
        }
    }
}
