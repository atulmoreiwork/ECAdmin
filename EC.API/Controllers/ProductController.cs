using System.Net;
using System.Linq;
using System.Text.Json;
using EC.API.Models;
using EC.API.Repositories;
using EC.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace EC.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly ILoggerManager _logger;
    private readonly IProductRepository _productRepository;
    private readonly IDocumentRepository _documentRepository;
    public ProductController(ILoggerManager logger, IProductRepository productRepository, IDocumentRepository documentRepository)
    {
        _logger = logger;
        _productRepository = productRepository;
        _documentRepository = documentRepository;
    }

    [HttpGet("GetProducts")]
    public async Task<APIResponse<List<Product>>> GetProducts()
    {
        List<Product> lstProduct = new List<Product>();
        try
        {
            lstProduct = await _productRepository.GetProducts();
            return new APIResponse<List<Product>>(lstProduct, "Products retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => GetProducts =>", ex);
            return new APIResponse<List<Product>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("GetAllProducts")]
    public async Task<APIResponse<PagedResultDto<List<Product>>>> GetAllProducts([FromBody] GridFilter objFilter)
    {
        try
        {
            string ProductId = string.Empty; string CategoryId = string.Empty;
            string Status = string.Empty; string TenantId = string.Empty;
            if (objFilter == null)
            {
                ModelState.AddModelError("GridFilter", "Grid Filter object are null");
                return new APIResponse<PagedResultDto<List<Product>>>(HttpStatusCode.BadRequest, "Grid filter object is null", ModelState.AllErrors(), true);
            }
            if (objFilter != null && objFilter.Filter != null && objFilter.Filter.Count > 0)
            {
                var _filter = objFilter.Filter.Find(x => x.ColId.ToLower() == "productid");
                if (_filter != null && !string.IsNullOrEmpty(_filter.Value)) { ProductId = _filter.Value; }

                var _filterCategory = objFilter.Filter.Find(x => x.ColId.ToLower() == "categoryid");
                if (_filterCategory != null && !string.IsNullOrEmpty(_filterCategory.Value)) { CategoryId = _filterCategory.Value; }

                var _filterStatus = objFilter.Filter.Find(x => x.ColId.ToLower() == "status");
                if (_filterStatus != null && !string.IsNullOrEmpty(_filterStatus.Value)) { Status = _filterStatus.Value; }

                var _filterTenant = objFilter.Filter.Find(x => x.ColId.ToLower() == "tenantid");
                if (_filterTenant != null && !string.IsNullOrEmpty(_filterTenant.Value)) { TenantId = _filterTenant.Value; }

            }
            var lstProducts = await _productRepository.GetAllProducts(ProductId, CategoryId, Status, TenantId, objFilter.PageNumber, objFilter.PageSize);
            return new APIResponse<PagedResultDto<List<Product>>>(lstProducts, "Products retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => GetAllProducts =>", ex);
            return new APIResponse<PagedResultDto<List<Product>>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("GetProductById")]
    public async Task<APIResponse<Product>> GetProductById(int ProductId)
    {
        Product objProduct = new Product();
        try
        {
            if (ProductId == 0)
            {
                ModelState.AddModelError("ProductId", "Please provide productId");
                return new APIResponse<Product>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            objProduct = await _productRepository.GetProductById(ProductId);
            return new APIResponse<Product>(objProduct, "Product retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => GetProductById =>", ex);
            return new APIResponse<Product>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("GetProductByCategoryId")]
    public async Task<APIResponse<List<Product>>> GetProductByCategoryId(int CategoryId)
    {
        List<Product> lstProduct = new List<Product>();
        try
        {
            if (CategoryId == 0)
            {
                ModelState.AddModelError("CategoryId", "Please provide categoryId");
                return new APIResponse<List<Product>>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            lstProduct = await _productRepository.GetProductByCategoryId(CategoryId);
            return new APIResponse<List<Product>>(lstProduct, "Products retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => GetProductByCategoryId =>", ex);
            return new APIResponse<List<Product>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("AddUpdateProduct")]
    public async Task<APIResponse<int>> AddUpdateProduct()
    {
        try
        {
            Product objModel = new Product();
            var form = await Request.ReadFormAsync();
            var files = form.Files;
            if (files?.Count > 0)
            {
                var supportedTypes = new[] { "pdf", "jpg", "jpeg", "png" };
                foreach (var file in files)
                {
                    var fileExt = Path.GetExtension(file.FileName).Substring(1).ToLower();
                    if (!supportedTypes.Contains(fileExt))
                    {
                        ModelState.AddModelError("ImportFile", $"File '{file.FileName}' has an unsupported file type.");
                    }
                }
            }
            if (!ModelState.IsValid)
            {
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            objModel.ProductId = Convert.ToInt32(Request.Form["ProductId"]);
            objModel.ProductName = Convert.ToString(Request.Form["ProductName"]);
            objModel.CategoryId = Convert.ToInt32(Request.Form["CategoryId"]);
            objModel.Description = Convert.ToString(Request.Form["Description"]);
            objModel.Price = Convert.ToDouble(Request.Form["Price"]);
            objModel.Status = Convert.ToString(Request.Form["Status"]);
            if (objModel.TenantId > 0) objModel.TenantId = Convert.ToInt32(Request.Form["TenantId"]);
            objModel.ProductVariants = new List<ProductVariant>();

            var productVariantsJson = Request.Form["ProductVariants"];
            objModel.ProductVariants = JsonConvert.DeserializeObject<List<ProductVariant>>(productVariantsJson) ?? new List<ProductVariant>();
            var documentsJson = Request.Form["Documents"];
            objModel.Documents = string.IsNullOrWhiteSpace(documentsJson)
                ? new List<Document>()
                : JsonConvert.DeserializeObject<List<Document>>(documentsJson) ?? new List<Document>();
            foreach (var doc in objModel.Documents)
            {
                doc.AssociatedType = "Product";
                doc.AssociatedId = objModel.ProductId;
            }
            objModel.StockQuantity = 0;
            if (objModel.ProductId > 0) { objModel.Flag = 2; } else { objModel.Flag = 1; }
            foreach (var variant in objModel.ProductVariants)
            {
                objModel.StockQuantity = objModel.StockQuantity + Convert.ToInt32(variant.StockQuantity);
                if (variant.Documents == null) continue;
                foreach (var doc in variant.Documents)
                {
                    doc.AssociatedType = "ProductVariant";
                    doc.AssociatedId = variant.ProductVariantId;
                }
            }

            var result = await _productRepository.AddUpdateProduct(objModel);
            if (result > 0)
            {
                foreach (var doc in objModel.Documents.Where(x => x.DocumentId > 0 && !x.IsDeleted))
                {
                    doc.AssociatedId = result;
                    doc.AssociatedType = "Product";
                    doc.Flag = 2;
                    await _documentRepository.AddUpdateDocument(doc);
                }

                // 🔹 Save product-level images
                var deletedProductDocs = objModel.Documents
                    .Where(x => x.DocumentId > 0 && x.IsDeleted)
                    .Select(x => x.DocumentId)
                    .Distinct()
                    .ToList();

                foreach (var deletedDocId in deletedProductDocs)
                {
                    await _documentRepository.DeleteDocumentById(deletedDocId, "Product");
                }

                var productFiles = files.Where(f => f.Name == "ImportFile").ToArray();
                if (productFiles.Length > 0)
                {
                    await _documentRepository.AddProductDocumentWithFile(result, objModel.TenantId, productFiles, "Product");
                }

                // 🔹 Handle variant images
                foreach (var variant in objModel.ProductVariants)
                {
                    if (variant.Documents != null && variant.ProductVariantId > 0)
                    {
                        foreach (var doc in variant.Documents.Where(x => x.DocumentId > 0 && !x.IsDeleted))
                        {
                            doc.AssociatedId = variant.ProductVariantId;
                            doc.AssociatedType = "ProductVariant";
                            doc.Flag = 2;
                            await _documentRepository.AddUpdateDocument(doc);
                        }
                    }

                    // 🔹 FIXED: Delete removed images (using DeletedDocumentIds, not ImageKeys)
                    if (variant.DeletedDocumentIds != null && variant.DeletedDocumentIds.Count > 0)
                    {
                        foreach (var deletedDocId in variant.DeletedDocumentIds)
                        {
                            await _documentRepository.DeleteDocumentById(deletedDocId, "ProductVariant");
                        }
                    }

                    // 🔹 FIXED: Save new variant images with correct ProductVariantId
                    if (variant.ImageKeys != null && variant.ImageKeys.Count > 0)
                    {
                        foreach (var key in variant.ImageKeys)
                        {
                            var file = files.FirstOrDefault(f => f.Name == key);
                            if (file != null)
                            {
                                // 🔹 Now variant.ProductVariantId has the correct ID!
                                await _documentRepository.AddProductVariantDocumentWithFile(
                                    result,                      // ProductId
                                    variant.ProductVariantId,    // Correct VariantId (updated in repository)
                                    file,
                                    "ProductVariant"
                                );
                            }
                        }
                    }
                }
            }
            return new APIResponse<int>(result, "Product created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => AddProduct =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("DeleteProductById")]
    public async Task<APIResponse<int>> DeleteProductById(int ProductId)
    {
        _logger.LogInfo("[CategoryController]|[DeleteProductById]|[Start] => DeleteProductById => ProductId: " + ProductId);
        if (ProductId <= 0)
        {
            ModelState.AddModelError("ProductId", "Please enter ProductId");
            return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _productRepository.DeleteProductById(ProductId);
        string successMessage = "Product deleted successfully";
        return new APIResponse<int>(result, successMessage);
    }

    [HttpPost("GetProductsByIds")]
    public async Task<APIResponse<List<Product>>> GetProductsByIds([FromBody] List<long> productIds)
    {
        try
        {
            if (productIds == null || productIds.Count == 0)
            {
                ModelState.AddModelError("ProductIds", "Please provide at least one ProductId");
                return new APIResponse<List<Product>>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }

            var lstProducts = await _productRepository.GetProductsByIds(productIds);

            if (lstProducts == null || lstProducts.Count == 0)
            {
                return new APIResponse<List<Product>>(HttpStatusCode.NotFound, "No products found for the given IDs");
            }

            return new APIResponse<List<Product>>(lstProducts, "Products retrieved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Product => GetProductsByIds =>", ex);
            return new APIResponse<List<Product>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

}
