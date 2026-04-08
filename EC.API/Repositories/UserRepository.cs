
using EC.API.Models;
using System.Data;
using Dapper;
using EC.API.Services;

namespace EC.API.Repositories;

public interface IUserRepository
{
    Task<User> ValidateUser(string UserName, string Password);
    Task<User> GetUserByUserName(string LoginName);
    Task<User> GetUserById(int UserId);
    Task<PagedResultDto<List<User>>> GetAllUsers(string UserId, int PageIndex = 0, int PageSize = 0);
    Task<int> AddUpdateUser(User objUser);
    Task<int> DeleteUser(int UserId);
    Task<List<User>> GetUsers();
}

public class UserRepository : IUserRepository
{
    private readonly ILoggerManager _logger;
    private readonly DataContext _datacontext;
    private readonly IGridDataHelperRepository _gridDataHelperRepository;
    public UserRepository(ILoggerManager logger, DataContext context, IGridDataHelperRepository gridDataHelperRepository)
    {
        _logger = logger;
        _datacontext = context;
        _gridDataHelperRepository = gridDataHelperRepository;
    }
    public async Task<User> ValidateUser(string UserName, string Password)
    {
        string logParams = "UserName: " + UserName + "|Password: " + Password;
        _logger.LogInfo("[UserRepository]|[ValidateUser]|logParams: " + logParams);
        try
        {
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@Email", UserName);
                param.Add("@Password", Password);
                var result = await con.QueryFirstOrDefaultAsync<User>("SELECT * FROM p_get_userlogin(p_email => @Email, p_password => @Password)", param);
                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("UsersRepository->ValidateUser()->Error->", ex);
            return null;
        }
    }
    public async Task<User> GetUserByUserName(string LoginName)
    {
        string logParams = "LoginName: " + LoginName;
        _logger.LogInfo("[UserRepository]|[GetUserByUserName]|logParams: " + logParams);
        try
        {
            using (var con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                param.Add("@Email", LoginName);
                var result = await con.QueryFirstOrDefaultAsync<User>("SELECT * FROM p_get_userlogin(p_email => @Email)", param);
                if (result == null) return null;
                return result;
            }
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("UsersRepository->GetUserByUserName()->Error->", ex);
            return null;
        }
    }
    public async Task<User> GetUserById(int UserId)
    {
        User objUser = new User();
        using (var con = _datacontext.CreateConnection)
        {
            var param = new DynamicParameters();
            param.Add("@UserId", UserId);
            objUser = await con.QueryFirstOrDefaultAsync<User>("SELECT * FROM p_get_users(p_userid => @UserId)", param);
        }
        return objUser;
    }
    public async Task<List<User>> GetUsers()
    {
        List<User> lstUsers = new List<User>();
        using (var con = _datacontext.CreateConnection)
        {
            var param = new DynamicParameters();
            var _result = await con.QueryAsync<User>("SELECT * FROM p_get_users(NULL)", param);
            lstUsers = _result.ToList();
        }
        return lstUsers;
    }
    public async Task<PagedResultDto<List<User>>> GetAllUsers(string UserId, int PageIndex = 0, int PageSize = 0)
    {
        var objResp = new PagedResultDto<List<User>>();
        string logParams = "UserId:" + UserId + "|PageIndex:" + PageIndex + "|PageSize:" + PageSize;
        _logger.LogInfo("[UsersRepository]|[GetAllUsers]|logParams: " + logParams);
        List<ColumnsDetails> lstColumnDetail = new List<ColumnsDetails>();
        List<FilterDetails> lstFilterDetail = new List<FilterDetails>();
        using (var con = _datacontext.CreateConnection)
        {
            string query = "SELECT * FROM p_get_users(p_userid => @UserId, p_pageindex => @PageIndex, p_pagesize => @PageSize)";
            var param = new DynamicParameters();
            param.Add("@UserId", string.IsNullOrEmpty(UserId) ? null : (object)UserId);
            int? pageSize = PageSize > 0 ? PageSize : (int?)null;
            int? pageIndex = PageIndex > 0 ? PageIndex : (int?)null;
            param.Add("@PageSize", pageSize);
            param.Add("@PageIndex", pageIndex);
            var result = await con.QueryAsync<User>(query, param);
            if (result == null) return null;
            int count = 0;
            if (result.Count() > 0)
            {
                var elm = result.First();
                count = Convert.ToInt32(elm.TotalRowCount);
                lstColumnDetail = _gridDataHelperRepository.GetUsersColumnDetails();
                lstFilterDetail = _gridDataHelperRepository.GetUsersFilterDetails();
            }
            objResp = new PagedResultDto<List<User>>(PageIndex, PageSize, count, result.ToList(), lstColumnDetail, lstFilterDetail);
        }
        return objResp;
    }
    public async Task<int> AddUpdateUser(User objUser)
    {
        int userId = 0;
        try
        {
            string logParams = "FirstName:" + objUser.FirstName + "|LastName:" + objUser.LastName + "|Email:"
            + objUser.Email + "|PhoneNumber:" + objUser.PhoneNumber + "|RefreshToken:" + objUser.RefreshToken
            + "|RefreshTokenExpiryTime:" + objUser.RefreshTokenExpiryTime + "|Flag:" + objUser.Flag;
            _logger.LogInfo("UsersRepository:AddUpdateUser:logParams: " + logParams);
            using (IDbConnection con = _datacontext.CreateConnection)
            {
                var param = new DynamicParameters();
                int? userIdParam = objUser.UserId > 0 ? objUser.UserId : (int?)null;
                int? tenantId = objUser.TenantId > 0 ? objUser.TenantId : (int?)null;
                param.Add("@UserId", userIdParam);
                param.Add("@RoleId", objUser.RoleId > 0 ? objUser.RoleId : 0);
                param.Add("@TenantId", tenantId);
                param.Add("@FirstName", string.IsNullOrEmpty(objUser.FirstName) ? null : (object)objUser.FirstName);
                param.Add("@LastName", string.IsNullOrEmpty(objUser.LastName) ? null : (object)objUser.LastName);
                param.Add("@Email", string.IsNullOrEmpty(objUser.Email) ? null : (object)objUser.Email);
                param.Add("@Password", string.IsNullOrEmpty(objUser.Password) ? null : (object)objUser.Password);
                param.Add("@PhoneNumber", string.IsNullOrEmpty(objUser.PhoneNumber) ? null : (object)objUser.PhoneNumber);
                param.Add("@Status", string.IsNullOrEmpty(objUser.Status) ? null : (object)objUser.Status);
                param.Add("@RefreshToken", string.IsNullOrEmpty(objUser.RefreshToken) ? null : (object)objUser.RefreshToken);
                param.Add("@RefreshTokenExpiryTime", objUser.RefreshTokenExpiryTime);
                param.Add("@Flag", objUser.Flag);
                userId = await con.ExecuteScalarAsync<int>("SELECT p_aud_users(p_userid => @UserId, p_roleid => @RoleId, p_firstname => @FirstName, p_lastname => @LastName, p_email => @Email, p_password => @Password, p_phonenumber => @PhoneNumber, p_status => @Status, p_refreshtoken => @RefreshToken, p_refreshtokenexpirytime => @RefreshTokenExpiryTime, p_tenantid => @TenantId, p_flag => @Flag)", param);
            }
        }
        catch (Exception ex)
        {

        }
        return userId;
    }
    public async Task<int> DeleteUser(int UserId)
    {
        int result = 0;
        using (var con = _datacontext.CreateConnection)
        {
            var param = new DynamicParameters();
            param.Add("@UserId", UserId);
            param.Add("@Flag", 3);
            result = await con.ExecuteScalarAsync<int>("SELECT p_aud_users(p_userid => @UserId, p_roleid => NULL, p_firstname => NULL, p_lastname => NULL, p_email => NULL, p_password => NULL, p_phonenumber => NULL, p_status => NULL, p_tenantid => NULL, p_flag => @Flag)", param);
        }
        return result;
    }

}
