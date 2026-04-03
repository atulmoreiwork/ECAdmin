
using EC.API.Models;
using System.Data;
using Dapper;
using EC.API.Services;

namespace EC.API.Repositories;

public interface IRoleRepository
{
    Task<List<Role>> GetRoles();
    Task<Role> GetRoleById(int RoleId);
    Task<Role> GetRoleByName(string RoleName);
    Task<PagedResultDto<List<Role>>> GetAllRoles(string RoleId, int PageIndex = 0, int PageSize = 0);
    Task<int> AddUpdateRole(Role objRole);
    Task<int> DeleteRole(int RoleId);
    Task<int> CheckRoleIsExist(string RoleName);
    Task<List<string>> GetRoleNamesAsync();
}

public class RoleRepository : IRoleRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    public RoleRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }
    public async Task<Role> GetRoleById(int RoleId)
    {
        try
        {
            Role objRole = new Role();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@RoleId", RoleId);
                objRole = await con.QueryFirstOrDefaultAsync<Role>("Select * from p_get_roles(p_roleid => @RoleId)", param);
            }
            return objRole;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => GetRoleById =>", ex);
            throw;
        }
    }
    public async Task<Role> GetRoleByName(string RoleName)
    {
        try
        {
            Role objRole = new Role();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@RoleName", RoleName);
                objRole = await con.QueryFirstOrDefaultAsync<Role>("Select * from p_get_roles(p_rolename => @RoleName)", param);
            }
            return objRole;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => GetRoleByName =>", ex);
            throw;
        }
    }
    public async Task<List<Role>> GetRoles()
    {
        try
        {
            List<Role> lstRoles = new List<Role>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                var _result = await con.QueryAsync<Role>("Select * from p_get_roles()");
                lstRoles = _result.ToList();
            }
            return lstRoles;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => GetRoles =>", ex);
            throw;
        }
    }
    public async Task<List<string>> GetRoleNamesAsync()
    {
        try
        {
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                var result = await con.QueryAsync<Role>("Select * from p_get_roles()");
                return result.Select(r => r.RoleName.Trim()).ToList();
            }
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => GetRoleNamesAsync =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Role>>> GetAllRoles(string RoleId, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Role>>();
            string logParams = "RoleId:" + RoleId + "|PageIndex:" + PageIndex + "|PageSize:" + PageSize;
            _logger.LogInfo("[RoleRepository]|[GetAllRoles]|logParams: " + logParams);
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "Select * from p_get_roles(p_roleid => @RoleId, p_pagesize => @PageSize, p_pageindex => @PageIndex)";
                var param = new DynamicParameters();
                param.Add("@RoleId", string.IsNullOrEmpty(RoleId) ? null : (object)RoleId);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Role>(query, param);
                if (result == null) return null;
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetRolesColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetRolesFilterDetails();
                }
                objResp = new PagedResultDto<List<Role>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => GetAllRoles =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateRole(Role objRole)
    {
        try
        {
            int userId = 0;
            string logParams = "RoleName:" + objRole.RoleName + "|Flag:" + objRole.Flag;
            _logger.LogInfo("RoleRepository:AddUpdateRole:logParams: " + logParams);
            using (IDbConnection con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                int? roleId = objRole.RoleId > 0 ? objRole.RoleId : (int?)null;
                param.Add("@RoleId", roleId);
                param.Add("@RoleName", string.IsNullOrEmpty(objRole.RoleName) ? null : (object)objRole.RoleName);
                param.Add("@RoleDescription", string.IsNullOrEmpty(objRole.RoleDescription) ? null : (object)objRole.RoleDescription);
                param.Add("@Flag", objRole.Flag);
                userId = await con.ExecuteScalarAsync<int>("Select p_aud_roles(p_roleid => @RoleId, p_rolename => @RoleName, p_roledescription => @RoleDescription, p_flag => @Flag)", param);
            }
            return userId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => AddUpdateRole =>", ex);
            throw;
        }
    }
    public async Task<int> DeleteRole(int RoleId)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@RoleId", RoleId);
                param.Add("@Flag", 3);
                result = await con.ExecuteScalarAsync<int>("Select p_aud_roles(p_roleid => @RoleId, p_rolename => NULL, p_roledescription => NULL, p_flag => @Flag)", param);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => DeleteRole =>", ex);
            throw;
        }
    }

    public async Task<int> CheckRoleIsExist(string RoleName)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@RoleName", RoleName);
                result = await con.ExecuteScalarAsync<int>("p_CHK_RoleIsExist", param);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("RoleRepository => CheckRoleIsExist =>", ex);
            throw;
        }
    }
}
