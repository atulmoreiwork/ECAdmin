using EC.API.Repositories;
using EC.API.Services;
using Microsoft.AspNetCore.Mvc;
using EC.API.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace EC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{

    private readonly IUserRepository _userRepository;
    private readonly ITokenRepository _tokenRepository;
    public AccountController(IUserRepository userRepository, ITokenRepository tokenRepository)
    {
        _userRepository = userRepository;
        _tokenRepository = tokenRepository;
    }

    [AllowAnonymous]
    [HttpPost("Login")]
    public IActionResult Login([FromBody] LoginModel loginModel)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest();
        }
        var objUser = _userRepository.ValidateUser(loginModel.UserName, loginModel.Password).Result;
        if (objUser == null)
        {
            return Unauthorized();
        }
        var claims = new[]
        {
            new Claim(ClaimTypes.Sid, objUser.UserId.ToString()),
            new Claim(ClaimTypes.Name, objUser.Email),
            new Claim(ClaimTypes.Role, string.IsNullOrEmpty(objUser.RoleName) ? string.Empty : objUser.RoleName),
            new Claim("UserId", objUser.UserId == 0 ? string.Empty : objUser.UserId.ToString()),
            new Claim("Name", String.IsNullOrEmpty(objUser.FirstName) ? string.Empty : objUser.FirstName),
            new Claim("Email", string.IsNullOrEmpty(objUser.Email) ? string.Empty : objUser.Email),
            new Claim("Role", string.IsNullOrEmpty(objUser.RoleName) ? string.Empty : objUser.RoleName),
            new Claim("TenantId", objUser.TenantId <= 0 ? string.Empty : objUser.TenantId.ToString())
        };
        var token = _tokenRepository.GenerateToken(claims);
        var refreshToken = _tokenRepository.GenerateRefreshToken();
        objUser.RefreshToken = refreshToken;
        objUser.RefreshTokenExpiryTime = DateTime.Now.AddDays(7);
        objUser.Flag = 2;
        _userRepository.AddUpdateUser(objUser);

        var userClaimData = new UserClaimData
        {
            UserId = objUser.UserId.ToString(),
            Name = objUser.FirstName + " " + objUser.LastName,
            LoginName = objUser.Email,
            TenantId = objUser.TenantId,
            Role = objUser.RoleName
        };

        return Ok(new LoginResponse
        {
            AccessToken = token,
            RefreshToken = refreshToken,
            UserClaimData = userClaimData
        });
    }

    [HttpPost("Refresh")]
    public IActionResult RefreshToken([FromBody] TokenModel tokenModel)
    {
        if (tokenModel is null)
            return BadRequest("Invalid client request");

        string accessToken = tokenModel.AccessToken;
        string refreshToken = tokenModel.RefreshToken;

        var principal = _tokenRepository.GetPrincipalFromExpiredToken(accessToken);
        var loginName = principal?.Identity?.Name;
        var objUser = _userRepository.GetUserByUserName(loginName!).Result;
        if (objUser is null || objUser.RefreshToken != refreshToken || objUser.RefreshTokenExpiryTime <= DateTime.Now)
            return BadRequest("Invalid client request");

        var newAccessToken = _tokenRepository.GenerateToken(principal!.Claims);
        var newRefreshToken = _tokenRepository.GenerateRefreshToken();
        objUser.RefreshToken = newRefreshToken;
        objUser.Flag = 2;
        _userRepository.AddUpdateUser(objUser);
        var userClaimData = new UserClaimData
        {
            UserId = objUser.UserId.ToString(),
            Name = objUser.FirstName + " " + objUser.LastName,
            LoginName = objUser.Email,
            TenantId = objUser.TenantId,
            Role = objUser.RoleName
        };
        return Ok(new LoginResponse()
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken,
            UserClaimData = userClaimData
        });
    }
}
