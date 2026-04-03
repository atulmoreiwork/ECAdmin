using System.Net;
using Microsoft.AspNetCore.Mvc;
using EC.API.Repositories;
using Microsoft.AspNetCore.Authorization;
using EC.API.Models;
using EC.API.Services;
using System.Text.RegularExpressions;
using OfficeOpenXml;
namespace EC.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class UsersController : ControllerBase
{
    private readonly ILoggerManager _logger;
    private readonly IUserRepository _usersRepository;
    private readonly IRoleRepository _roleRepository;
    public UsersController(IUserRepository userrepository, ILoggerManager logger, IRoleRepository roleRepository)
    {
        _logger = logger;
        _usersRepository = userrepository;
        _roleRepository = roleRepository;
    }

    [HttpGet("GetUsers")]
    public async Task<APIResponse<List<User>>> GetUsers()
    {
        List<User> lstUser = new List<User>();
        try
        {
            lstUser = await _usersRepository.GetUsers();
            return new APIResponse<List<User>>(lstUser, "Users retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("UsersController => GetCustomers =>", ex);
            return new APIResponse<List<User>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpPost("GetAllUsers")]
    public async Task<APIResponse<PagedResultDto<List<User>>>> GetAllUsers([FromBody] GridFilter objFilter)
    {
        try
        {
            _logger.LogInfo("[UsersController]|[GetAllUsers]|[Start] => Get All users records.");
            string UserId = string.Empty;
            if (objFilter == null)
            {
                ModelState.AddModelError("GridFilter", "Grid Filter object are null");
                return new APIResponse<PagedResultDto<List<User>>>(HttpStatusCode.BadRequest, "Grid filter object is null", ModelState.AllErrors(), true);
            }
            if (objFilter != null && objFilter.Filter != null && objFilter.Filter.Count > 0)
            {
                var _filter = objFilter.Filter.Find(x => x.ColId.ToLower() == "userid");
                if (_filter != null && !string.IsNullOrEmpty(_filter.Value)) { UserId = _filter.Value; }
            }
            var lstUser = await _usersRepository.GetAllUsers(UserId, objFilter.PageNumber, objFilter.PageSize);
            return new APIResponse<PagedResultDto<List<User>>>(lstUser, "Users retrived successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("UsersController => GetAllUsers =>", ex);
            return new APIResponse<PagedResultDto<List<User>>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("GetUserById")]
    public async Task<APIResponse<User>> GetUserById(int UserId)
    {
        _logger.LogInfo("[UsersController]|[GetUserById]|[Start] => Get user by id.");
        if (UserId == 0)
        {
            ModelState.AddModelError("UserId", "Please provide userid");
            return new APIResponse<User>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _usersRepository.GetUserById(UserId);
        return new APIResponse<User>(result, "User retrived successfully.");
    }

    [HttpPost("AddUpdateUser")]
    public async Task<APIResponse<int>> AddUpdateUser([FromBody] User objModel)
    {
        int result = 0;
        try
        {
            if (!ModelState.IsValid)
            {
                return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
            }
            if (objModel.UserId <= 0) { objModel.Flag = 1; }
            else { objModel.Flag = 2; }
            result = await _usersRepository.AddUpdateUser(objModel);
            return new APIResponse<int>(result, "User created successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogLocationWithException("UsersController => AddUser =>", ex);
            return new APIResponse<int>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
        }
    }

    [HttpGet("DeleteUserById")]
    public async Task<APIResponse<int>> DeleteUserById(int UserId)
    {
        _logger.LogInfo("[UsersController]|[DeleteUserById]|[Start] => DeleteUserById => UserId: " + UserId);
        if (UserId <= 0)
        {
            ModelState.AddModelError("UserId", "Please enter UserId");
            return new APIResponse<int>(HttpStatusCode.BadRequest, "Validation Error", ModelState.AllErrors(), true);
        }
        var result = await _usersRepository.DeleteUser(UserId);
        string successMessage = "User deleted successfully";
        return new APIResponse<int>(result, successMessage);
    }


    [HttpPost("Upload")]
    public async Task<IActionResult> UploadExcel(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded.");

        var allowedExtensions = new[] { ".xlsx", ".xls" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            return BadRequest("Invalid file type. Please upload an Excel file (.xlsx or .xls).");

        var allowedMimeTypes = new[]
        {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        };

        if (!allowedMimeTypes.Contains(file.ContentType))
            return BadRequest($"Invalid MIME type: {file.ContentType}. Only Excel files are allowed.");

        if (file.Length > 10 * 1024 * 1024)
            return BadRequest("File too large. Maximum allowed size is 10 MB.");

        using var stream = new MemoryStream();
        await file.CopyToAsync(stream);
        stream.Position = 0;

        using var package = new ExcelPackage(stream);

        if (package.Workbook.Worksheets.Count == 0)
            return BadRequest("The uploaded Excel file is empty or invalid.");

        var worksheet = package.Workbook.Worksheets[0];
        int rowCount = worksheet.Dimension.Rows;

        var validRoles = await _roleRepository.GetRoleNamesAsync();
        var users = new List<UserImportDto>();

        for (int row = 2; row <= rowCount; row++)
        {
            var user = new UserImportDto
            {
                FirstName = worksheet.Cells[row, 1].Text?.Trim(),
                LastName = worksheet.Cells[row, 2].Text?.Trim(),
                Email = worksheet.Cells[row, 3].Text?.Trim(),
                Password = worksheet.Cells[row, 4].Text?.Trim(),
                PhoneNumber = worksheet.Cells[row, 5].Text?.Trim(),
                Role = worksheet.Cells[row, 6].Text?.Trim(),
            };

            var errors = ValidateRow(user, validRoles);

            if (errors.Any())
            {
                user.IsError = true;
                user.ErrorMessage = string.Join(", ", errors);
            }

            users.Add(user);
        }

        // ✅ Save valid users
        var validUsers = users.Where(u => !u.IsError).ToList();
        foreach (var validUser in validUsers)
        {
            var role = await _roleRepository.GetRoleByName(validUser.Role);
            var userEntity = new User
            {
                FirstName = validUser.FirstName ?? string.Empty,
                LastName = validUser.LastName ?? string.Empty,
                Email = validUser.Email ?? string.Empty,
                Password = validUser.Password ?? string.Empty,
                PhoneNumber = validUser.PhoneNumber ?? string.Empty,
                RoleId = role.RoleId,
                TenantId = role.TenantId,
                Status = "active",
                Flag = 1
            };
            await _usersRepository.AddUpdateUser(userEntity);
        }

        // ✅ Return annotated Excel file with validation results
        var annotatedFile = GenerateAnnotatedExcel(users);
        return File(annotatedFile, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Validated_Import.xlsx");
    }


    private List<string> ValidateRow(UserImportDto user, List<string> validRoles)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(user.FirstName))
            errors.Add("FirstName required");
        if (string.IsNullOrWhiteSpace(user.LastName))
            errors.Add("LastName required");

        if (string.IsNullOrWhiteSpace(user.Email))
            errors.Add("Email required");
        else if (!Regex.IsMatch(user.Email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
            errors.Add("Email invalid");

        if (string.IsNullOrWhiteSpace(user.Password))
            errors.Add("Password required");

        if (string.IsNullOrWhiteSpace(user.PhoneNumber))
            errors.Add("PhoneNumber required");
        else if (!Regex.IsMatch(user.PhoneNumber, @"^[0-9]{10}$"))
            errors.Add("PhoneNumber invalid");

        if (string.IsNullOrWhiteSpace(user.Role))
            errors.Add("Role required");
        else if (!validRoles.Contains(user.Role, StringComparer.OrdinalIgnoreCase))
            errors.Add("Role not found");

        return errors;
    }

    private byte[] GenerateAnnotatedExcel(List<UserImportDto> users)
    {
        using var package = new ExcelPackage();
        var ws = package.Workbook.Worksheets.Add("Validated Data");

        // Header Row
        ws.Cells[1, 1].Value = "FirstName";
        ws.Cells[1, 2].Value = "LastName";
        ws.Cells[1, 3].Value = "Email";
        ws.Cells[1, 4].Value = "Password";
        ws.Cells[1, 5].Value = "PhoneNumber";
        ws.Cells[1, 6].Value = "Role";
        ws.Cells[1, 7].Value = "IsError";
        ws.Cells[1, 8].Value = "ErrorMessage";

        int row = 2;
        foreach (var u in users)
        {
            ws.Cells[row, 1].Value = u.FirstName;
            ws.Cells[row, 2].Value = u.LastName;
            ws.Cells[row, 3].Value = u.Email;
            ws.Cells[row, 4].Value = u.Password;
            ws.Cells[row, 5].Value = u.PhoneNumber;
            ws.Cells[row, 6].Value = u.Role;
            ws.Cells[row, 7].Value = u.IsError;
            ws.Cells[row, 8].Value = u.ErrorMessage;

            // Highlight error rows
            if (u.IsError)
            {
                using (var range = ws.Cells[row, 1, row, 8])
                {
                    range.Style.Fill.PatternType = OfficeOpenXml.Style.ExcelFillStyle.Solid;
                    range.Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightPink);
                }
            }

            row++;
        }

        ws.Cells[ws.Dimension.Address].AutoFitColumns();
        return package.GetAsByteArray();
    }
}
