using System.ComponentModel.DataAnnotations;
namespace CmsService.Models;  // Changed from CMS.Models to CmsService.Models

public class Language
{
    public int Id { get; set; }
    [Required]
    [StringLength(2)]
    public string Code { get; set; } = string.Empty;
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
