using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using CmsService.Models;    // Reference MoviePoster
using CmsService.Data;      // Reference CmsDbContext

namespace CmsService.Services;

public class FileUploadService : IFileUploadService
{
    private readonly CmsDbContext _context;
    private readonly ILogger<FileUploadService> _logger;
    private readonly FileUploadOptions _uploadOptions;
    private readonly StorageOptions _storageOptions;
    
    public FileUploadService(
        CmsDbContext context,
        ILogger<FileUploadService> logger,
        IOptions<FileUploadOptions> uploadOptions,
        IOptions<StorageOptions> storageOptions)
    {
        _context = context;
        _logger = logger;
        _uploadOptions = uploadOptions.Value;
        _storageOptions = storageOptions.Value;
    }

    public async Task<MoviePoster> UploadPosterAsync(int movieId, IFormFile file)
    {
        try
        {
            // Validate file
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }
            
            // Check file size
            if (file.Length > _uploadOptions.MaxFileSize)
            {
                throw new ArgumentException($"File size exceeds the limit of {_uploadOptions.MaxFileSize} bytes");
            }
            
            // Check file extension
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_uploadOptions.AllowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"File extension {fileExtension} is not allowed");
            }
            
            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            
            // Create directory if it doesn't exist
            var uploadPath = _storageOptions.LocalPath;
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }
            
            // Save file
            var filePath = Path.Combine(uploadPath, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            // Save to database
            var poster = new MoviePoster
            {
                MovieId = movieId,
                FileName = fileName,
                OriginalFileName = file.FileName,
                FilePath = filePath,
                FileSize = file.Length,
                ContentType = file.ContentType,
                IsActive = true,
                UploadedAt = DateTime.UtcNow
            };
            
            _context.MoviePosters.Add(poster);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Uploaded poster for movie {movieId}: {file.FileName}");
            return poster;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error uploading poster for movie {movieId}");
            throw;
        }
    }
    
    public async Task<bool> DeletePosterAsync(int id)
    {
        try
        {
            var poster = await _context.MoviePosters.FindAsync(id);
            if (poster == null)
            {
                return false;
            }
            
            // Delete file
            if (File.Exists(poster.FilePath))
            {
                File.Delete(poster.FilePath);
            }
            
            // Delete from database
            _context.MoviePosters.Remove(poster);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Deleted poster with ID: {id}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting poster with ID: {id}");
            throw;
        }
    }
    
    public async Task<MoviePoster?> GetPosterByIdAsync(int id)
    {
        try
        {
            return await _context.MoviePosters
                .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting poster with ID: {id}");
            throw;
        }
    }
    
    public async Task<IEnumerable<MoviePoster>> GetPostersByMovieIdAsync(int movieId)
    {
        try
        {
            return await _context.MoviePosters
                .Where(p => p.MovieId == movieId && p.IsActive)
                .OrderByDescending(p => p.UploadedAt)
                .ToListAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting posters for movie {movieId}");
            throw;
        }
    }
}

public class FileUploadOptions
{
    public const string SectionName = "FileUpload";
    public long MaxFileSize { get; set; } = 5242880; // 5MB
    public string[] AllowedExtensions { get; set; } = { ".jpg", ".jpeg", ".png", ".gif" };
    public string UploadPath { get; set; } = "uploads";
}

public class StorageOptions
{
    public const string SectionName = "Storage";
    public string Provider { get; set; } = "local";
    public string LocalPath { get; set; } = "/app/uploads";
    public MinioOptions Minio { get; set; } = new();
    public S3Options S3 { get; set; } = new();
}

public class MinioOptions
{
    public string Endpoint { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public string BucketName { get; set; } = string.Empty;
    public bool WithSSL { get; set; } = false;
}

public class S3Options
{
    public string Bucket { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
}
