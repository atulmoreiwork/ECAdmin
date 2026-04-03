using Dapper;
using System.Data;
using EC.API.Models;
using EC.API.Services;
namespace EC.API.Repositories;

public interface IBrandingRepository
{
    bool IsBrandingExists(string CompanyName, int BrandingId = 0);
    Task<List<Branding>> GetBrandings();
    Task<Branding> GetBrandingByBrandingFor(string BrandingFor);
    Task<PagedResultDto<List<Branding>>> GetAllBrandings(string CompanyName, int TenantId, int PageIndex = 0, int PageSize = 0);
    Task<Branding> GetBrandingById(int BrandingId);
    Task<int> AddUpdateBranding(Branding objModel);
    Task<int> DeleteBrandingById(int BrandingId);
}

public class BrandingRepository : IBrandingRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;

    public BrandingRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }

    public bool IsBrandingExists(string CompanyName, int BrandingId = 0)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT p_chk_brandingisexist(p_companyname => @CompanyName)";
            var param = new DynamicParameters();
            param.Add("@CompanyName", CompanyName);
            if (BrandingId > 0)
                param.Add("@BrandingId", BrandingId);
            int result = con.ExecuteScalar<int>(query, param);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => IsBrandingExists =>", ex);
            throw;
        }
    }
    public async Task<Branding> GetBrandingByBrandingFor(string BrandingFor)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT * FROM p_get_brandings(p_brandingfor => @BrandingFor)";
            var param = new DynamicParameters();
            param.Add("@BrandingFor", string.IsNullOrWhiteSpace(BrandingFor) ? "admin" : BrandingFor);
            var result = await con.QueryAsync<Branding>(query, param);
            return result.FirstOrDefault() ?? new Branding();
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => GetBrandingByBrandingFor =>", ex);
            throw;
        }
    }
    public async Task<List<Branding>> GetBrandings()
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT * FROM p_get_brandings(NULL, NULL, NULL, NULL)";
            var result = await con.QueryAsync<Branding>(query);
            return result.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => GetBrandings =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Branding>>> GetAllBrandings(string CompanyName, int TenantId, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT * FROM p_get_brandings(p_brandingid => NULL, p_search => @Search, p_tenantid => @TenantId, p_pageindex => @PageIndex, p_pagesize => @PageSize)";
            var param = new DynamicParameters();
            param.Add("@Search", string.IsNullOrEmpty(CompanyName) ? null : (object)CompanyName);
            int? tenantId = TenantId > 0 ? TenantId : (int?)null;
            int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
            int? pageSize = PageSize > 0 ? PageSize : (int?)null;
            param.Add("@TenantId", tenantId);
            param.Add("@PageIndex", pageIndex);
            param.Add("@PageSize", pageSize);
            var result = await con.QueryAsync<Branding>(query, param);
            int count = result.Any() ? result.First().TotalRowCount : 0;
            var columnDetails = _gridDataHelperRepository.GetBrandingColumnDetails();
            var filterDetails = _gridDataHelperRepository.GetBrandingFilterDetails();
            return new PagedResultDto<List<Branding>>(PageIndex, PageSize, count, result.ToList(), columnDetails, filterDetails);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => GetAllBrandings =>", ex);
            throw;
        }
    }
    public async Task<Branding> GetBrandingById(int BrandingId)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT * FROM p_get_brandings(p_brandingid => @BrandingId)";
            var param = new DynamicParameters();
            param.Add("@BrandingId", BrandingId);
            var result = await con.QueryAsync<Branding>(query, param);
            return result.FirstOrDefault() ?? new Branding();
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => GetBrandingById =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateBranding(Branding objModel)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT p_aud_brandings(p_brandingid => @BrandingId, p_companyname => @CompanyName, p_logourl => @LogoUrl, p_primarycolor => @PrimaryColor, p_secondarycolor => @SecondaryColor, p_sidebarcolor => @SidebarColor, p_headercolor => @HeaderColor, p_fontfamily => @FontFamily, p_thememode => @ThemeMode, p_brandingfor => @BrandingFor, p_tenantid => @TenantId, p_flag => @Flag)";
            var param = new DynamicParameters();
            int? brandingId = objModel.BrandingId > 0 ? objModel.BrandingId : (int?)null;
            param.Add("@BrandingId", brandingId);
            param.Add("@CompanyName", objModel.CompanyName);
            param.Add("@LogoUrl", objModel.LogoUrl);
            param.Add("@PrimaryColor", objModel.PrimaryColor);
            param.Add("@SecondaryColor", objModel.SecondaryColor);
            param.Add("@SidebarColor", objModel.SidebarColor);
            param.Add("@HeaderColor", objModel.HeaderColor);
            param.Add("@FontFamily", objModel.FontFamily);
            param.Add("@ThemeMode", objModel.ThemeMode);
            param.Add("@BrandingFor", objModel.BrandingFor);
            param.Add("@Flag", objModel.Flag);
            param.Add("@TenantId", 1);
            return await con.QuerySingleAsync<int>(query, param);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => AddUpdateBranding =>", ex);
            throw;
        }
    }
    public async Task<int> DeleteBrandingById(int BrandingId)
    {
        try
        {
            using var con = _datacontext.CreateConnection;
            string query = "SELECT p_aud_brandings(p_brandingid => @BrandingId, p_companyname => NULL, p_logourl => NULL, p_primarycolor => NULL, p_secondarycolor => NULL, p_sidebarcolor => NULL, p_headercolor => NULL, p_fontfamily => NULL, p_thememode => NULL, p_brandingfor => NULL, p_tenantid => NULL, p_flag => @Flag)";
            var param = new DynamicParameters();
            param.Add("@BrandingId", BrandingId);
            param.Add("@Flag", 3);
            return await con.QuerySingleAsync<int>(query, param);
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("BrandingRepository => DeleteBrandingById =>", ex);
            throw;
        }
    }
}
