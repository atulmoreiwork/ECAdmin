namespace EC.API.Models;
public class PagedResultDto<T>
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public string TotalRecordsText 
    { 
        get
        {
            string returnString = string.Empty;
            if (TotalItems > 0)
            {
                returnString = TotalItems.ToString() + " " + (TotalItems > 1 ? "Records" : "Record") + " Found";
            }
            else
            {
                returnString = "0 Record Found";
            }
            return returnString;
        }
    }
    public List<ColumnsDetails> Columns { get; set; }
    public List<FilterDetails> Filter { get; set; }
    public T Data { get; set; } 
    public PagedResultDto()
    {
        
    }
    public PagedResultDto(int pageNumber, int pageSize, int totalItems, T data, 
                         List<ColumnsDetails>  columns = null, List<FilterDetails> filter = null)
    {
        this.PageNumber = pageNumber;
        this.PageSize = pageSize;
        this.TotalItems = totalItems;
        this.Data = data;
        this.Columns = columns;
        this.Filter = filter;
    }
}

public class ColumnsDetails
{
    public string Name { get; set; }
    public string DisplayName { get; set; }
    public bool IsDisplayOnGrid { get; set; } = true;
    public bool Html { get; set; }
    public string HtmlName { get; set; }
    public string Type { get; set; }
    public bool IsSorting { get; set; }
    public FilterConfig filter { get; set; } = new FilterConfig();
    public InsertionDetails InsertDetails { get; set; } = new InsertionDetails();
}
public class FilterConfig
{
    public bool IsFiltering { get; set; }
    public string FilterInputType { get; set; }
    public string FilterType { get; set; }        
    public string FilterName { get; set; }
    public string FilterFrom { get; set; }
    public string FilterTo { get; set; }
}
public class FilterDetails
{
    public string ColId { get; set; }
    public string Name { get; set; }
    public string Value { get; set; }
    public string Type { get; set; }        
}
public class InsertionDetails
{
    public bool IsDisplayOnGrid { get; set; } 
    public string ColId { get; set; }
    public string Name { get; set; }
    public string Value { get; set; }
    public string Type { get; set; }
}

public class GridFilter
{
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public List<FilterDetails> Filter { get; set; }
}
