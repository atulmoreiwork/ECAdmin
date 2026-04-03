using System.Data;
using Dapper;
using EC.API.Models;
using EC.API.Services;

namespace EC.API.Repositories;

public interface ITenantRepository
{
    Task<List<Tenant>> GetTenants();
    Task<PagedResultDto<List<Tenant>>> GetAllTenants(string TenantId, int PageIndex = 0, int PageSize = 0);
    Task<Tenant> GetTenantById(int TenantId);
    Task<int> AddUpdateTenant(Tenant objTenant);
    Task<int> DeleteTenant(int TenantId);
}
public class TenantRepository : ITenantRepository
{
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    private readonly ILoggerManager _logger;

    public TenantRepository(DataContext context, IGridDataHelperRepository gridDataHelperRepository, ILoggerManager logger)
    {
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
        _logger = logger;
    }

    public async Task<List<Tenant>> GetTenants()
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            var result = await con.QueryAsync<Tenant>("Select * from p_get_tenants()");
            return result.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("TenantRepository => GetTenants =>", ex);
            throw;
        }
    }

    public async Task<PagedResultDto<List<Tenant>>> GetAllTenants(string TenantId, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Tenant>>();
            using var con = _datacontext.CreateConnection;
            var param = new DynamicParameters();
            param.Add("@TenantId", string.IsNullOrEmpty(TenantId) ? null : (object)TenantId);
            int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
            int? pageSize = PageSize > 0 ? PageSize : (int?)null;
            param.Add("@PageIndex", pageIndex);
            param.Add("@PageSize", pageSize);
            var result = await con.QueryAsync<Tenant>("Select * from p_get_tenants(p_tenantid => @TenantId, p_pageindex => @PageIndex, p_pagesize => @PageSize)", param);
            int count = result.Any() ? result.First().TotalRowCount : 0;
            var columnDetails = _gridDataHelperRepository.GetTenantsColumnDetails();
            var filterDetails = _gridDataHelperRepository.GetTenantsFilterDetails();
            objResp = new PagedResultDto<List<Tenant>>(PageIndex, PageSize, count, result.ToList(), columnDetails, filterDetails);
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("TenantRepository => GetAllTenants =>", ex);
            throw;
        }
    }

    public async Task<Tenant> GetTenantById(int TenantId)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            var param = new DynamicParameters();
            param.Add("@TenantId", TenantId);
            return await con.QueryFirstOrDefaultAsync<Tenant>("Select * from p_get_tenants(p_tenantid => @TenantId)", param);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("TenantRepository => GetTenantById =>", ex);
            throw;
        }
    }

    public async Task<int> AddUpdateTenant(Tenant objTenant)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            var param = new DynamicParameters();
            int? tenantId = objTenant.TenantId > 0 ? objTenant.TenantId : (int?)null;
            param.Add("@TenantId", tenantId);
            param.Add("@Name", objTenant.Name);
            param.Add("@Domain", objTenant.Domain);
            param.Add("@Plans", objTenant.Plans);
            param.Add("@Status", objTenant.Status);
            param.Add("@Users", objTenant.Users);
            param.Add("@Flag", objTenant.Flag);
            return await con.ExecuteScalarAsync<int>("Select p_aud_tenant(p_tenantid => @TenantId, p_name => @Name, p_domain => @Domain, p_plans => @Plans, p_status => @Status, p_users => @Users, p_flag => @Flag)", param);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("TenantRepository => AddUpdateTenant =>", ex);
            throw;
        }
    }

    public async Task<int> DeleteTenant(int TenantId)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            var param = new DynamicParameters();
            param.Add("@TenantId", TenantId);
            param.Add("@Status", "Inactive");
            param.Add("@Flag", 3);
            return await con.ExecuteScalarAsync<int>("Select p_aud_tenant(p_tenantid => @TenantId, p_name => NULL, p_domain => NULL, plans => NULL, status => @Status, users => NULL, flag => @Flag)", param);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("TenantRepository => DeleteTenant =>", ex);
            throw;
        }
    }
}
