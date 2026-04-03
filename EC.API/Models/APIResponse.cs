
using System.Net;

namespace EC.API.Models;
public class APIResponse<T>
{
    public bool Success { get; set; }
    public bool IsValidationError { get; set; }
    public HttpStatusCode StatusCode { get; set; }
    public string Message { get; set; }
    public T Result { get; set; }

    #pragma warning disable CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.
    public object? Error { get; set; }
    #pragma warning restore CS8632 // The annotation for nullable reference types should only be used in code within a '#nullable' annotations context.

    // Constructor for a Successful Response
    public APIResponse(T data, string message = "", HttpStatusCode statusCode = HttpStatusCode.OK)
    {
        Success = true;
        IsValidationError= false;
        StatusCode = statusCode;
        Message = message;
        Result = data;
        Error = null;
    }

    // Constructor for a error Response
    public APIResponse(HttpStatusCode statusCode, string message, object error = null, bool isValidationError= false)
    {
        Success = false;
        IsValidationError= isValidationError;
        StatusCode = statusCode;
        Message = message;
        Result = default(T);
        Error = error;
    }
}
