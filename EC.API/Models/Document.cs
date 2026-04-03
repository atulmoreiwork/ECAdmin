namespace EC.API.Models;

public class Document
{
    public int DocumentId { get; set; }
    public string DocumentType { get; set; }
    public string FileName { get; set; }
    public string FileUrl { get; set; }
    public string PhysicalFileUrl { get; set; }
    public int AssociatedId { get; set; }
    public string AssociatedType { get; set; }
    public bool IsDeleted { get; set; }
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
    public int TenantId { get; set; }
}
