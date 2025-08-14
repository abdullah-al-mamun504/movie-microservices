using Microsoft.EntityFrameworkCore;
using CmsService.Models;    // Added to reference Language model
using CmsService.Data;      // Added to reference CmsDbContext

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public class LanguageService : ILanguageService
{
    private readonly CmsDbContext _context;
    private readonly ILogger<LanguageService> _logger;
    
    public LanguageService(CmsDbContext context, ILogger<LanguageService> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task<IEnumerable<Language>> GetAllLanguagesAsync()
    {
        try
        {
            return await _context.Languages
                .Where(l => l.IsActive)
                .OrderBy(l => l.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all languages");
            throw;
        }
    }
    
    public async Task<Language?> GetLanguageByIdAsync(int id)
    {
        try
        {
            return await _context.Languages
                .FirstOrDefaultAsync(l => l.Id == id && l.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting language with ID: {id}");
            throw;
        }
    }
    
    public async Task<Language> CreateLanguageAsync(Language language)
    {
        try
        {
            // Check if language already exists
            if (await _context.Languages.AnyAsync(l => l.Code == language.Code || l.Name == language.Name))
            {
                throw new InvalidOperationException("Language with this code or name already exists");
            }
            _context.Languages.Add(language);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new language: {language.Name}");
            return language;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating language: {language.Name}");
            throw;
        }
    }
    
    public async Task<Language?> UpdateLanguageAsync(int id, Language language)
    {
        try
        {
            var existingLanguage = await _context.Languages.FindAsync(id);
            if (existingLanguage == null)
            {
                return null;
            }
            // Check if another language with the same code or name already exists
            if (await _context.Languages.AnyAsync(l =>
                (l.Code == language.Code || l.Name == language.Name) && l.Id != id))
            {
                throw new InvalidOperationException("Language with this code or name already exists");
            }
            existingLanguage.Code = language.Code;
            existingLanguage.Name = language.Name;
            existingLanguage.IsActive = language.IsActive;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated language: {language.Name}");
            return existingLanguage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating language with ID: {id}");
            throw;
        }
    }
    
    public async Task<bool> DeleteLanguageAsync(int id)
    {
        try
        {
            var language = await _context.Languages.FindAsync(id);
            if (language == null)
            {
                return false;
            }
            // Soft delete - mark as inactive
            language.IsActive = false;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted language: {language.Name}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting language with ID: {id}");
            throw;
        }
    }
}
