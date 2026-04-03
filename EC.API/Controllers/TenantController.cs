using System.Net;
using EC.API.Models;
using EC.API.Repositories;
using EC.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EC.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TenantController : ControllerBase
{
    private readonly ILoggerManager _logger;
    private readonly ITenantRepository _tenantRepository;

    public TenantController(ILoggerManager logger, ITenantRepository tenantRepository)
    {
        _logger = logger;
        _tenantRepository = tenantRepository;
    }

    [HttpGet("GetTenants")]
    public async Task<APIResponse<List<Tenant>>> GetTenants()
    {
        try
        {
            var tenants = await _tenantRepository.GetTenants();
            return new APIResponse<List<Tenant>>(tenants, "Tenants retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Tenant => GetTenants =>", ex);
            return new APIResponse<List<Tenant>>(HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    [HttpPost("GetAllTenants")]
    public async Task<APIResponse<PagedResultDto<List<Tenant>>>> GetAllTenants([FromBody] GridFilter objFilter)
    {
        try
        {
            string TenantId = string.Empty;

            if (objFilter == null)
            {
                ModelState.AddModelError("GridFilter", "Grid Filter object is null");
                return new APIResponse<PagedResultDto<List<Tenant>>>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }

            if (objFilter.Filter?.Count > 0)
            {
                var filter = objFilter.Filter.Find(x => x.ColId.ToLower() == "tenantid");

                if (filter != null && !string.IsNullOrEmpty(filter.Value))
                    TenantId = filter.Value;
            }

            var tenants = await _tenantRepository.GetAllTenants(TenantId, objFilter.PageNumber, objFilter.PageSize);

            return new APIResponse<PagedResultDto<List<Tenant>>>(tenants, "Tenants retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Tenant => GetAllTenants =>", ex);
            return new APIResponse<PagedResultDto<List<Tenant>>>(HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    [HttpGet("GetTenantById")]
    public async Task<APIResponse<Tenant>> GetTenantById(int TenantId)
    {
        try
        {
            if (TenantId <= 0)
            {
                ModelState.AddModelError("TenantId", "Please provide TenantId");
                return new APIResponse<Tenant>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }

            var tenant = await _tenantRepository.GetTenantById(TenantId);

            return new APIResponse<Tenant>(tenant, "Tenant retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Tenant => GetTenantById =>", ex);
            return new APIResponse<Tenant>(HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    [HttpPost("AddUpdateTenant")]
    public async Task<APIResponse<int>> AddUpdateTenant([FromBody] Tenant objTenant)
    {
        try
        {
            if (!ModelState.IsValid)
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);

            objTenant.Flag = objTenant.TenantId <= 0 ? 1 : 2;

            var result = await _tenantRepository.AddUpdateTenant(objTenant);

            return new APIResponse<int>(result, "Tenant saved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Tenant => AddUpdateTenant =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, ex.Message);
        }
    }

    [HttpGet("DeleteTenant")]
    public async Task<APIResponse<int>> DeleteTenant(int TenantId)
    {
        if (TenantId <= 0)
        {
            ModelState.AddModelError("TenantId", "Please enter TenantId");
            return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }

        var result = await _tenantRepository.DeleteTenant(TenantId);

        return new APIResponse<int>(result, "Tenant deleted successfully.");
    }
}
