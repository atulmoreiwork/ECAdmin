using System.Net;
using EC.API.Models;
using EC.API.Repositories;
using EC.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EC.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CustomerController : ControllerBase
{
    private readonly ILoggerManager _logger;
    private readonly ICustomerRepository _customerRepository;
    public CustomerController(ILoggerManager logger, ICustomerRepository customerRepository)
    {
        _logger = logger;
        _customerRepository = customerRepository;
    }

    [HttpGet("Get"), Authorize]
    public IEnumerable<string> Get()
    {
        return new string[] { "John Doe", "Jane Doe" };
    }

    [HttpGet("GetCustomers")]
    public async Task<APIResponse<List<Customer>>> GetCustomers()
    {
        List<Customer> lstCustomer = new List<Customer>();
        try
        {
            lstCustomer = await _customerRepository.GetCustomers();
            return new APIResponse<List<Customer>>(lstCustomer, "Customers retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Customer => GetCustomers =>", ex);
            return new APIResponse<List<Customer>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("GetAllCustomers")]
    public async Task<APIResponse<PagedResultDto<List<Customer>>>> GetAllCustomers([FromBody] GridFilter objFilter)
    {
        try
        {
            string CustomerId = string.Empty;
            if (objFilter == null)
            {
                ModelState.AddModelError("GridFilter", "Grid Filter object are null");
                return new APIResponse<PagedResultDto<List<Customer>>>(HttpStatusCode.BadRequest, "Grid filter object is null", ModelState.AllErrors(), true);
            }
            if (objFilter != null && objFilter.Filter != null && objFilter.Filter.Count > 0)
            {
                var _filter = objFilter.Filter.Find(x => x.ColId.ToLower() == "customerid");
                if (_filter != null && !string.IsNullOrEmpty(_filter.Value)) { CustomerId = _filter.Value; }
            }
            var lstCustomer = await _customerRepository.GetAllCustomers(CustomerId, objFilter.PageNumber, objFilter.PageSize);
            return new APIResponse<PagedResultDto<List<Customer>>>(lstCustomer, "Customers retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Customer => GetAllCustomers =>", ex);
            return new APIResponse<PagedResultDto<List<Customer>>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("GetCustomerById")]
    public async Task<APIResponse<Customer>> GetCustomerById(int CustomerId)
    {
        Customer objCustomer = new Customer();
        try
        {
            if (CustomerId == 0)
            {
                ModelState.AddModelError("CustomerId", "Please provide CustomerId");
                return new APIResponse<Customer>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            objCustomer = await _customerRepository.GetCustomerById(CustomerId);
            return new APIResponse<Customer>(objCustomer, "Customer retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Customer => GetCustomerById =>", ex);
            return new APIResponse<Customer>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("AddUpdateCustomer")]
    public async Task<APIResponse<int>> AddUpdateCustomer([FromBody] Customer objCustomer)
    {
        int result = 0;
        try
        {
            if (!ModelState.IsValid)
            {
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            if (objCustomer.CustomerId <= 0) { objCustomer.Flag = 1; }
            else { objCustomer.Flag = 2; }
            if (objCustomer.TenantId > 0) objCustomer.TenantId = objCustomer.TenantId;
            result = await _customerRepository.AddUpdateCustomer(objCustomer);
            return new APIResponse<int>(result, "Customer created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("Customer => AddCustomer =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("DeleteCustomerById")]
    public async Task<APIResponse<int>> DeleteCustomerById(int CustomerId)
    {
        _logger.LogInfo("[CustomerController]|[DeleteCustomerById]|[Start] => DeleteCustomerById => CustomerId: " + CustomerId);
        if (CustomerId <= 0)
        {
            ModelState.AddModelError("CustomerId", "Please enter CustomerId");
            return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _customerRepository.DeleteCustomer(CustomerId);
        string successMessage = "Customer deleted successfully";
        return new APIResponse<int>(result, successMessage);
    }
}
