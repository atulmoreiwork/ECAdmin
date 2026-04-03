
using System.ComponentModel.DataAnnotations;
namespace EC.API.Models;
public class Role
{
    public int RoleId { get;set;}
    public int TenantId { get; set; }
    public string RoleName { get;set;}
    public string RoleDescription { get;set;}
    public int UserCount { get;set;}
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
}
