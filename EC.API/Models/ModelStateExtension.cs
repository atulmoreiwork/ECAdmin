using Microsoft.AspNetCore.Mvc.ModelBinding;
public static class ModelStateExtension
{
    public static IEnumerable<ValidationError> AllErrors(this ModelStateDictionary modelState)
    {
        return modelState.Keys.SelectMany(key => modelState[key].Errors.Select(x => new ValidationError(key, x.ErrorMessage))).ToList();
    }
}
public class ValidationError
{
    public string Name { get; }
    public string Reason { get; }
    public ValidationError(string name, string reason)
    {
        Name = name != string.Empty ? name : null;
        Reason = reason;
    }
}