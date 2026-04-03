
using System.Security.Cryptography.X509Certificates;
using Newtonsoft.Json;

namespace EC.API.Models;

public class Product
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public string UrlSlug { get; set; }
    public int CategoryId { get; set; }
    public string Description { get; set; }
    public Double Price { get; set; }
    public int StockQuantity { get; set; }
    public string Status { get; set; }
    public string CategoryName { get; set; }
    public string ProductVariantCount { get; set; }
    public IFormFile[] ImportFile { get; set; }
    public List<ProductVariant> ProductVariants { get; set; }
    public List<Document> Documents { get; set; }
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
    public int TenantId { get; set; }
}

public class ProductVariant
{
    [JsonProperty("productVariantId")]
    public int ProductVariantId { get; set; }

    [JsonProperty("productId")]
    public int ProductId { get; set; }

    [JsonProperty("color")]
    public string Color { get; set; }

    [JsonProperty("size")]
    public string Size { get; set; }

    [JsonProperty("price")]
    public string Price { get; set; }

    [JsonProperty("stockQuantity")]
    public string StockQuantity { get; set; }

    [JsonProperty("imageKeys")]
    public List<string> ImageKeys { get; set; } = new();

    [JsonProperty("deletedDocumentIds")]
    public List<int> DeletedDocumentIds { get; set; } = new();

    [JsonProperty("documents")]
    public List<Document> Documents { get; set; }

    public string DocumentsJson { get; set; }

    [JsonProperty("imageUrl")]
    public string ImageUrl { get; set; }

    public int TenantId { get; set; }
}
