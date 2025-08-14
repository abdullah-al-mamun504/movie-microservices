using CmsService.Models;  // Added to reference Genre model

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public interface IGenreService
{
    Task<IEnumerable<Genre>> GetAllGenresAsync();
    Task<Genre?> GetGenreByIdAsync(int id);
    Task<Genre> CreateGenreAsync(Genre genre);
    Task<Genre?> UpdateGenreAsync(int id, Genre genre);
    Task<bool> DeleteGenreAsync(int id);
}
