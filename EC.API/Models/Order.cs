using System.ComponentModel.DataAnnotations;

namespace EC.API.Models;

public class OrderDTO
{
    public int CustomerId { get; set; }
    public int ShippingAddressId { get; set; }
    public string PaymentType { get; set; }
    public string PaymentTransactionId { get; set; }
    public List<Carts> CartItems { get; set; }
    public OrderShippingAddress OrderShippingAddress { get; set; }
}

public class Carts
{
    public int CartId { get; set; } // Primary Key
    public int CustomerId { get; set; } // Foreign Key - User
    public int ProductId { get; set; } // Foreign Key - Product (nullable)
    public int ProductVariantId { get; set; } // Foreign Key - Product Variant (nullable)
    public int Quantity { get; set; } // Quantity of items in the cart
}

public class Order
{
    public int OrderId { get; set; } // Primary Key
    public string OrderNumber { get; set; } // Unique Order Number
    public int CustomerId { get; set; } // Foreign Key - User
    public string? CustomerName { get; set; }
    public int CategoryId { get; set; }
    public int ShippingAddressId { get; set; }
    public double TotalAmount { get; set; } = 1500f;
    public double DiscountAmount { get; set; } = 100f;
    public double GrossAmount { get; set; } = 1400f;
    public double ShippingAmount { get; set; } = 50f;
    public double NetAmount { get; set; } = 1450f;
    public string Status { get; set; } // Enum - Placed / Packed / Shipped / Delivered
    public string PaymentStatus { get; set; }
    public string PaymentType { get; set; }
    public string PaymentTransactionId { get; set; }
    public Customer? Customer { get; set; }
    public OrderShippingAddress OrderShippingAddress { get; set; }
    public List<OrderItem> OrderItems { get; set; }
    public int Flag { get; set; }
    public string Row { get; set; }
    public string TotalRowCount { get; set; }
    public int TenantId { get; set; }

    public DateTime CreatedOn { get; set; }
    public int TotalItemQuantity { get; set; }
}
public class OrderItem
{
    public int OrderItemId { get; set; } // Primary Key
    public int OrderId { get; set; } // Foreign Key - Order
    public int ProductId { get; set; } // Foreign Key - Product
    public int ProductVariantId { get; set; } // Foreign Key - Product Variant (nullable)
    public string ProductName { get; set; }
    public string Color { get; set; } // Nullable
    public string Size { get; set; } // Nullable
    public double Price { get; set; }
    public int Quantity { get; set; }
    public double TotalAmount { get; set; }
}
public class OrderShippingAddress
{
    public int OrderShippingAddressId { get; set; } // Primary Key
    public int OrderId { get; set; } // Foreign Key - Order
    public string Address { get; set; }
    public string State { get; set; }
    public string City { get; set; }
    public string PostalCode { get; set; }
    public string Country { get; set; }
    public int Flag { get; set; }

}
public class Offer
{
    public int Id { get; set; } // Primary Key
    public string CouponCode { get; set; } // Unique
    public DiscountType DiscountType { get; set; } // Enum - fixed / rate
    public double DiscountValue { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Description { get; set; }
    public OfferStatus Status { get; set; } // Enum - active / inactive
}
public enum OrderStatus
{
    Placed,
    Processing,
    Shipping,
    Delivered
}
public enum PaymentStatus
{
    Paid,
    NotPaid
}
public enum PaymentType
{
    NetBanking,
    UPI,
    COD
}
public enum DiscountType
{
    Fixed,
    Rate
}
public enum OfferStatus
{
    Active,
    Inactive
}
