namespace ReplyCart.Shared.Constants;

public static class ApiRoutes
{
    private const string Base = "api/v1";

    public static class Auth
    {
        public const string Register = $"{Base}/auth/register";
        public const string Login = $"{Base}/auth/login";
        public const string Refresh = $"{Base}/auth/refresh";
        public const string Logout = $"{Base}/auth/logout";
        public const string Me = $"{Base}/auth/me";
    }

    public static class Business
    {
        public const string Root = $"{Base}/business";
        public const string Storefront = $"{Base}/business/storefront";
        public const string SocialLinks = $"{Base}/business/social-links";
    }

    public static class Products
    {
        public const string Root = $"{Base}/products";
        public const string ById = $"{Base}/products/{{id}}";
    }

    public static class Public
    {
        public const string Storefront = $"{Base}/public/{{slug}}";
        public const string Products = $"{Base}/public/{{slug}}/products";
        public const string Inquiry = $"{Base}/public/{{slug}}/inquiry";
    }
}
