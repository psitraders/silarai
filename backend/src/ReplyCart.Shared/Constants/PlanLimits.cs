namespace ReplyCart.Shared.Constants;

public static class PlanLimits
{
    public static class Free
    {
        public const int MaxProducts = 10;
        public const int MaxStaffUsers = 1;
        public const int MaxMonthlyLeads = 50;
        public const int MaxAiSuggestionsPerMonth = 0;
    }

    public static class Starter
    {
        public const int MaxProducts = 50;
        public const int MaxStaffUsers = 2;
        public const int MaxMonthlyLeads = 200;
        public const int MaxAiSuggestionsPerMonth = 0;
    }

    public static class Growth
    {
        public const int MaxProducts = 200;
        public const int MaxStaffUsers = 5;
        public const int MaxMonthlyLeads = 1000;
        public const int MaxAiSuggestionsPerMonth = 100;
    }

    public static class Pro
    {
        public const int MaxProducts = int.MaxValue;
        public const int MaxStaffUsers = 20;
        public const int MaxMonthlyLeads = int.MaxValue;
        public const int MaxAiSuggestionsPerMonth = int.MaxValue;
    }
}
