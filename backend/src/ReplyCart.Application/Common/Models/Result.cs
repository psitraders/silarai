namespace ReplyCart.Application.Common.Models;

public class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }
    public IEnumerable<string> Errors { get; }

    private Result(T value)
    {
        IsSuccess = true;
        Value = value;
        Errors = [];
    }

    private Result(string error)
    {
        IsSuccess = false;
        Error = error;
        Errors = [error];
    }

    private Result(IEnumerable<string> errors)
    {
        IsSuccess = false;
        Errors = errors;
        Error = string.Join("; ", errors);
    }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
    public static Result<T> Failure(IEnumerable<string> errors) => new(errors);
}

public class Result
{
    public bool IsSuccess { get; }
    public string? Error { get; }
    public IEnumerable<string> Errors { get; }

    private Result(bool success, string? error = null)
    {
        IsSuccess = success;
        Error = error;
        Errors = error != null ? [error] : [];
    }

    public static Result Success() => new(true);
    public static Result Failure(string error) => new(false, error);
}
