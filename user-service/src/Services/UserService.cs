using UserService.Data;
using UserService.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace UserService.Services;

public class UserService : IUserService
{
    private readonly UserDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(UserDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        try
        {
            return await _context.Users
                .Include(u => u.Profile)
                .FirstOrDefaultAsync(u => u.Id == id && u.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user by ID: {id}");
            throw;
        }
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        try
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username && u.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user by username: {username}");
            throw;
        }
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        try
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user by email: {email}");
            throw;
        }
    }

    public async Task<User> CreateUserAsync(string username, string email, string password, string role = "User")
    {
        try
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Username == username || u.Email == email))
            {
                throw new InvalidOperationException("User with this username or email already exists");
            }

            // Hash password
            string passwordHash = HashPassword(password);

            // Create user
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                Role = role,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Create empty profile
            var profile = new UserProfile
            {
                UserId = user.Id,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Created new user: {username}");
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating user: {username}");
            throw;
        }
    }

    public async Task<bool> ValidatePasswordAsync(User user, string password)
    {
        try
        {
            return VerifyPassword(password, user.PasswordHash);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error validating password for user: {user.Username}");
            throw;
        }
    }

    public async Task<UserProfile?> GetUserProfileAsync(int userId)
    {
        try
        {
            return await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting profile for user ID: {userId}");
            throw;
        }
    }

    public async Task<UserProfile> UpdateUserProfileAsync(int userId, UserProfile updatedProfile)
    {
        try
        {
            var profile = await _context.UserProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new KeyNotFoundException($"Profile not found for user ID: {userId}");
            }

            profile.FirstName = updatedProfile.FirstName;
            profile.LastName = updatedProfile.LastName;
            profile.Bio = updatedProfile.Bio;
            profile.AvatarUrl = updatedProfile.AvatarUrl;
            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Updated profile for user ID: {userId}");
            return profile;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating profile for user ID: {userId}");
            throw;
        }
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        try
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return false;
            }

            // Soft delete - mark as inactive
            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Deleted user: {user.Username}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting user ID: {id}");
            throw;
        }
    }

    private string HashPassword(string password)
    {
        int saltSize = 16;
        int iterations = 10000;
        int hashSize = 32;
        
        byte[] salt = new byte[saltSize];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(salt);
        }
        
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256))
        {
            byte[] hash = pbkdf2.GetBytes(hashSize);
            
            byte[] hashBytes = new byte[saltSize + hashSize];
            Array.Copy(salt, 0, hashBytes, 0, saltSize);
            Array.Copy(hash, 0, hashBytes, saltSize, hashSize);
            
            return Convert.ToBase64String(hashBytes);
        }
    }

    private bool VerifyPassword(string password, string storedHash)
    {
        int saltSize = 16;
        int hashSize = 32;
        
        byte[] hashBytes = Convert.FromBase64String(storedHash);
        
        if (hashBytes.Length != saltSize + hashSize)
        {
            return false;
        }
        
        byte[] salt = new byte[saltSize];
        Array.Copy(hashBytes, 0, salt, 0, saltSize);
        
        using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000, HashAlgorithmName.SHA256))
        {
            byte[] computedHash = pbkdf2.GetBytes(hashSize);
            
            for (int i = 0; i < hashSize; i++)
            {
                if (hashBytes[saltSize + i] != computedHash[i])
                {
                    return false;
                }
            }
            
            return true;
        }
    }
}
