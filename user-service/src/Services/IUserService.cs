using UserService.Models;
namespace UserService.Services;
public interface IUserService
{
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(string username, string email, string password, string role = "User");
    Task<bool> ValidatePasswordAsync(User user, string password);
    Task<UserProfile?> GetUserProfileAsync(int userId);
    Task<UserProfile> UpdateUserProfileAsync(int userId, UserProfile profile);
    Task<bool> DeleteUserAsync(int id);
}
