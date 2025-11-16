using FlowCAD.Api.DTOs;
using FlowCAD.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlowCAD.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectService _projectService;

        public ProjectsController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var projects = await _projectService.GetAllProjectsAsync(userId);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var project = await _projectService.GetProjectByIdAsync(id, userId);

            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProjectDto dto)
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var project = await _projectService.CreateProjectAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateProjectDto dto)
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var project = await _projectService.UpdateProjectAsync(id, dto, userId);

            if (project == null)
                return NotFound();

            return Ok(project);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var result = await _projectService.DeleteProjectAsync(id, userId);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpGet("{id}/material-list")]
        public async Task<IActionResult> GetMaterialList(int id)
        {
            var userId = User.FindFirst("sub")?.Value ?? "demo-user";
            var materialList = await _projectService.GenerateMaterialListAsync(id, userId);
            return Ok(materialList);
        }
    }
}
