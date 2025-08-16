using CmsService.Models;  // Added to reference Country model

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public interface ICountryService
{
    Task<IEnumerable<Country>> GetAllCountriesAsync();
    Task<Country?> GetCountryByIdAsync(int id);
    Task<Country> CreateCountryAsync(Country country);
    Task<Country?> UpdateCountryAsync(int id, Country country);
    Task<bool> DeleteCountryAsync(int id);
}
