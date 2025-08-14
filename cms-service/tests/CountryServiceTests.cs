using Microsoft.EntityFrameworkCore;
using NSubstitute;
using CmsService.Data;
using CmsService.Models;
using CmsService.Services;

namespace CmsService.Tests;

public class CountryServiceTests
{
    private readonly CmsDbContext _context;
    private readonly ICountryService _countryService;
    private readonly ILogger<CountryService> _logger;

    public CountryServiceTests()
    {
        var options = new DbContextOptionsBuilder<CmsDbContext>()
            .UseInMemoryDatabase(databaseName: "CmsTestDb")
            .Options;
            
        _context = new CmsDbContext(options);
        _logger = Substitute.For<ILogger<CountryService>>();
        _countryService = new CountryService(_context, _logger);
        
        // Clean up database before each test
        _context.Database.EnsureDeleted();
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task GetAllCountriesAsync_ReturnsAllActiveCountries()
    {
        // Arrange
        await _context.Countries.AddRangeAsync(
            new Country { Code = "US", Name = "United States", IsActive = true },
            new Country { Code = "GB", Name = "United Kingdom", IsActive = true },
            new Country { Code = "CA", Name = "Canada", IsActive = false }
        );
        await _context.SaveChangesAsync();

        // Act
        var countries = await _countryService.GetAllCountriesAsync();

        // Assert
        Assert.NotNull(countries);
        Assert.Equal(2, countries.Count());
        Assert.All(countries, c => Assert.True(c.IsActive));
    }

    [Fact]
    public async Task GetCountryByIdAsync_ExistingId_ReturnsCountry()
    {
        // Arrange
        var country = new Country { Code = "US", Name = "United States", IsActive = true };
        _context.Countries.Add(country);
        await _context.SaveChangesAsync();

        // Act
        var result = await _countryService.GetCountryByIdAsync(country.Id);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(country.Id, result.Id);
        Assert.Equal(country.Code, result.Code);
        Assert.Equal(country.Name, result.Name);
    }

    [Fact]
    public async Task GetCountryByIdAsync_NonExistingId_ReturnsNull()
    {
        // Act
        var result = await _countryService.GetCountryByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateCountryAsync_ValidCountry_ReturnsCreatedCountry()
    {
        // Arrange
        var country = new Country { Code = "DE", Name = "Germany", IsActive = true };

        // Act
        var result = await _countryService.CreateCountryAsync(country);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(country.Code, result.Code);
        Assert.Equal(country.Name, result.Name);
        Assert.True(result.IsActive);
        Assert.True(result.Id > 0);
    }

    [Fact]
    public async Task CreateCountryAsync_DuplicateCode_ThrowsException()
    {
        // Arrange
        await _context.Countries.AddAsync(new Country { Code = "US", Name = "United States", IsActive = true });
        await _context.SaveChangesAsync();

        var country = new Country { Code = "US", Name = "United States of America", IsActive = true };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _countryService.CreateCountryAsync(country));
        Assert.Contains("already exists", exception.Message);
    }

    [Fact]
    public async Task UpdateCountryAsync_ValidCountry_ReturnsUpdatedCountry()
    {
        // Arrange
        var country = new Country { Code = "US", Name = "United States", IsActive = true };
        _context.Countries.Add(country);
        await _context.SaveChangesAsync();

        var updatedCountry = new Country { Code = "USA", Name = "United States of America", IsActive = true };

        // Act
        var result = await _countryService.UpdateCountryAsync(country.Id, updatedCountry);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(country.Id, result.Id);
        Assert.Equal(updatedCountry.Code, result.Code);
        Assert.Equal(updatedCountry.Name, result.Name);
    }

    [Fact]
    public async Task UpdateCountryAsync_NonExistingId_ReturnsNull()
    {
        // Arrange
        var country = new Country { Code = "US", Name = "United States", IsActive = true };

        // Act
        var result = await _countryService.UpdateCountryAsync(999, country);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteCountryAsync_ExistingId_ReturnsTrue()
    {
        // Arrange
        var country = new Country { Code = "US", Name = "United States", IsActive = true };
        _context.Countries.Add(country);
        await _context.SaveChangesAsync();

        // Act
        var result = await _countryService.DeleteCountryAsync(country.Id);

        // Assert
        Assert.True(result);
        
        // Verify the country is marked as inactive
        var deletedCountry = await _context.Countries.FindAsync(country.Id);
        Assert.False(deletedCountry.IsActive);
    }

    [Fact]
    public async Task DeleteCountryAsync_NonExistingId_ReturnsFalse()
    {
        // Act
        var result = await _countryService.DeleteCountryAsync(999);

        // Assert
        Assert.False(result);
    }
}
