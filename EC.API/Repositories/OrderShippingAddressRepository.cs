using System.Data;
using Dapper;
using EC.API.Models;
using EC.API.Services;
namespace EC.API.Repositories;

public interface IOrderShippingAddressRepository
{
    Task<OrderShippingAddress> GetOrderShippingAddress(int orderId);
    Task<int> AddUpdateShippingAddress(OrderShippingAddress objOrderShippingAddress);
}

public class OrderShippingAddressRepository : IOrderShippingAddressRepository
{
    private readonly DataContext _datacontext;
    private readonly ILoggerManager _logger;
    public OrderShippingAddressRepository(DataContext context, ILoggerManager logger)
    {
        _datacontext = context;
        _logger = logger;
    }
    public async Task<OrderShippingAddress> GetOrderShippingAddress(int orderId)
    {
        try
        {
            OrderShippingAddress objOrderShippingAddress = new OrderShippingAddress();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@OrderId", orderId);
                objOrderShippingAddress = await con.QueryFirstOrDefaultAsync<OrderShippingAddress>("Select * from p_get_ordershippingaddressbyorderid(p_orderid => @OrderId)", param);
            }
            return objOrderShippingAddress;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderShippingAddressRepository => GetOrderShippingAddress =>", ex);
            throw;
        }
    }

    public async Task<int> AddUpdateShippingAddress(OrderShippingAddress objOrderShippingAddress)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                if (objOrderShippingAddress.OrderShippingAddressId <= 0) { objOrderShippingAddress.Flag = 1; }
                else { objOrderShippingAddress.Flag = 2; }
                int? orderShippingAddressId = objOrderShippingAddress.OrderShippingAddressId > 0 ? objOrderShippingAddress.OrderShippingAddressId : (int?)null;
                int? orderId = objOrderShippingAddress.OrderId > 0 ? objOrderShippingAddress.OrderId : (int?)null;
                param.Add("@OrderShippingAddressId", orderShippingAddressId);
                param.Add("@OrderId", orderId);
                param.Add("@Address", string.IsNullOrEmpty(objOrderShippingAddress.Address) ? null : (object)objOrderShippingAddress.Address);
                param.Add("@State", string.IsNullOrEmpty(objOrderShippingAddress.State) ? null : (object)objOrderShippingAddress.State);
                param.Add("@City", string.IsNullOrEmpty(objOrderShippingAddress.City) ? null : (object)objOrderShippingAddress.City);
                param.Add("@PostalCode", string.IsNullOrEmpty(objOrderShippingAddress.PostalCode) ? null : (object)objOrderShippingAddress.PostalCode);
                param.Add("@Country", string.IsNullOrEmpty(objOrderShippingAddress.Country) ? null : (object)objOrderShippingAddress.Country);
                param.Add("@Flag", objOrderShippingAddress.Flag);
                result = await con.ExecuteScalarAsync<int>("SELECT p_aud_ordershippingaddress(p_ordershippingaddressid => @OrderShippingAddressId::bigint, p_orderid => @OrderId::bigint, p_address => @Address::text, p_state => @State::character varying, p_city => @City::character varying, p_postalcode => @PostalCode::character varying, p_country => @Country::character varying, p_flag => @Flag::integer)", param);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("OrderShippingAddressRepository => AddUpdateShippingAddress =>", ex);
            throw;
        }
    }
}
