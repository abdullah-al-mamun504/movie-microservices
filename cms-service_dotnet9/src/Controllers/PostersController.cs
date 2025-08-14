using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CmsService.Services;
using CmsService.Models;
using Microsoft.Extensions.Logging;

namespace CmsService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostersController : ControllerBase
{
    private readonly IFileUploadService _fileUploadService;
    private readonly ILogger<PostersController> _logger;
    
    public PostersController(IFileUploadService fileUploadService, ILogger<PostersController> logger)
    {
        _fileUploadService = fileUploadService;
        _logger = logger;
    }
    
    [HttpPost("upload/{movieId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UploadPoster(int movieId, IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { success = false, error = "No file uploaded" });
            }
            var poster = await _fileUploadService.UploadPosterAsync(movieId, file);
            return CreatedAtAction(nameof(GetPoster), new { id = poster.Id }, new { success = true, data = poster });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid file upload");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading poster for movie {movieId}");
            return StatusCode(500, new { success = false, error = "Failed to upload poster" });
        }
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPoster(int id)
    {
        try
        {
            var poster = await _fileUploadService.GetPosterByIdAsync(id);
            if (poster == null)
            {
                return NotFound(new { success = false, error = "Poster not found" });
            }
            return Ok(new { success = true, data = poster });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting poster with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to get poster" });
        }
    }
    
    [HttpGet("movie/{movieId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPostersByMovieId(int movieId)
    {
        try
        {
            var posters = await _fileUploadService.GetPostersByMovieIdAsync(movieId);
            return Ok(new { success = true, data = posters });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting posters for movie {movieId}");
            return StatusCode(500, new { success = false, error = "Failed to get posters" });
        }
    }
    
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeletePoster(int id)
    {
        try
        {
            var result = await _fileUploadService.DeletePosterAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, error = "Poster not found" });
            }
            return Ok(new { success = true, message = "Poster deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting poster with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to delete poster" });
        }
    }
    
    [HttpGet("file/{fileName}")]
    [AllowAnonymous]
    public IActionResult GetFile(string fileName)
    {
        try
        {
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
            var filePath = Path.Combine(uploadPath, fileName);
            
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { success = false, error = "File not found" });
            }
            
            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            var contentType = "application/octet-stream";
            
            // Try to determine content type based on file extension
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    contentType = "image/jpeg";
                    break;
                case ".png":
                    contentType = "image/png";
                    break;
                case ".gif":
                    contentType = "image/gif";
                    break;
            }
            
            return File(fileBytes, contentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting file: {fileName}");
            return StatusCode(500, new { success = false, error = "Failed to get file" });
        }
    }
}
