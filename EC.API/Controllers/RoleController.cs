using System.Net;
using Microsoft.AspNetCore.Mvc;
using EC.API.Repositories;
using Microsoft.AspNetCore.Authorization;
using EC.API.Models;
using EC.API.Services;

namespace EC.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class RoleController : ControllerBase
{
    private readonly ILoggerManager _logger;
    private readonly IRoleRepository _roleRepository;
    public RoleController(IRoleRepository roleRepository, ILoggerManager logger)
    {
        _logger = logger;
        _roleRepository = roleRepository;
    }

    [HttpGet("GetRoles")]
    public async Task<APIResponse<List<Role>>> GetRoles()
    {
        List<Role> lstRole = new List<Role>();
        try
        {
            lstRole = await _roleRepository.GetRoles();
            return new APIResponse<List<Role>>(lstRole, "Roles retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleController => GetRoles =>", ex);
            return new APIResponse<List<Role>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("GetAllRoles")]
    public async Task<APIResponse<PagedResultDto<List<Role>>>> GetAllRoles([FromBody] GridFilter objFilter)
    {
        try
        {
            _logger.LogInfo("[RoleController]|[GetAllRoles]|[Start] => Get All roles records.");
            string RoleId = string.Empty;
            if (objFilter == null)
            {
                ModelState.AddModelError("GridFilter", "Grid Filter object are null");
                return new APIResponse<PagedResultDto<List<Role>>>(HttpStatusCode.BadRequest, "Grid filter object is null", ModelState.AllErrors(), true);
            }
            if (objFilter != null && objFilter.Filter != null && objFilter.Filter.Count > 0)
            {
                var _filter = objFilter.Filter.Find(x => x.ColId.ToLower() == "roleid");
                if (_filter != null && !string.IsNullOrEmpty(_filter.Value)) { RoleId = _filter.Value; }
            }
            var lstRole = await _roleRepository.GetAllRoles(RoleId, objFilter.PageNumber, objFilter.PageSize);
            return new APIResponse<PagedResultDto<List<Role>>>(lstRole, "Roles retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleController => GetAllRoles =>", ex);
            return new APIResponse<PagedResultDto<List<Role>>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("GetRoleById")]
    public async Task<APIResponse<Role>> GetRoleById(int RoleId)
    {
        _logger.LogInfo("[RoleController]|[GetRoleById]|[Start] => Get user by id.");
        if (RoleId == 0)
        {
            ModelState.AddModelError("RoleId", "Please provide roleid");
            return new APIResponse<Role>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _roleRepository.GetRoleById(RoleId);
        return new APIResponse<Role>(result, "Role retrived successfully.");
    }

    [HttpPost("AddUpdateRole")]
    public async Task<APIResponse<int>> AddUpdateRole([FromBody] Role objModel)
    {
        int result = 0;
        try
        {
            if (!ModelState.IsValid)
            {
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            if (objModel.RoleId <= 0) { objModel.Flag = 1; }
            else { objModel.Flag = 2; }
            result = await _roleRepository.AddUpdateRole(objModel);
            return new APIResponse<int>(result, "Role created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleController => AddRole =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("DeleteRoleById")]
    public async Task<APIResponse<int>> DeleteRoleById(int RoleId)
    {
        _logger.LogInfo("[RoleController]|[DeleteRoleById]|[Start] => DeleteRoleById => RoleId: " + RoleId);
        if (RoleId <= 0)
        {
            ModelState.AddModelError("RoleId", "Please enter role id");
            return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _roleRepository.DeleteRole(RoleId);
        string successMessage = "Role deleted successfully";
        return new APIResponse<int>(result, successMessage);
    }
}
