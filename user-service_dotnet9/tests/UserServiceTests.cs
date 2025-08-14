using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NSubstitute;
using UserService.Data;
using UserService.Models;
using UserService.Services;

namespace UserService.Tests;

public class UserServiceTests
{
    private readonly UserDbContext _context;
    private readonly IUserService _userService;
    private readonly ILogger<UserService> _logger;

    public UserServiceTests()
    {
        var options = new DbContextOptionsBuilder<UserDbContext>()
            .UseInMemoryDatabase(databaseName: "UserServiceTestDb")
            .Options;
            
        _context = new UserDbContext(options);
        _logger = Substitute.For<ILogger<UserService>>();
        _userService = new UserService(_context, _logger);
        
        // Clean up database before each test
        _context.Database.EnsureDeleted();
        _context.Database.EnsureCreated();
    }

    [Fact]
    public async Task CreateUserAsync_ValidUser_ReturnsUser()
    {
        // Arrange
        string username = "testuser";
        string email = "test@example.com";
        string password = "Password123!";
        
        // Act
        var user = await _userService.CreateUserAsync(username, email, password);
        
        // Assert
        Assert.NotNull(user);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
        Assert.True(user.Id > 0);
    }

    [Fact]
    public async Task CreateUserAsync_DuplicateUsername_ThrowsException()
    {
        // Arrange
        string username = "testuser";
        string email = "test@example.com";
        string password = "Password123!";
        
        // Create first user
        await _userService.CreateUserAsync(username, email, password);
        
        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => 
            _userService.CreateUserAsync(username, "different@example.com", password));
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ExistingUser_ReturnsUser()
    {
        // Arrange
        string username = "testuser";
        string email = "test@example.com";
        string password = "Password123!";
        
        await _userService.CreateUserAsync(username, email, password);
        
        // Act
        var user = await _userService.GetUserByUsernameAsync(username);
        
        // Assert
        Assert.NotNull(user);
        Assert.Equal(username, user.Username);
        Assert.Equal(email, user.Email);
    }

    [Fact]
    public async Task GetUserByUsernameAsync_NonExistingUser_ReturnsNull()
    {
        // Act
        var user = await _userService.GetUserByUsernameAsync("nonexisting");
        
        // Assert
        Assert.Null(user);
    }

    [Fact]
    public async Task ValidatePasswordAsync_ValidPassword_ReturnsTrue()
    {
        // Arrange
        string username = "testuser";
        string email = "test@example.com";
        string password = "Password123!";
        
        var user = await _userService.CreateUserAsync(username, email, password);
        
        // Act
        var isValid = await _userService.ValidatePasswordAsync(user, password);
        
        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public async Task ValidatePasswordAsync_InvalidPassword_ReturnsFalse()
    {
        // Arrange
        string username = "testuser";
        string email = "test@example.com";
        string password = "Password123!";
        
        var user = await _userService.CreateUserAsync(username, email, password);
        
        // Act
        var isValid = await _userService.ValidatePasswordAsync(user, "WrongPassword!");
        
        // Assert
        Assert.False(isValid);
    }
}
