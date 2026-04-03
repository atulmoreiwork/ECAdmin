namespace EC.API.Models;

public class Tenant
{
    public int TenantId { get; set; }
    public string Id { get; set; }        // external GUID if needed
    public string Name { get; set; }
    public string Domain { get; set; }
    public string Plans { get; set; }      // Starter | Pro | Enterprise
    public string Status { get; set; }    // Active | Inactive
    public int Users { get; set; }
    public int IsDefault { get; set; }
    public int Flag { get; set; }
    public int TotalRowCount { get; set; }
}
