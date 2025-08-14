using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using CmsService.Services;
using CmsService.Models;
using Microsoft.Extensions.Logging;

namespace CmsService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CountriesController : ControllerBase
{
    private readonly ICountryService _countryService;
    private readonly ILogger<CountriesController> _logger;
    
    public CountriesController(ICountryService countryService, ILogger<CountriesController> logger)
    {
        _countryService = countryService;
        _logger = logger;
    }
    
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetCountries()
    {
        try
        {
            var countries = await _countryService.GetAllCountriesAsync();
            return Ok(new { success = true, data = countries });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting countries");
            return StatusCode(500, new { success = false, error = "Failed to get countries" });
        }
    }
    
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCountry(int id)
    {
        try
        {
            var country = await _countryService.GetCountryByIdAsync(id);
            if (country == null)
            {
                return NotFound(new { success = false, error = "Country not found" });
            }
            return Ok(new { success = true, data = country });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting country with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to get country" });
        }
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateCountry([FromBody] Country country)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var createdCountry = await _countryService.CreateCountryAsync(country);
            return CreatedAtAction(nameof(GetCountry), new { id = createdCountry.Id }, new { success = true, data = createdCountry });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create country due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating country");
            return StatusCode(500, new { success = false, error = "Failed to create country" });
        }
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCountry(int id, [FromBody] Country country)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { success = false, error = "Invalid data" });
            }
            var updatedCountry = await _countryService.UpdateCountryAsync(id, country);
            if (updatedCountry == null)
            {
                return NotFound(new { success = false, error = "Country not found" });
            }
            return Ok(new { success = true, data = updatedCountry });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to update country due to validation error");
            return BadRequest(new { success = false, error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating country with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to update country" });
        }
    }
    
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCountry(int id)
    {
        try
        {
            var result = await _countryService.DeleteCountryAsync(id);
            if (!result)
            {
                return NotFound(new { success = false, error = "Country not found" });
            }
            return Ok(new { success = true, message = "Country deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting country with ID: {id}");
            return StatusCode(500, new { success = false, error = "Failed to delete country" });
        }
    }
}
