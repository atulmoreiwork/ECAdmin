using System.Data;
using Dapper;
using EC.API.Models;
using EC.API.Services;
using Newtonsoft.Json;
namespace EC.API.Repositories;

public interface IProductRepository
{
    Task<List<Product>> GetProducts();
    Task<List<ProductVariant>> GetProductVariants(int ProductId);
    Task<PagedResultDto<List<Product>>> GetAllProducts(string ProductId, string CategoryId, string Status, string TenantId, int PageIndex = 0, int PageSize = 0);
    Task<Product> GetProductById(int ProductId);
    Task<ProductVariant> GetProductVariantByProductId(int ProductVariantId);
    Task<int> AddUpdateProduct(Product objProduct);
    Task<int> DeleteProductById(int ProductId);
    Task<List<Product>> GetProductByCategoryId(int CategoryId);
    Task<List<Product>> GetProductsByIds(List<long> ProductIds);
}

public class ProductRepository : IProductRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    public ProductRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }

    public async Task<List<Product>> GetProducts()
    {
        try
        {
            List<Product> lstProducts = new List<Product>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                var result = await con.QueryAsync<Product>("SELECT * FROM p_get_products()", param);
                lstProducts = result.ToList();
                if (lstProducts != null && lstProducts.Count > 0)
                {
                    for (int i = 0; i < lstProducts.Count; i++)
                    {
                        lstProducts[i].ProductVariants = new List<ProductVariant>();
                        lstProducts[i].ProductVariants = GetProductVariants(lstProducts[i].ProductId).Result;
                    }
                }
            }
            return lstProducts;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProducts =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Product>>> GetAllProducts(string ProductId, string CategoryId, string Status, string TenantId, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Product>>();
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_products(p_productid => @ProductId, p_categoryid => @CategoryId, p_status => @Status, p_tenantid => @TenantId, p_pagesize => @PageSize, p_pageindex => @PageIndex)";
                var param = new DynamicParameters();
                param.Add("@ProductId", string.IsNullOrEmpty(ProductId) ? null : (object)ProductId);
                param.Add("@CategoryId", string.IsNullOrEmpty(CategoryId) ? null : (object)CategoryId);
                param.Add("@Status", string.IsNullOrEmpty(Status) ? null : (object)Status);
                param.Add("@TenantId", string.IsNullOrEmpty(TenantId) ? null : (object)TenantId);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Product>(query, param);
                if (result == null) return null;
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetProductsColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetProductsFilterDetails();
                }
                objResp = new PagedResultDto<List<Product>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetAllProducts =>", ex);
            throw;
        }
    }
    public async Task<List<ProductVariant>> GetProductVariants(int ProductId)
    {
        try
        {
            List<ProductVariant> lstProductVariant = new List<ProductVariant>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                int? productId = ProductId > 0 ? ProductId : (int?)null;
                param.Add("@ProductId", productId);
                var result = await con.QueryAsync<ProductVariant>("SELECT * FROM p_get_productvariants(p_productid => @ProductId)", param);
                lstProductVariant = result.ToList();
                foreach (var item in lstProductVariant)
                {
                    if (!string.IsNullOrWhiteSpace(item.DocumentsJson))
                    {
                        try
                        {
                            item.Documents =
                                JsonConvert.DeserializeObject<List<Document>>(item.DocumentsJson)
                                ?? new List<Document>();
                        }
                        catch
                        {
                            item.Documents = new List<Document>();
                        }
                    }
                    else
                    {
                        item.Documents = new List<Document>();
                    }
                }
            }
            return lstProductVariant;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProductVariants =>", ex);
            throw;
        }
    }
    public async Task<Product> GetProductById(int ProductId)
    {
        try
        {
            Product objProduct = new Product();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@ProductId", ProductId);
                objProduct = await con.QueryFirstOrDefaultAsync<Product>("SELECT * FROM p_get_products(p_productid => @ProductId)", param);
            }
            if (objProduct != null && objProduct.ProductId > 0)
            {
                objProduct.ProductVariants = new List<ProductVariant>();
                objProduct.ProductVariants = GetProductVariants(objProduct.ProductId).Result;
            }
            return objProduct;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProductById =>", ex);
            throw;
        }
    }
    public async Task<ProductVariant> GetProductVariantByProductId(int ProductVariantId)
    {
        try
        {
            ProductVariant objProductVariant = new ProductVariant();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@ProductVariantId", ProductVariantId);
                objProductVariant = await con.QueryFirstOrDefaultAsync<ProductVariant>("SELECT * FROM p_get_productvariantsbyid(p_productvariantid => @ProductVariantId)", param, commandTimeout: 120);
            }
            return objProductVariant;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProductVariantByProductId =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateProduct(Product objProduct)
    {
        int productId = 0;
        using (var con = _datacontext.CreateConnection)
        {
            con.Open();
            using (var tran = con.BeginTransaction())
            {
                try
                {
                    var param = new DynamicParameters();
                    long? productIdParam = objProduct.ProductId > 0 ? objProduct.ProductId : (long?)null;
                    param.Add("@ProductId", productIdParam);
                    param.Add("@ProductName", string.IsNullOrEmpty(objProduct.ProductName) ? null : (object)objProduct.ProductName);
                    param.Add("@UrlSlug", string.IsNullOrEmpty(objProduct.UrlSlug) ? null : (object)objProduct.UrlSlug);
                    param.Add("@CategoryId", (long)objProduct.CategoryId);
                    param.Add("@Description", string.IsNullOrEmpty(objProduct.Description) ? null : (object)objProduct.Description);
                    param.Add("@Price", (decimal?)objProduct.Price);
                    param.Add("@StockQuantity", objProduct.StockQuantity);
                    param.Add("@Status", string.IsNullOrEmpty(objProduct.Status) ? null : (object)objProduct.Status);
                    param.Add("@Flag", objProduct.Flag);
                    param.Add("@TenantId", (long?)objProduct.TenantId);
                    productId = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_products(
                        p_productid => @ProductId::bigint,
                        p_productname => @ProductName::character varying,
                        p_urlslug => @UrlSlug::character varying,
                        p_categoryid => @CategoryId::bigint,
                        p_description => @Description::text,
                        p_price => @Price::numeric,
                        p_stockquantity => @StockQuantity::integer,
                        p_status => @Status::character varying,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param, transaction: tran);
                    if (objProduct.Flag == 2) { productId = objProduct.ProductId; }
                    if (productId > 0)
                    {
                        foreach (var variant in objProduct.ProductVariants)
                        {
                            param = new DynamicParameters();
                            param.Add("@ProductId", (long?)productId);
                            param.Add("@ProductVariantId", variant.ProductVariantId);
                            param.Add("@Color", string.IsNullOrEmpty(variant.Color) ? null : (object)variant.Color);
                            param.Add("@Size", string.IsNullOrEmpty(variant.Size) ? null : (object)variant.Size);
                            param.Add("@Price", string.IsNullOrEmpty(variant.Price) ? null : (object)variant.Price);
                            param.Add("@StockQuantity", string.IsNullOrEmpty(variant.StockQuantity) ? null : (object)variant.StockQuantity);
                            var variantFlag = variant.ProductVariantId > 0 ? 2 : 1;
                            param.Add("@Flag", variantFlag);
                            var productVariantId = await con.ExecuteScalarAsync<int>(
                             @"SELECT p_aud_productvariant(
                                p_productvariantid => @ProductVariantId::bigint,
                                p_productid => @ProductId::bigint,
                                p_color => @Color::character varying,
                                p_size => @Size::character varying,
                                p_price => @Price::numeric,
                                p_stockquantity => @StockQuantity::integer,
                                p_flag => @Flag::integer
                            )", param, transaction: tran);
                            if (variant.ProductVariantId == 0 && productVariantId > 0)
                            {
                                variant.ProductVariantId = productVariantId;
                            }
                        }
                    }
                    tran.Commit();
                }
                catch (Exception ex)
                {
                    productId = 0;
                    tran.Rollback();
                    _logger.LogLocationWithException("ProductRepository => AddUpdateProduct =>", ex);
                    throw new Exception(ex.Message);
                }
            }
        }
        return productId;
    }
    public async Task<int> DeleteProductById(int ProductId)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@ProductId", ProductId);
                param.Add("@Flag", 3);
                var _result = await con.ExecuteScalarAsync<int>("SELECT p_aud_products(p_productid => @ProductId, p_productname => NULL, p_urlslug => NULL, p_categoryid => NULL, p_description => NULL, p_price => NULL, p_stockquantity => NULL, p_status => NULL, p_tenantid => NULL, p_flag => @Flag)", param);
                if (_result > 0) { result = 1; }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => DeleteProductById =>", ex);
            throw;
        }
    }

    public async Task<List<Product>> GetProductByCategoryId(int CategoryId)
    {
        try
        {
            List<Product> lstProducts = new List<Product>();
            using (var con = _datacontext.CreateConnection)
            {
                DynamicParameters param = new DynamicParameters();
                param.Add("@CategoryId", CategoryId);
                var result = await con.QueryAsync<Product>("p_GET_Products", param);
                lstProducts = result.ToList();
            }
            if (lstProducts != null && lstProducts.Count > 0)
            {
                for (int i = 0; i < lstProducts.Count; i++)
                {
                    lstProducts[i].ProductVariants = new List<ProductVariant>();
                    lstProducts[i].ProductVariants = GetProductVariants(lstProducts[i].ProductId).Result;
                }
            }
            return lstProducts;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProductByCategoryId =>", ex);
            throw;
        }
    }

    public async Task<List<Product>> GetProductsByIds(List<long> ProductIds)
    {
        try
        {
            List<Product> lstProducts = new List<Product>();
            if (ProductIds == null || ProductIds.Count == 0)
                return lstProducts;

            using (var con = _datacontext.CreateConnection)
            {
                DynamicParameters param = new DynamicParameters();
                // Convert list of longs to comma-separated string
                param.Add("@ProductIds", string.Join(",", ProductIds));
                var result = await con.QueryAsync<Product>("SELECT * FROM p_get_products_byids(p_productids => @ProductIds)", param);
                lstProducts = result.ToList();
            }

            if (lstProducts != null && lstProducts.Count > 0)
            {
                for (int i = 0; i < lstProducts.Count; i++)
                {
                    lstProducts[i].ProductVariants = await GetProductVariants(lstProducts[i].ProductId);
                }
            }
            return lstProducts;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("ProductRepository => GetProductsByIds =>", ex);
            throw;
        }
    }

}
