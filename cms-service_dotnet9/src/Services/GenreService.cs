using Microsoft.EntityFrameworkCore;
using CmsService.Models;    // Added to reference Genre model
using CmsService.Data;      // Added to reference CmsDbContext

namespace CmsService.Services;  // Changed from CMS.Services to CmsService.Services

public class GenreService : IGenreService
{
    private readonly CmsDbContext _context;
    private readonly ILogger<GenreService> _logger;
    
    public GenreService(CmsDbContext context, ILogger<GenreService> logger)
    {
        _context = context;
        _logger = logger;
    }
    
    public async Task<IEnumerable<Genre>> GetAllGenresAsync()
    {
        try
        {
            return await _context.Genres
                .Where(g => g.IsActive)
                .OrderBy(g => g.Name)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all genres");
            throw;
        }
    }
    
    public async Task<Genre?> GetGenreByIdAsync(int id)
    {
        try
        {
            return await _context.Genres
                .FirstOrDefaultAsync(g => g.Id == id && g.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting genre with ID: {id}");
            throw;
        }
    }
    
    public async Task<Genre> CreateGenreAsync(Genre genre)
    {
        try
        {
            // Check if genre already exists
            if (await _context.Genres.AnyAsync(g => g.Name == genre.Name))
            {
                throw new InvalidOperationException("Genre with this name already exists");
            }
            _context.Genres.Add(genre);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Created new genre: {genre.Name}");
            return genre;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating genre: {genre.Name}");
            throw;
        }
    }
    
    public async Task<Genre?> UpdateGenreAsync(int id, Genre genre)
    {
        try
        {
            var existingGenre = await _context.Genres.FindAsync(id);
            if (existingGenre == null)
            {
                return null;
            }
            // Check if another genre with the same name already exists
            if (await _context.Genres.AnyAsync(g => g.Name == genre.Name && g.Id != id))
            {
                throw new InvalidOperationException("Genre with this name already exists");
            }
            existingGenre.Name = genre.Name;
            existingGenre.IsActive = genre.IsActive;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Updated genre: {genre.Name}");
            return existingGenre;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating genre with ID: {id}");
            throw;
        }
    }
    
    public async Task<bool> DeleteGenreAsync(int id)
    {
        try
        {
            var genre = await _context.Genres.FindAsync(id);
            if (genre == null)
            {
                return false;
            }
            // Soft delete - mark as inactive
            genre.IsActive = false;
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted genre: {genre.Name}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting genre with ID: {id}");
            throw;
        }
    }
}
