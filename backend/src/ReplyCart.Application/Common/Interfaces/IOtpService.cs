namespace ReplyCart.Application.Common.Interfaces;

public interface IOtpService
{
    /// <summary>
    /// Sends an OTP to the given phone number.
    /// Returns true if sent successfully.
    /// </summary>
    Task<bool> SendOtpAsync(string phone, CancellationToken ct = default);

    /// <summary>
    /// Verifies the OTP entered by the user for the given phone number.
    /// Returns true if the OTP is correct and not expired.
    /// </summary>
    Task<bool> VerifyOtpAsync(string phone, string otp, CancellationToken ct = default);
}


