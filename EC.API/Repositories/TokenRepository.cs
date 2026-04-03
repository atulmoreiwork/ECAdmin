using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using EC.API.Models;
using EC.API.Services;
using Microsoft.IdentityModel.Tokens;
namespace EC.API.Repositories;

public interface ITokenRepository
{
    string GenerateToken(IEnumerable<Claim> claims);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}

public class TokenRepository : ITokenRepository
{
    private readonly JwtTokenConfig _tokenConfig;
    private readonly byte[] _secret;
    public TokenRepository(JwtTokenConfig tokenConfig)
    {
        _tokenConfig = tokenConfig;
        _secret = Encoding.ASCII.GetBytes(_tokenConfig.Secret);
    }

    public string GenerateToken(IEnumerable<Claim> claims)
    {
        var secretKey = new SymmetricSecurityKey(_secret);
        var signinCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256);

        var tokenOptions = new JwtSecurityToken(
            issuer: _tokenConfig.Issuer,
            audience: _tokenConfig.Audience,
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: signinCredentials
        );
        return new JwtSecurityTokenHandler().WriteToken(tokenOptions);
    }

    public string GenerateRefreshToken()
    {
        var randomNumber = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    public ClaimsPrincipal GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,

            ValidIssuer = _tokenConfig.Issuer,
            ValidAudience = _tokenConfig.Audience,

            ValidateLifetime = false, // IMPORTANT for refresh token
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(_secret)
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken ||
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }

}
