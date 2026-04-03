using System.ComponentModel.DataAnnotations;
namespace EC.API.Models;
public class LoginModel
{
    [Required]
    public string UserName { get; set; }

    [Required]
    public string Password { get; set; }
}

public class LoginResponse
{
    public string AccessToken { get;set;}
    public string RefreshToken { get; set; }
    public UserClaimData UserClaimData { get; set; }
}

public class TokenModel
{
    public string AccessToken { get; set; }
    public string RefreshToken { get; set; }
}

public class UserClaimData
{
    public string UserId { get; set; }
    public string Name { get; set; }
    public string LoginName { get; set; }
    public int TenantId { get; set; }
    public string Role { get; set; }
}
