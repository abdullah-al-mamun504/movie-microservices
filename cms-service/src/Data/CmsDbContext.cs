using Microsoft.EntityFrameworkCore;
using CmsService.Models;  // Changed from CMS.Models to CmsService.Models

namespace CmsService.Data;  // Changed from CMS.Data to CmsService.Data

public class CmsDbContext : DbContext
{
    public CmsDbContext(DbContextOptions<CmsDbContext> options) : base(options)
    {
    }
    
    public DbSet<Country> Countries { get; set; }
    public DbSet<Language> Languages { get; set; }
    public DbSet<Genre> Genres { get; set; }
    public DbSet<MoviePoster> MoviePosters { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Country entity configuration
        modelBuilder.Entity<Country>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(2);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).IsRequired();
        });
        // Language entity configuration
        modelBuilder.Entity<Language>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Code).IsUnique();
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Code).IsRequired().HasMaxLength(2);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).IsRequired();
        });
        // Genre entity configuration
        modelBuilder.Entity<Genre>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).IsRequired();
        });
        // MoviePoster entity configuration
        modelBuilder.Entity<MoviePoster>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MovieId).IsRequired();
            entity.Property(e => e.FileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(255);
            entity.Property(e => e.FilePath).IsRequired().HasMaxLength(500);
            entity.Property(e => e.FileSize).IsRequired();
            entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive).IsRequired();
            entity.Property(e => e.UploadedAt).IsRequired();
        });
    }
    
    public static async Task SeedData(CmsDbContext context)
    {
        // Seed countries if none exist
        if (!await context.Countries.AnyAsync())
        {
            var countries = new List<Country>
            {
                new Country { Code = "US", Name = "United States", IsActive = true },
                new Country { Code = "GB", Name = "United Kingdom", IsActive = true },
                new Country { Code = "CA", Name = "Canada", IsActive = true },
                new Country { Code = "AU", Name = "Australia", IsActive = true },
                new Country { Code = "DE", Name = "Germany", IsActive = true },
                new Country { Code = "FR", Name = "France", IsActive = true },
                new Country { Code = "IT", Name = "Italy", IsActive = true },
                new Country { Code = "ES", Name = "Spain", IsActive = true },
                new Country { Code = "JP", Name = "Japan", IsActive = true },
                new Country { Code = "KR", Name = "South Korea", IsActive = true },
                new Country { Code = "CN", Name = "China", IsActive = true },
                new Country { Code = "IN", Name = "India", IsActive = true },
                new Country { Code = "BR", Name = "Brazil", IsActive = true },
                new Country { Code = "MX", Name = "Mexico", IsActive = true },
                new Country { Code = "RU", Name = "Russia", IsActive = true }
            };
            await context.Countries.AddRangeAsync(countries);
            await context.SaveChangesAsync();
        }
        // Seed languages if none exist
        if (!await context.Languages.AnyAsync())
        {
            var languages = new List<Language>
            {
                new Language { Code = "en", Name = "English", IsActive = true },
                new Language { Code = "es", Name = "Spanish", IsActive = true },
                new Language { Code = "fr", Name = "French", IsActive = true },
                new Language { Code = "de", Name = "German", IsActive = true },
                new Language { Code = "it", Name = "Italian", IsActive = true },
                new Language { Code = "pt", Name = "Portuguese", IsActive = true },
                new Language { Code = "ru", Name = "Russian", IsActive = true },
                new Language { Code = "ja", Name = "Japanese", IsActive = true },
                new Language { Code = "ko", Name = "Korean", IsActive = true },
                new Language { Code = "zh", Name = "Chinese", IsActive = true },
                new Language { Code = "hi", Name = "Hindi", IsActive = true },
                new Language { Code = "ar", Name = "Arabic", IsActive = true },
                new Language { Code = "bn", Name = "Bengali", IsActive = true },
                new Language { Code = "tr", Name = "Turkish", IsActive = true }
            };
            await context.Languages.AddRangeAsync(languages);
            await context.SaveChangesAsync();
        }
        // Seed genres if none exist
        if (!await context.Genres.AnyAsync())
        {
            var genres = new List<Genre>
            {
                new Genre { Name = "Action", IsActive = true },
                new Genre { Name = "Adventure", IsActive = true },
                new Genre { Name = "Animation", IsActive = true },
                new Genre { Name = "Comedy", IsActive = true },
                new Genre { Name = "Crime", IsActive = true },
                new Genre { Name = "Documentary", IsActive = true },
                new Genre { Name = "Drama", IsActive = true },
                new Genre { Name = "Family", IsActive = true },
                new Genre { Name = "Fantasy", IsActive = true },
                new Genre { Name = "History", IsActive = true },
                new Genre { Name = "Horror", IsActive = true },
                new Genre { Name = "Music", IsActive = true },
                new Genre { Name = "Mystery", IsActive = true },
                new Genre { Name = "Romance", IsActive = true },
                new Genre { Name = "Science Fiction", IsActive = true },
                new Genre { Name = "TV Movie", IsActive = true },
                new Genre { Name = "Thriller", IsActive = true },
                new Genre { Name = "War", IsActive = true },
                new Genre { Name = "Western", IsActive = true }
            };
            await context.Genres.AddRangeAsync(genres);
            await context.SaveChangesAsync();
        }
    }
}
