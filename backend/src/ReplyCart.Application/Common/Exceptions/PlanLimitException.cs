namespace ReplyCart.Application.Common.Exceptions;

public class PlanLimitException : Exception
{
    public PlanLimitException(string feature)
        : base($"Your current plan does not allow: {feature}. Please upgrade to continue.") { }
}


