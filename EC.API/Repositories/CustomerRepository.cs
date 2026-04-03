using System.Data;
using Dapper;
using EC.API.Models;
using EC.API.Services;

namespace EC.API.Repositories;

public interface ICustomerRepository
{
    Task<List<Customer>> GetCustomers();
    Task<PagedResultDto<List<Customer>>> GetAllCustomers(string CustomerId, int PageIndex = 0, int PageSize = 0);
    Task<Customer> GetCustomerById(int CustomerId);
    Task<int> AddUpdateCustomer(Customer objCustomer);
    Task<int> DeleteCustomer(int CustomerId);
}

public class CustomerRepository : ICustomerRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    public CustomerRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }

    public async Task<List<Customer>> GetCustomers()
    {
        try
        {
            List<Customer> lstCustomers = new List<Customer>();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                var _result = await con.QueryAsync<Customer>("SELECT * FROM p_get_customers()", param);
                lstCustomers = _result.ToList();
            }
            return lstCustomers;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CustomerRepository => GetCustomers =>", ex);
            throw;
        }
    }
    public async Task<PagedResultDto<List<Customer>>> GetAllCustomers(string CustomerId, int PageIndex = 0, int PageSize = 0)
    {
        try
        {
            var objResp = new PagedResultDto<List<Customer>>();
            List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
            List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
            using (var con = _datacontext.CreateConnection)
            {
                string query = "SELECT * FROM p_get_customers(p_customerid=> @CustomerId, p_pagesize=> @PageSize, p_pageindex=> @PageIndex)";
                var param = new DynamicParameters();
                int? customerIdParam = string.IsNullOrEmpty(CustomerId) ? null : int.Parse(CustomerId);
                param.Add("@CustomerId", customerIdParam);
                int? pageSize = PageSize > 0 ? PageSize : (int?)null;
                int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
                param.Add("@PageSize", pageSize);
                param.Add("@PageIndex", pageIndex);
                var result = await con.QueryAsync<Customer>(query, param);
                if (result == null) return null;
                int count = 0;
                if (result.Count() > 0)
                {
                    var elm = result.First();
                    count = Convert.ToInt32(elm.TotalRowCount);
                    lstColumnDetail = _gridDataHelperRepository.GetCustomersColumnDetails();
                    lstFilterDetail = _gridDataHelperRepository.GetCategoriesFilterDetails();
                }
                objResp = new PagedResultDto<List<Customer>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
            }
            return objResp;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CustomerRepository => GetAllCustomers =>", ex);
            throw;
        }
    }
    public async Task<Customer> GetCustomerById(int CustomerId)
    {
        try
        {
            Customer objCustomer = new Customer();
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@CustomerId", CustomerId);
                objCustomer = await con.QueryFirstOrDefaultAsync<Customer>("SELECT * FROM p_get_customers(p_customerid=>@CustomerId)", param);
            }
            return objCustomer;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CustomerRepository => GetCustomerById =>", ex);
            throw;
        }
    }
    public async Task<int> AddUpdateCustomer(Customer objCustomer)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@CustomerId", (long?)objCustomer.CustomerId);
                param.Add("@FirstName", string.IsNullOrEmpty(objCustomer.FirstName) ? null : (object)objCustomer.FirstName);
                param.Add("@LastName", string.IsNullOrEmpty(objCustomer.LastName) ? null : (object)objCustomer.LastName);
                param.Add("@Status", string.IsNullOrEmpty(objCustomer.Status) ? null : (object)objCustomer.Status);
                param.Add("@Address", string.IsNullOrEmpty(objCustomer.Address) ? null : (object)objCustomer.Address);
                param.Add("@City", string.IsNullOrEmpty(objCustomer.City) ? null : (object)objCustomer.City);
                param.Add("@PostalCode", string.IsNullOrEmpty(objCustomer.PostalCode) ? null : (object)objCustomer.PostalCode);
                param.Add("@State", string.IsNullOrEmpty(objCustomer.State) ? null : (object)objCustomer.State);
                param.Add("@Country", string.IsNullOrEmpty(objCustomer.Country) ? null : (object)objCustomer.Country);
                param.Add("@PhoneNumber", string.IsNullOrEmpty(objCustomer.PhoneNumber) ? null : (object)objCustomer.PhoneNumber);
                param.Add("@Email", string.IsNullOrEmpty(objCustomer.Email) ? null : (object)objCustomer.Email);
                param.Add("@Password", string.IsNullOrEmpty(objCustomer.Password) ? null : (object)objCustomer.Password);
                param.Add("@RefreshToken", (string)null);
                param.Add("@RefreshTokenExpiryTime", (DateTime?)null);
                param.Add("@TenantId", (long?)objCustomer.TenantId);
                param.Add("@Flag", objCustomer.Flag);
                result = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_customer(
                        p_customerid => @CustomerId::bigint,
                        p_firstname => @FirstName::character varying,
                        p_lastname => @LastName::character varying,
                        p_status => @Status::character varying,
                        p_address => @Address::text,
                        p_city => @City::character varying,
                        p_postalcode => @PostalCode::character varying,
                        p_state => @State::character varying,
                        p_country => @Country::character varying,
                        p_phonenumber => @PhoneNumber::character varying,
                        p_email => @Email::character varying,
                        p_password => @Password::text,
                        p_refreshtoken => @RefreshToken::text,
                        p_refreshtokenexpirytime => @RefreshTokenExpiryTime::timestamp without time zone,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CustomerRepository => AddUpdateCustomer =>", ex);
            throw;
        }
    }
    public async Task<int> DeleteCustomer(int CustomerId)
    {
        try
        {
            int result = 0;
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@CustomerId", (long?)CustomerId);
                param.Add("@Status", "inactive");
                param.Add("@RefreshToken", (string)null);
                param.Add("@RefreshTokenExpiryTime", (DateTime?)null);
                param.Add("@TenantId", (long?)null);
                param.Add("@Flag", 3);
                result = await con.ExecuteScalarAsync<int>(
                    @"SELECT p_aud_customer(
                        p_customerid => @CustomerId::bigint,
                        p_firstname => NULL::character varying,
                        p_lastname => NULL::character varying,
                        p_status => @Status::character varying,
                        p_address => NULL::text,
                        p_city => NULL::character varying,
                        p_postalcode => NULL::character varying,
                        p_state => NULL::character varying,
                        p_country => NULL::character varying,
                        p_phonenumber => NULL::character varying,
                        p_email => NULL::character varying,
                        p_password => NULL::text,
                        p_refreshtoken => @RefreshToken::text,
                        p_refreshtokenexpirytime => @RefreshTokenExpiryTime::timestamp without time zone,
                        p_tenantid => @TenantId::bigint,
                        p_flag => @Flag::integer
                    )", param);
            }
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("CustomerRepository => DeleteCustomer =>", ex);
            throw;
        }
    }
}
