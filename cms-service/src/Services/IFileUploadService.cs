using CmsService.Models;  // Added to reference MoviePoster model

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public interface IFileUploadService
{
    Task<MoviePoster> UploadPosterAsync(int movieId, IFormFile file);
    Task<bool> DeletePosterAsync(int id);
    Task<MoviePoster?> GetPosterByIdAsync(int id);
    Task<IEnumerable<MoviePoster>> GetPostersByMovieIdAsync(int movieId);
}
