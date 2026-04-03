using System.Net;
using EC.API.Models;
using EC.API.Repositories;
using EC.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EC.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandingController : ControllerBase
{
    private readonly IBrandingRepository _brandingRepository;
    private readonly ILoggerManager _logger;
    public BrandingController(IBrandingRepository brandingRepository, ILoggerManager logger)
    {
        _brandingRepository = brandingRepository;
        _logger = logger;
    }

    [HttpGet("GetBranding")]
    public async Task<APIResponse<Branding>> GetBranding(string BrandingFor = "admin")
    {
        Branding objBranding = new Branding();
        try
        {
            objBranding = await _brandingRepository.GetBrandingByBrandingFor(BrandingFor);
            return new APIResponse<Branding>(objBranding, "Branding retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Branding => GetBranding =>", ex);
            return new APIResponse<Branding>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("SaveBranding")]
    public async Task<APIResponse<int>> SaveBranding([FromBody] Branding objBranding)
    {
        int result = 0;
        try
        {
            if (!ModelState.IsValid)
            {
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            objBranding.BrandingFor = string.IsNullOrWhiteSpace(objBranding.BrandingFor) ? "admin" : objBranding.BrandingFor;
            if (objBranding.BrandingId <= 0) { objBranding.Flag = 1; }
            else { objBranding.Flag = 2; }
            result = await _brandingRepository.AddUpdateBranding(objBranding);
            string successMessage = "Branding added successfully";
            if (objBranding.Flag == 2) { successMessage = "Branding updated successfully"; }
            return new APIResponse<int>(result, successMessage);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Branding => SaveBranding =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }
}
