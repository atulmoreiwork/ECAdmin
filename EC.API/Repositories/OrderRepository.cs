using System.Data;
using Dapper;
using EC.API.Models;
using EC.API.Services;

namespace EC.API.Repositories;

public interface IOrderRepository
{
    Task<List<Order>> GetOrders();
    Task<PagedResultDto<List<Order>>> GetAllOrders(string OrderId, string OrderNumber, int PageIndex = 0, int PageSize = 0);
    Task<Order> GetOrderById(int OrderId);
    Task<List<OrderItem>> GetOrderItemsByOrderId(int OrderId);
    Task<int> AddUpdateOrder(Order objModel);
    Task<int> DeleteOrderById(int OrderId);
    //Task<Order> CreateOrder(OrderDTO objOrder);

}

public class OrderRepository : IOrderRepository
{
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOrderShippingAddressRepository _orderShippingAddressRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly ILoggerManager _logger;
    public OrderRepository(DataContext context, IGridDataHelperRepository gridDataHelperRepository, IProductRepository productRepository, IOrderShippingAddressRepository orderShippingAddressRepository, ICustomerRepository customerRepository, ILoggerManager logger)
    {
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
        _productRepository = productRepository;
        _orderShippingAddressRepository = orderShippingAddressRepository;
        _customerRepository = customerRepository;
        _logger = logger;
    }

    public async Task<List<Order>> GetOrders()
    {
        try
        {
            List<Order> lstOrders = new List<Order>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                var _result = await con.QueryAsync<Order>("Select * from p_get_orders()");
                if (_result == null) return null;
                lstOrders = _result.ToList();
                for (int i = 0; i < lstOrders.Count(); i++)
                {
                    lstOrders[i].Customer = new Customer();
                    lstOrders[i].OrderShippingAddress = new OrderShippingAddress();
                    lstOrders[i].OrderItems = new List<OrderItem>();
                    lstOrders[i].Customer = await _customerRepository.GetCustomerById(lstOrders[i].CustomerId);
                    lstOrders[i].OrderShippingAddress = await _orderShippingAddressRepository.GetOrderShippingAddress(lstOrders[i].OrderId);
                    lstOrders[i].OrderItems = await GetOrderItemsByOrderId(lstOrders[i].OrderId);
                }
            }
            return lstOrders;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => GetOrders =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Order>>> GetAllOrders(string OrderId, string OrderNumber, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Order>>();
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "Select * from p_get_orders(p_orderid => @OrderId, p_ordernumber => @OrderNumber, p_pagesize => @PageSize, p_pageindex => @PageIndex)";
                var param = new DynamicParameters();
                param.Add("@OrderId", string.IsNullOrEmpty(OrderId) ? null : (object)OrderId);
                param.Add("@OrderNumber", string.IsNullOrEmpty(OrderNumber) ? null : (object)OrderNumber);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Order>(query, param);
                if (result == null) return null;
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetOrdersColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetOrdersFilterDetails();
                }
                objResp = new PagedResultDto<List<Order>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => GetAllOrders =>", ex);
            throw;
        }
    }

    public async Task<Order> GetOrderById(int OrderId)
    {
        try
        {
            var objResp = new Order();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "Select * from p_get_orders(p_orderid => @OrderId)";
                var param = new DynamicParameters();
                param.Add("@OrderId", OrderId);
                var result = await con.QueryFirstOrDefaultAsync<Order>(query, param);
                if (result == null) return null;
                objResp = result;
                objResp.Customer = new Customer();
                objResp.OrderShippingAddress = new OrderShippingAddress();
                objResp.OrderItems = new List<OrderItem>();
                objResp.Customer = await _customerRepository.GetCustomerById(objResp.CustomerId);
                objResp.OrderShippingAddress = await _orderShippingAddressRepository.GetOrderShippingAddress(OrderId);
                objResp.OrderItems = await GetOrderItemsByOrderId(OrderId);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => GetOrderById =>", ex);
            throw;
        }
    }
    public async Task<List<OrderItem>> GetOrderItemsByOrderId(int OrderId)
    {
        try
        {
            List<OrderItem> lstOrderItems = new List<OrderItem>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@OrderId", OrderId);
                var _result = await con.QueryAsync<OrderItem>("Select * from p_get_orderitems(p_orderid => @OrderId)", param);
                lstOrderItems = _result.ToList();
            }
            return lstOrderItems;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => GetOrderItemsByOrderId =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateOrder(Order objOrderModel)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                con.Open();
                using (var tran = con.BeginTransaction())
                {
                    try
                    {
                        var param = new DynamicParameters();
                        int? orderId = objOrderModel.OrderId > 0 ? objOrderModel.OrderId : (int?)null;
                        int? customerId = objOrderModel.CustomerId > 0 ? objOrderModel.CustomerId : (int?)null;
                        param.Add("@OrderId", orderId);
                        param.Add("@CustomerId", customerId);
                        param.Add("@TotalAmount", objOrderModel.TotalAmount);
                        param.Add("@DiscountAmount", objOrderModel.DiscountAmount);
                        param.Add("@GrossAmount", objOrderModel.GrossAmount);
                        param.Add("@ShippingAmount", objOrderModel.ShippingAmount);
                        param.Add("@NetAmount", objOrderModel.NetAmount);
                        param.Add("@Status", string.IsNullOrEmpty(objOrderModel.Status?.ToString()) ? null : (object)objOrderModel.Status);
                        param.Add("@PaymentStatus", string.IsNullOrEmpty(objOrderModel.PaymentStatus?.ToString()) ? null : (object)objOrderModel.PaymentStatus);
                        param.Add("@PaymentType", string.IsNullOrEmpty(objOrderModel.PaymentType?.ToString()) ? null : (object)objOrderModel.PaymentType);
                        param.Add("@PaymentTransactionId", string.IsNullOrEmpty(objOrderModel.PaymentTransactionId) ? null : (object)objOrderModel.PaymentTransactionId);
                        param.Add("@TenantId", (long?)objOrderModel.TenantId);
                        param.Add("@Flag", objOrderModel.Flag);
                        objOrderModel.OrderId = await con.ExecuteScalarAsync<int>("Select p_aud_order(p_orderid => @OrderId::bigint, p_customerid => @CustomerId::bigint, p_totalamount => @TotalAmount::numeric, p_discountamount => @DiscountAmount::numeric, p_grossamount => @GrossAmount::numeric, p_shippingamount => @ShippingAmount::numeric, p_netamount => @NetAmount::numeric, p_status => @Status::character varying, p_paymentstatus => @PaymentStatus::character varying, p_paymenttype => @PaymentType::character varying, p_paymenttransactionid => @PaymentTransactionId::character varying, p_tenantid => @TenantId::bigint, p_flag => @Flag::integer)", param, transaction: tran);
                        if (objOrderModel.Flag == 1)
                        {
                            foreach (var variant in objOrderModel.OrderItems)
                            {
                                param.Add("@OrderId", objOrderModel.OrderId);
                                param.Add("@ProductId", variant.ProductId);
                                param.Add("@ProductVariantId", variant.ProductVariantId);
                                param.Add("@ProductName", string.IsNullOrEmpty(variant.ProductName) ? null : (object)variant.ProductName);
                                param.Add("@Color", string.IsNullOrEmpty(variant.Color) ? null : (object)variant.Color);
                                param.Add("@Size", string.IsNullOrEmpty(variant.Size) ? null : (object)variant.Size);
                                param.Add("@Price", variant.Price);
                                param.Add("@Quantity", variant.Quantity);
                                param.Add("@TotalAmount", variant.TotalAmount);
                                param.Add("@CategoryId", objOrderModel.CategoryId);
                                param.Add("@Flag", objOrderModel.Flag);
                                var productVariantId = await con.ExecuteScalarAsync<int>("Select p_aud_orderitems(p_orderitemid => NULL::bigint, p_orderid => @OrderId::bigint, p_categoryid => @CategoryId::integer, p_productid => @ProductId::bigint, p_productvariantid => @ProductVariantId::bigint, p_productname => @ProductName::character varying, p_color => @Color::character varying, p_size => @Size::character varying, p_price => @Price::numeric, p_quantity => @Quantity::integer, p_totalamount => @TotalAmount::numeric, p_flag => @Flag::integer)", param, transaction: tran, commandTimeout: 120);
                            }
                        }
                        var orderShippingAddress = new OrderShippingAddress
                        {
                            OrderShippingAddressId = objOrderModel.OrderShippingAddress.OrderShippingAddressId,
                            OrderId = objOrderModel.OrderId,
                            Address = objOrderModel.OrderShippingAddress.Address,
                            State = objOrderModel.OrderShippingAddress.State,
                            City = objOrderModel.OrderShippingAddress.City,
                            PostalCode = objOrderModel.OrderShippingAddress.PostalCode
                        };
                        objOrderModel.OrderShippingAddress.OrderShippingAddressId = _orderShippingAddressRepository.AddUpdateShippingAddress(orderShippingAddress).Result;
                        tran.Commit();
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        _logger.LogLocationWithException("OrderRepository => AddUpdateOrder =>", ex);
                        throw;
                    }
                }
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => AddUpdateOrder =>", ex);
            throw;
        }
    }

    public async Task<int> DeleteOrderById(int OrderId)
    {
        try
        {
            int _orderId = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@OrderId", OrderId);
                param.Add("@Flag", 3);
                _orderId = await con.QuerySingleAsync<int>("Select p_aud_order(p_orderid => @OrderId::bigint, p_customerid => NULL::bigint, p_totalamount => NULL::numeric, p_discountamount => NULL::numeric, p_grossamount => NULL::numeric, p_shippingamount => NULL::numeric, p_netamount => NULL::numeric, p_status => NULL::character varying, p_paymentstatus => NULL::character varying, p_paymenttype => NULL::character varying, p_paymenttransactionid => NULL::character varying, p_tenantid => NULL::bigint, p_flag => @Flag::integer)", param);
            }
            return _orderId;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderRepository => DeleteOrderById =>", ex);
            throw;
        }
    }
    // public async Task<Order> CreateOrder(OrderDTO objOrder)
    // {
    //     // Validate the order inputs
    //     ValidateCartItems(objOrder.CartItems);
    //     ValidatePaymentType(objOrder.PaymentType, objOrder.PaymentTransactionId);

    //     // Calculate order amounts
    //     double totalAmount = objOrder.CartItems.Sum(item => item.Product.Price * item.Quantity);  // Assume Product has a Price property
    //     double discountAmount = 100; // Assume fixed discount
    //     double grossAmount = totalAmount - discountAmount;
    //     double shippingAmount = 50; // Assume fixed shipping
    //     double netAmount = grossAmount + shippingAmount;

    //     // Determine Payment Status based on Payment Type
    //     var paymentStatus = objOrder.PaymentType == PaymentType.COD.ToString() ? PaymentStatus.NotPaid : PaymentStatus.Paid;

    //     // Create a new order
    //     var objOrderModel = new Order
    //     {
    //         CustomerId = objOrder.CustomerId,
    //         OrderNumber = GenerateOrderNumber(),
    //         TotalAmount = totalAmount,
    //         DiscountAmount = discountAmount,
    //         GrossAmount = grossAmount,
    //         ShippingAmount = shippingAmount,
    //         NetAmount = netAmount,
    //         Status = OrderStatus.Placed,
    //         PaymentStatus = paymentStatus,
    //         PaymentType = Enum.Parse<PaymentType>(objOrder.PaymentType),
    //         PaymentTransactionId = objOrder.PaymentTransactionId,
    //         OrderItems = objOrder.CartItems.Select(cartItem => new OrderItem
    //         {
    //             ProductId = cartItem.ProductId,
    //             ProductVariantId = cartItem.ProductVariantId,
    //             ProductName = cartItem.Product.ProductName,  // Assume Product has Name
    //             Color = cartItem.ProductVariant?.Color,  // Assume ProductVariant has Color
    //             Size = cartItem.ProductVariant?.Size,    // Assume ProductVariant has Size
    //             Price = cartItem.Product.Price,         // Assume Product has Price
    //             Quantity = cartItem.Quantity,
    //             TotalAmount = cartItem.Product.Price * cartItem.Quantity
    //         }).ToList()
    //     };


    //     using (var con = _datacontext.CreateConnection)
    //     {
    //         con.Open();
    //         using (var tran = con.BeginTransaction())
    //         {
    //             try
    //             {
    //                 DynamicParameters param = new DynamicParameters();
    //                 if (objOrderModel.OrderId > 0) param.Add("@OrderId", objOrderModel.OrderId);
    //                 if (objOrderModel.CustomerId > 0) param.Add("@CustomerId", objOrderModel.CustomerId);
    //                 objOrderModel.OrderName = objOrderModel.OrderId + "_" + objOrderModel.OrderNumber;
    //                 if (!string.IsNullOrEmpty(objOrderModel.OrderNumber)) param.Add("@OrderNumber", objOrderModel.OrderNumber);
    //                 if (!string.IsNullOrEmpty(objOrderModel.OrderName)) param.Add("@OrderName", objOrderModel.OrderName);
    //                 param.Add("@TotalAmount", objOrderModel.TotalAmount);
    //                 param.Add("@DiscountAmount", objOrderModel.DiscountAmount);
    //                 param.Add("@GrossAmount", objOrderModel.GrossAmount);
    //                 param.Add("@ShippingAmount", objOrderModel.ShippingAmount);
    //                 param.Add("@NetAmount", objOrderModel.NetAmount);
    //                 if (!string.IsNullOrEmpty(objOrderModel.Status.ToString())) param.Add("@Status", objOrderModel.Status);
    //                 if (!string.IsNullOrEmpty(objOrderModel.PaymentStatus.ToString())) param.Add("@PaymentStatus", objOrderModel.PaymentStatus);
    //                 if (!string.IsNullOrEmpty(objOrderModel.PaymentType.ToString())) param.Add("@PaymentType", objOrderModel.PaymentType);
    //                 if (!string.IsNullOrEmpty(objOrderModel.PaymentTransactionId)) param.Add("@PaymentTransactionId", objOrderModel.PaymentTransactionId);
    //                 param.Add("@Flag", 1);
    //                 objOrderModel.OrderId = await con.ExecuteScalarAsync<int>("p_AUD_Order", param, transaction: tran);
    //                 foreach (var variant in objOrderModel.OrderItems)
    //                 {
    //                     param = new DynamicParameters();
    //                     param.Add("@OrderId", objOrderModel.OrderId);
    //                     param.Add("@ProductId", variant.ProductId);
    //                     param.Add("@ProductVariantId", variant.ProductVariantId);
    //                     if (!string.IsNullOrEmpty(variant.ProductName)) param.Add("@ProductName", variant.ProductName);
    //                     if (!string.IsNullOrEmpty(variant.Color)) param.Add("@Color", variant.Color);
    //                     if (!string.IsNullOrEmpty(variant.Size)) param.Add("@Size", variant.Size);
    //                     param.Add("@Price", variant.Price);
    //                     param.Add("@Quantity", variant.Quantity);
    //                     param.Add("@Flag", 1);
    //                     var productVariantId = await con.ExecuteScalarAsync<int>("p_AUD_OrderDetails", param, transaction: tran commandTimeout: 120);
    //                 }
    //                 if (objOrder.ShippingAddressId > 0)
    //                 {
    //                     var _shippingAddress = _shippingAddressRepository.GetShippingAddressById(objOrder.ShippingAddressId).Result;
    //                     objOrder.OrderShippingAddress = new OrderShippingAddress{
    //                         OrderId = objOrderModel.OrderId,
    //                         ShippingAddressId = _shippingAddress.ShippingAddressesId,
    //                         City = _shippingAddress.City,
    //                         Flag = 1,
    //                         FullAddress = _shippingAddress.FullAddress,
    //                         State = _shippingAddress.State
    //                     };
    //                    objOrder.OrderShippingAddress.OrderShippingAddressId = _shippingAddressRepository.AddUpdateOrderShippingAddress(objOrder.OrderShippingAddress).Result;
    //                 }
    //                 tran.Commit();
    //             }
    //             catch (Exception ex)
    //             {
    //                 tran.Rollback();
    //                 throw new Exception(ex.Message);
    //             }
    //         }
    //     }
    //     return objOrderModel;
    // }

    private void ValidatePaymentType(string paymentType, string paymentTransactionId)
    {
        // Validate if the payment type is valid
        if (!Enum.IsDefined(typeof(PaymentType), paymentType))
        {
            throw new ArgumentException("Invalid payment type.");
        }

        // For online payments, validate the transaction ID
        if (paymentType != PaymentType.COD.ToString() && string.IsNullOrWhiteSpace(paymentTransactionId))
        {
            throw new ArgumentException("Payment transaction ID is required for online payments.");
        }

        if (paymentType == PaymentType.UPI.ToString() || paymentType == PaymentType.NetBanking.ToString())
        {
            ValidatePaymentTransactionId(paymentTransactionId);
        }
    }
    private void ValidatePaymentTransactionId(string paymentTransactionId)
    {
        // Add rules to validate the payment transaction ID format
        if (paymentTransactionId.Length < 10 || paymentTransactionId.Length > 50)
        {
            throw new ArgumentException("Invalid payment transaction ID.");
        }

        // You can integrate with a payment gateway API to verify the transaction status (optional)
        // Example: CallExternalPaymentGateway(paymentTransactionId);
    }
    private void ValidateCartItems(List<Carts> cartItems)
    {
        if (cartItems == null || !cartItems.Any())
        {
            throw new ArgumentException("Cart cannot be empty");
        }

        foreach (var cartItem in cartItems)
        {
            var product = _productRepository.GetProductById(cartItem.ProductId).Result;
            if (product == null)
            {
                throw new ArgumentException($"Product with ID {cartItem.ProductId} does not exist.");
            }

            if (cartItem.Quantity <= 0)
            {
                throw new ArgumentException("Invalid quantity for product.");
            }

            // You can also validate stock availability, e.g.:
            if (product.StockQuantity < cartItem.Quantity)
            {
                throw new ArgumentException($"Insufficient stock for product {product.ProductName}.");
            }
        }
    }
    private string GenerateOrderNumber()
    {
        return Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10).ToUpper(); // Generate a unique order number
    }
}
