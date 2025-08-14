using System.ComponentModel.DataAnnotations;
namespace CmsService.Models;  // Changed from CMS.Models to CmsService.Models

public class MoviePoster
{
    public int Id { get; set; }
    [Required]
    public int MovieId { get; set; }
    [Required]
    [StringLength(255)]
    public string FileName { get; set; } = string.Empty;
    [Required]
    [StringLength(255)]
    public string OriginalFileName { get; set; } = string.Empty;
    [Required]
    [StringLength(500)]
    public string FilePath { get; set; } = string.Empty;
    [Required]
    public long FileSize { get; set; }
    [Required]
    [StringLength(100)]
    public string ContentType { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    [Required]
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
}
