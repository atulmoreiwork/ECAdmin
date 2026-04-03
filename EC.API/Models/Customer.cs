public class Customer
{
    public int CustomerId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Status { get; set; } = "active";
    public string Address { get; set; }
    public string City { get; set; }
    public string PostalCode { get; set; }
    public string State { get; set; }
    public string Country { get; set; }
    public string PhoneNumber { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }

    public int TotalSpent { get; set; }
    public DateTime LastOrderDate { get; set; }

    public int TenantId { get; set; }
}
