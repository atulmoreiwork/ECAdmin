using Dapper;
using System.Data;
using EC.API.Models;
using EC.API.Services;
namespace EC.API.Repositories;

public interface ICategoryRepository
{
    bool IsCategoryExists(string CategoryName, int CategoryId = 0);
    Task<List<Categories>> GetCategories();
    Task<PagedResultDto<List<Categories>>> GetAllCategories(string CategoryId, string CategoryName, int PageIndex = 0, int PageSize = 0);
    Task<Categories> GetCategoryById(int CategoryId);
    Task<int> AddUpdateCategory(Categories objModel);
    Task<int> DeleteCategoryById(int CategoryId);
}

public class CategoryRepository : ICategoryRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    public CategoryRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }
    public bool IsCategoryExists(string CategoryName, int CategoryId = 0)
    {
        try
        {
            int CategoryExistId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT p_chk_categoryisexist(p_categoryname => @CategoryName)";
                var param = new DynamicParameters();
                param.Add("@CategoryName", CategoryName);
                if (CategoryId > 0) param.Add("@CategoryId", CategoryId);
                CategoryExistId = con.ExecuteScalar<int>(query, param);
            }
            return CategoryExistId > 0 ? true : false;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => IsCategoryExists =>", ex);
            throw;
        }
    }
    public async Task<List<Categories>> GetCategories()
    {
        try
        {
            var objResp = new List<Categories>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_categories(NULL)";
                var oParameters = new DynamicParameters();
                var result = await con.QueryAsync<Categories>(query, oParameters);
                objResp = result.ToList();
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => GetCategories =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Categories>>> GetAllCategories(string CategoryId, string CategoryName, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Categories>>();
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_categories(p_categoryid => @CategoryId, p_search => @Search, p_pageindex => @PageIndex, p_pagesize => @PageSize)";
                var param = new DynamicParameters();
                int? categoryIdParam = string.IsNullOrEmpty(CategoryId) ? null : int.Parse(CategoryId);
                param.Add("@CategoryId", categoryIdParam);
                param.Add("@Search", string.IsNullOrEmpty(CategoryName) ? null : (object)CategoryName);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Categories>(query, param);
                if (result == null) return new PagedResultDto<List<Categories>>();
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetCategoriesColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetCategoriesFilterDetails();
                }
                objResp = new PagedResultDto<List<Categories>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => GetAllCategories =>", ex);
            throw;
        }
    }
    public async Task<Categories> GetCategoryById(int CategoryId)
    {
        try
        {
            var objResp = new Categories();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_categories(p_categoryid => @CategoryId)";
                var param = new DynamicParameters();
                param.Add("@CategoryId", CategoryId);
                var _result = await con.QueryAsync<Categories>(query, param);
                objResp = _result.FirstOrDefault();
            }
            return objResp == null ? new Categories() : objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => GetCategoryById =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateCategory(Categories objModel)
    {
        try
        {
            int CategoryId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                long? tenantId = objModel.TenantId > 0 ? objModel.TenantId : (long?)null;
                long? categoryId = objModel.CategoryId > 0 ? objModel.CategoryId : (long?)null;
                long? parentCategoryId = objModel.ParentCategoryId > 0 ? objModel.ParentCategoryId : (long?)null;
                param.Add("@TenantId", tenantId);
                param.Add("@CategoryId", categoryId);
                param.Add("@ParentCategoryId", parentCategoryId);
                param.Add("@CategoryName", string.IsNullOrEmpty(objModel.CategoryName) ? null : (object)objModel.CategoryName);
                param.Add("@Description", string.IsNullOrEmpty(objModel.Description) ? null : (object)objModel.Description);
                param.Add("@Status", string.IsNullOrEmpty(objModel.Status) ? null : (object)objModel.Status);
                param.Add("@Flag", objModel.Flag);
                CategoryId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_categories(
                        p_categoryid => @CategoryId::bigint,
                        p_parentcategoryid => @ParentCategoryId::bigint,
                        p_categoryname => @CategoryName::character varying,
                        p_description => @Description::text,
                        p_status => @Status::character varying,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return CategoryId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => AddUpdateCategory =>", ex);
            throw;
        }
    }
    public async Task<int> DeleteCategoryById(int CategoryId)
    {
        try
        {
            int _categoryId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@CategoryId", (long?)CategoryId);
                param.Add("@Flag", 3);
                _categoryId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_categories(
                        p_categoryid => @CategoryId::bigint,
                        p_parentcategoryid => NULL::bigint,
                        p_categoryname => NULL::character varying,
                        p_description => NULL::text,
                        p_status => NULL::character varying,
                        p_tenantid => NULL::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return _categoryId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CategoryRepository => DeleteCategoryById =>", ex);
            throw;
        }
    }
}
