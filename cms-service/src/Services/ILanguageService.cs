using CmsService.Models;  // Added to reference Language model

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public interface ILanguageService
{
    Task<IEnumerable<Language>> GetAllLanguagesAsync();
    Task<Language?> GetLanguageByIdAsync(int id);
    Task<Language> CreateLanguageAsync(Language language);
    Task<Language?> UpdateLanguageAsync(int id, Language language);
    Task<bool> DeleteLanguageAsync(int id);
}
