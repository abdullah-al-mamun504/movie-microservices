using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CmsService.Services;
using CmsService.Models;
using Microsoft.Extensions.Logging;

namespace CmsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class GenresController : ControllerBase
{
    private readonly IGenreService _genreService;
    private readonly ILogger<GenresController> _logger;
    
    public GenresController(IGenreService genreService, ILogger<GenresController> logger)
    {
        _genreService = genreService;
        _logger = logger;
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetGenres()
    {
        try
        {
            var genres = await _genreService.GetAllGenresAsync();
            return Ok(new { success = true, data = genres });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting genres");
            return StatusCode(500, new { success = false, error = "Failed to get genres" });
        }
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetGenre(int id)
    {
        try
        {
            var genre = await _genreService.GetGenreByIdAsync(id);
            if (genre == null)
            {
                return NotFound(new { success = false, error = "Genre not found" });
            }
            return Ok(new { success = true, data = genre });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting genre with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to get genre" });
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateGenre([FromBody] Genre genre)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var createdGenre = await _genreService.CreateGenreAsync(genre);
            return CreatedAtAction(nameof(GetGenre), new { id = createdGenre.Id }, new { success = true, data = createdGenre });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create genre due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating genre");
            return StatusCode(500, new { success = false, error = "Failed to create genre" });
        }
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGenre(int id, [FromBody] Genre genre)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var updatedGenre = await _genreService.UpdateGenreAsync(id, genre);
            if (updatedGenre == null)
            {
                return NotFound(new { success = false, error = "Genre not found" });
            }
            return Ok(new { success = true, data = updatedGenre });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to update genre due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating genre with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to update genre" });
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGenre(int id)
    {
        try
        {
            var result = await _genreService.DeleteGenreAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, error = "Genre not found" });
            }
            return Ok(new { success = true, message = "Genre deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting genre with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to delete genre" });
        }
    }
}
