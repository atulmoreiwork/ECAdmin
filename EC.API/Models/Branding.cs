using System.ComponentModel.DataAnnotations;
namespace EC.API.Models;

public class Branding
{
    public int BrandingId { get; set; }
    public string? CompanyName { get; set; }
    public string? LogoUrl { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? SidebarColor { get; set; }
    public string? HeaderColor { get; set; }
    public string? FontFamily { get; set; }
    public string? ThemeMode { get; set; }
    public string? BrandingFor { get; set; }

    public int TotalRowCount { get; set; } // For Pagination
    public int Flag { get; set; } // 1-Insert, 2-Update, 3-Delete
}
