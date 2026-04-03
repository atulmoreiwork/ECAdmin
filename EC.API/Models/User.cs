
using System.ComponentModel.DataAnnotations;
namespace EC.API.Models;

public class CustomerDetails
{
    public int CustomerId { get; set; }
    public string CustomerFirstName { get; set; }
    public string CustomerLastName { get; set; }
    public string CustomerFullName { get; set; }
    public string CustomerFullAddress { get; set; }
    public string CustomerCity { get; set; }
    public string CustomerState { get; set; }
    public string CustomerZipCode { get; set; }
    public string CustomerPhoneNumber { get; set; }

}
public class User
{
    public int UserId { get; set; }
    public int RoleId { get; set; }

    [Required(ErrorMessage = "Please enter name")]
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string? UserName { get; set; }

    [Required(ErrorMessage = "Please enter email")]
    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", ErrorMessage = "Email is invalid")]
    public string Email { get; set; }
    public string Password { get; set; }
    public string PhoneNumber { get; set; }
    public string Status { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
    public string RoleName { get; set; }
    public int TenantId { get; set; }
    public int IsDefault { get; set; }
}

public class UserImportDto
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Password { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Role { get; set; }
    public bool IsError { get; set; }
    public string? ErrorMessage { get; set; }
}
