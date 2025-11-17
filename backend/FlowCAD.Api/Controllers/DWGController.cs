// ============================================
// 7. Backend API Support (C#)
// ============================================


using Microsoft.AspNetCore.Mvc;


namespace FlowCAD.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DWGController : ControllerBase
    {
        private readonly string _uploadPath;

        public DWGController(IWebHostEnvironment env)
        {
            _uploadPath = Path.Combine(env.WebRootPath, "uploads", "dwg");
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        [HttpPost("upload")]
        [RequestSizeLimit(100_000_000)] // 100MB
        public async Task<IActionResult> UploadDWG(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi");

            var allowedExtensions = new[] { ".dwg", ".dxf" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Sadece DWG/DXF dosyaları");

            try
            {
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(_uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // DWG to DXF conversion (opsiyonel, external tool gerekir)
                // var dxfPath = ConvertDWGToDXF(filePath);

                return Ok(new
                {
                    success = true,
                    fileName = file.FileName,
                    url = $"/uploads/dwg/{fileName}",
                    size = file.Length,
                    type = extension.TrimStart('.')
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya yüklenirken hata: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public IActionResult ListDWGs()
        {
            try
            {
                var files = Directory.GetFiles(_uploadPath)
                    .Select(f => new
                    {
                        fileName = Path.GetFileName(f),
                        url = $"/uploads/dwg/{Path.GetFileName(f)}",
                        size = new FileInfo(f).Length,
                        createdAt = System.IO.File.GetCreationTime(f)
                    })
                    .OrderByDescending(f => f.createdAt)
                    .ToList();

                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosyalar listelenirken hata: {ex.Message}");
            }
        }
    }
    
}
