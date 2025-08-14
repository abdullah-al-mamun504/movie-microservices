using UserService.Models;
using UserService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting user with ID: {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetUserProfile(int id)
    {
        try
        {
            var profile = await _userService.GetUserProfileAsync(id);
            if (profile == null)
            {
                return NotFound(new { error = "Profile not found" });
            }

            return Ok(profile);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error getting profile for user ID: {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("{id}/profile")]
    public async Task<IActionResult> UpdateUserProfile(int id, [FromBody] UserProfile profile)
    {
        try
        {
            // Ensure the profile ID matches the user ID
            if (profile.UserId != id)
            {
                return BadRequest(new { error = "Profile user ID mismatch" });
            }

            var updatedProfile = await _userService.UpdateUserProfileAsync(id, profile);
            return Ok(updatedProfile);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, ex.Message);
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating profile for user ID: {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result)
            {
                return NotFound(new { error = "User not found" });
            }

            return Ok(new { message = "User deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting user with ID: {id}");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
