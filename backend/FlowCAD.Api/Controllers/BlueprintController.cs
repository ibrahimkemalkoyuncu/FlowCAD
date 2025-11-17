using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace FlowCAD.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlueprintController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly string _uploadsPath;

        public BlueprintController(IWebHostEnvironment env)
        {
            _env = env;
            _uploadsPath = Path.Combine(_env.WebRootPath, "uploads", "blueprints");

            // Klasörü oluştur
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        [HttpPost("upload")]
        [RequestSizeLimit(50_000_000)] // 50MB limit
        public async Task<IActionResult> UploadBlueprint(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Dosya seçilmedi");

            var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".dxf", ".dwg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                return BadRequest("Desteklenmeyen dosya formatı");

            try
            {
                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(_uploadsPath, fileName);

                // Dosyayı kaydet
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Dosya URL'i döndür
                var fileUrl = $"/uploads/blueprints/{fileName}";

                return Ok(new
                {
                    success = true,
                    fileName = file.FileName,
                    url = fileUrl,
                    size = file.Length,
                    type = extension.TrimStart('.')
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya yüklenirken hata: {ex.Message}");
            }
        }

        [HttpDelete("{fileName}")]
        public IActionResult DeleteBlueprint(string fileName)
        {
            try
            {
                var filePath = Path.Combine(_uploadsPath, fileName);

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    return Ok(new { success = true, message = "Dosya silindi" });
                }

                return NotFound("Dosya bulunamadı");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Dosya silinirken hata: {ex.Message}");
            }
        }

        [HttpGet("list")]
        public IActionResult ListBlueprints()
        {
            try
            {
                var files = Directory.GetFiles(_uploadsPath)
                    .Select(f => new
                    {
                        fileName = Path.GetFileName(f),
                        url = $"/uploads/blueprints/{Path.GetFileName(f)}",
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
