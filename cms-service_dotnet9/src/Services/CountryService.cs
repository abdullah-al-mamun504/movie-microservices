using Microsoft.EntityFrameworkCore;
using CmsService.Models;    // Added to reference Country model
using CmsService.Data;      // Added to reference CmsDbContext

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public class CountryService : ICountryService
{
    private readonly CmsDbContext _context;
    private readonly ILogger<CountryService> _logger;
    
    public CountryService(CmsDbContext context, ILogger<CountryService> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task<IEnumerable<Country>> GetAllCountriesAsync()
    {
        try
        {
            return await _context.Countries
                .Where(c => c.IsActive)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all countries");
            throw;
        }
    }
    
    public async Task<Country?> GetCountryByIdAsync(int id)
    {
        try
        {
            return await _context.Countries
                .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting country with ID: {id}");
            throw;
        }
    }
    
    public async Task<Country> CreateCountryAsync(Country country)
    {
        try
        {
            // Check if country already exists
            if (await _context.Countries.AnyAsync(c => c.Code == country.Code || c.Name == country.Name))
            {
                throw new InvalidOperationException("Country with this code or name already exists");
            }
            _context.Countries.Add(country);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new country: {country.Name}");
            return country;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating country: {country.Name}");
            throw;
        }
    }
    
    public async Task<Country?> UpdateCountryAsync(int id, Country country)
    {
        try
        {
            var existingCountry = await _context.Countries.FindAsync(id);
            if (existingCountry == null)
            {
                return null;
            }
            // Check if another country with the same code or name already exists
            if (await _context.Countries.AnyAsync(c =>
                (c.Code == country.Code || c.Name == country.Name) && c.Id != id))
            {
                throw new InvalidOperationException("Country with this code or name already exists");
            }
            existingCountry.Code = country.Code;
            existingCountry.Name = country.Name;
            existingCountry.IsActive = country.IsActive;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated country: {country.Name}");
            return existingCountry;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating country with ID: {id}");
            throw;
        }
    }
    
    public async Task<bool> DeleteCountryAsync(int id)
    {
        try
        {
            var country = await _context.Countries.FindAsync(id);
            if (country == null)
            {
                return false;
            }
            // Soft delete - mark as inactive
            country.IsActive = false;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted country: {country.Name}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting country with ID: {id}");
            throw;
        }
    }
}
