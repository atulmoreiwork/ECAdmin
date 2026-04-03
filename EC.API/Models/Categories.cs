using System.ComponentModel.DataAnnotations;
namespace EC.API.Models;

public class Categories
{
    public int CategoryId { get; set; }
    public int ParentCategoryId { get; set; }

    [Required(ErrorMessage = "Please enter category name")]
    public string CategoryName { get; set; }
    public string Description { get; set; }
    public string UrlSlug { get; set; }
    public string Status { get; set; } = "active";
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
    public int ProductCount { get; set; }
    public int TenantId { get; set; }
}
