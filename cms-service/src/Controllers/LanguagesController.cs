using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CmsService.Services;
using CmsService.Models;
using Microsoft.Extensions.Logging;

namespace CmsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class LanguagesController : ControllerBase
{
    private readonly ILanguageService _languageService;
    private readonly ILogger<LanguagesController> _logger;
    
    public LanguagesController(ILanguageService languageService, ILogger<LanguagesController> logger)
    {
        _languageService = languageService;
        _logger = logger;
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetLanguages()
    {
        try
        {
            var languages = await _languageService.GetAllLanguagesAsync();
            return Ok(new { success = true, data = languages });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting languages");
            return StatusCode(500, new { success = false, error = "Failed to get languages" });
        }
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLanguage(int id)
    {
        try
        {
            var language = await _languageService.GetLanguageByIdAsync(id);
            if (language == null)
            {
                return NotFound(new { success = false, error = "Language not found" });
            }
            return Ok(new { success = true, data = language });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting language with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to get language" });
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateLanguage([FromBody] Language language)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var createdLanguage = await _languageService.CreateLanguageAsync(language);
            return CreatedAtAction(nameof(GetLanguage), new { id = createdLanguage.Id }, new { success = true, data = createdLanguage });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create language due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating language");
            return StatusCode(500, new { success = false, error = "Failed to create language" });
        }
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateLanguage(int id, [FromBody] Language language)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var updatedLanguage = await _languageService.UpdateLanguageAsync(id, language);
            if (updatedLanguage == null)
            {
                return NotFound(new { success = false, error = "Language not found" });
            }
            return Ok(new { success = true, data = updatedLanguage });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to update language due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating language with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to update language" });
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLanguage(int id)
    {
        try
        {
            var result = await _languageService.DeleteLanguageAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, error = "Language not found" });
            }
            return Ok(new { success = true, message = "Language deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting language with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to delete language" });
        }
    }
}
