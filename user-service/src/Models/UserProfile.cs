using System.ComponentModel.DataAnnotations;

namespace UserService.Models;

public class UserProfile
{
    public int Id { get; set; }
    
    [Required]
    public int UserId { get; set; }
    
    [StringLength(50)]
    public string? FirstName { get; set; }
    
    [StringLength(50)]
    public string? LastName { get; set; }
    
    [StringLength(500)]
    public string? Bio { get; set; }
    
    [StringLength(255)]
    public string? AvatarUrl { get; set; }
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation property
    public User User { get; set; } = null!;
}
