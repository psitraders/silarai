IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [AiSuggestions] (
        [Id] uniqueidentifier NOT NULL,
        [LeadId] uniqueidentifier NULL,
        [Prompt] nvarchar(max) NOT NULL,
        [SuggestedReply] nvarchar(max) NOT NULL,
        [ToneMode] nvarchar(max) NOT NULL,
        [Provider] nvarchar(max) NOT NULL,
        [Channel] nvarchar(max) NULL,
        [WasUsed] bit NOT NULL,
        [WasEdited] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_AiSuggestions] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [AiUsageLogs] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [RequestType] nvarchar(max) NOT NULL,
        [TokensUsed] int NOT NULL,
        [Provider] nvarchar(max) NOT NULL,
        [WasSuccessful] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_AiUsageLogs] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Businesses] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [LogoUrl] nvarchar(max) NULL,
        [BannerUrl] nvarchar(max) NULL,
        [WhatsAppNumber] nvarchar(max) NULL,
        [InstagramHandle] nvarchar(max) NULL,
        [FacebookPageUrl] nvarchar(max) NULL,
        [DeliveryInfo] nvarchar(max) NULL,
        [Currency] nvarchar(max) NOT NULL,
        [BusinessHours] nvarchar(max) NULL,
        [WelcomeText] nvarchar(max) NULL,
        [IsOnboardingComplete] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Businesses] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [ImageUrl] nvarchar(max) NULL,
        [SortOrder] int NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Customers] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [PhoneNumber] nvarchar(max) NOT NULL,
        [Email] nvarchar(max) NULL,
        [PreferredChannel] int NOT NULL,
        [Address] nvarchar(max) NULL,
        [City] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [Tags] nvarchar(max) NULL,
        [LastOrderDate] datetime2 NULL,
        [TotalOrders] int NOT NULL,
        [TotalSpend] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Leads] (
        [Id] uniqueidentifier NOT NULL,
        [CustomerName] nvarchar(200) NOT NULL,
        [CustomerPhone] nvarchar(20) NULL,
        [CustomerEmail] nvarchar(300) NULL,
        [SourceChannel] int NOT NULL,
        [InterestedProductId] uniqueidentifier NULL,
        [InquiryNote] nvarchar(max) NULL,
        [Status] int NOT NULL,
        [AssignedUserId] uniqueidentifier NULL,
        [FollowUpDate] datetime2 NULL,
        [Tags] nvarchar(max) NULL,
        [Priority] int NOT NULL,
        [CustomerId] uniqueidentifier NULL,
        [LastActivityDate] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Leads] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] uniqueidentifier NOT NULL,
        [OrderNumber] nvarchar(50) NOT NULL,
        [CustomerId] uniqueidentifier NULL,
        [SourceLeadId] uniqueidentifier NULL,
        [Status] int NOT NULL,
        [PaymentStatus] int NOT NULL,
        [SourceChannel] int NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [DiscountAmount] decimal(18,2) NULL,
        [Notes] nvarchar(max) NULL,
        [AssignedUserId] uniqueidentifier NULL,
        [CustomerName] nvarchar(200) NULL,
        [CustomerPhone] nvarchar(20) NULL,
        [DeliveryAddress] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [ReplyTemplates] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [ToneMode] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_ReplyTemplates] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Roles] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [SubscriptionPlans] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [MonthlyPrice] decimal(18,2) NOT NULL,
        [AnnualPrice] decimal(18,2) NOT NULL,
        [MaxProducts] int NOT NULL,
        [MaxStaffUsers] int NOT NULL,
        [MaxMonthlyLeads] int NOT NULL,
        [MaxAiSuggestionsPerMonth] int NOT NULL,
        [AllowsCustomBranding] bit NOT NULL,
        [AllowsAdvancedAnalytics] bit NOT NULL,
        [AllowsAiSuggestions] bit NOT NULL,
        [IsActive] bit NOT NULL,
        [SortOrder] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_SubscriptionPlans] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [SystemAnnouncements] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(max) NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [ExpiresAt] datetime2 NULL,
        [TargetPlan] nvarchar(max) NULL,
        [AnnouncementType] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_SystemAnnouncements] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [TenantNotes] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [AuthorId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_TenantNotes] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Tenants] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Slug] nvarchar(100) NOT NULL,
        [ContactEmail] nvarchar(300) NOT NULL,
        [ContactPhone] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [IsEmailVerified] bit NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Tenants] PRIMARY KEY ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [SocialLinks] (
        [Id] uniqueidentifier NOT NULL,
        [BusinessId] uniqueidentifier NOT NULL,
        [Platform] int NOT NULL,
        [Url] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_SocialLinks] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_SocialLinks_Businesses_BusinessId] FOREIGN KEY ([BusinessId]) REFERENCES [Businesses] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [StorefrontSettings] (
        [Id] uniqueidentifier NOT NULL,
        [BusinessId] uniqueidentifier NOT NULL,
        [Slug] nvarchar(max) NOT NULL,
        [ThemeColor] nvarchar(max) NOT NULL,
        [SeoTitle] nvarchar(max) NULL,
        [SeoDescription] nvarchar(max) NULL,
        [WhatsAppCtaLabel] nvarchar(max) NOT NULL,
        [InstagramCtaLabel] nvarchar(max) NOT NULL,
        [FacebookCtaLabel] nvarchar(max) NOT NULL,
        [ShowOutOfStockProducts] bit NOT NULL,
        [AllowPublicInquiries] bit NOT NULL,
        [CustomCss] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_StorefrontSettings] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_StorefrontSettings_Businesses_BusinessId] FOREIGN KEY ([BusinessId]) REFERENCES [Businesses] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(300) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Sku] nvarchar(100) NULL,
        [CategoryId] uniqueidentifier NULL,
        [BasePrice] decimal(18,2) NOT NULL,
        [DiscountedPrice] decimal(18,2) NULL,
        [Status] int NOT NULL,
        [IsFeatured] bit NOT NULL,
        [StockQuantity] int NULL,
        [SortOrder] int NOT NULL,
        [Attributes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id])
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [LeadActivities] (
        [Id] uniqueidentifier NOT NULL,
        [LeadId] uniqueidentifier NOT NULL,
        [ActivityType] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [PerformedBy] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_LeadActivities] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LeadActivities_Leads_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [Leads] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [LeadNotes] (
        [Id] uniqueidentifier NOT NULL,
        [LeadId] uniqueidentifier NOT NULL,
        [Content] nvarchar(max) NOT NULL,
        [AuthorId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_LeadNotes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_LeadNotes_Leads_LeadId] FOREIGN KEY ([LeadId]) REFERENCES [Leads] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [ProductTitle] nvarchar(max) NOT NULL,
        [VariantInfo] nvarchar(max) NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [TotalPrice] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [OrderStatusHistories] (
        [Id] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [FromStatus] int NOT NULL,
        [ToStatus] int NOT NULL,
        [Note] nvarchar(max) NULL,
        [ChangedBy] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_OrderStatusHistories] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderStatusHistories_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Payments] (
        [Id] uniqueidentifier NOT NULL,
        [OrderId] uniqueidentifier NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Method] nvarchar(max) NOT NULL,
        [ReferenceNumber] nvarchar(max) NULL,
        [PaidAt] datetime2 NOT NULL,
        [Notes] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [TenantSubscriptions] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [PlanId] uniqueidentifier NOT NULL,
        [Status] int NOT NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NULL,
        [IsAnnual] bit NOT NULL,
        [PricePaid] decimal(18,2) NOT NULL,
        [ExternalPaymentId] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_TenantSubscriptions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TenantSubscriptions_SubscriptionPlans_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [SubscriptionPlans] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_TenantSubscriptions_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] uniqueidentifier NOT NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [Name] nvarchar(200) NOT NULL,
        [Email] nvarchar(300) NOT NULL,
        [PasswordHash] nvarchar(500) NOT NULL,
        [Phone] nvarchar(20) NULL,
        [AvatarUrl] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [IsEmailVerified] bit NOT NULL,
        [LastLoginAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Users_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [ProductImages] (
        [Id] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [Url] nvarchar(max) NOT NULL,
        [AltText] nvarchar(max) NULL,
        [SortOrder] int NOT NULL,
        [IsPrimary] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_ProductImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductImages_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [ProductTags] (
        [Id] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [Tag] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_ProductTags] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductTags_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [ProductVariants] (
        [Id] uniqueidentifier NOT NULL,
        [ProductId] uniqueidentifier NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Value] nvarchar(max) NOT NULL,
        [PriceAdjustment] decimal(18,2) NULL,
        [StockQuantity] int NULL,
        [IsAvailable] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        [TenantId] uniqueidentifier NOT NULL,
        [IsDeleted] bit NOT NULL,
        [DeletedAt] datetime2 NULL,
        [DeletedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_ProductVariants] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductVariants_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [UserRefreshTokens] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [TokenHash] nvarchar(max) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [IsRevoked] bit NOT NULL,
        [RevokedReason] nvarchar(max) NULL,
        [DeviceInfo] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_UserRefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserRefreshTokens_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE TABLE [UserRoles] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [RoleId] uniqueidentifier NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedBy] uniqueidentifier NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedBy] uniqueidentifier NULL,
        CONSTRAINT [PK_UserRoles] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_UserRoles_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_UserRoles_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_LeadActivities_LeadId] ON [LeadActivities] ([LeadId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_LeadNotes_LeadId] ON [LeadNotes] ([LeadId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Leads_TenantId_FollowUpDate] ON [Leads] ([TenantId], [FollowUpDate]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Leads_TenantId_Status_AssignedUserId] ON [Leads] ([TenantId], [Status], [AssignedUserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_OrderNumber] ON [Orders] ([OrderNumber]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Orders_TenantId_CustomerId] ON [Orders] ([TenantId], [CustomerId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Orders_TenantId_Status_CreatedAt] ON [Orders] ([TenantId], [Status], [CreatedAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_OrderStatusHistories_OrderId] ON [OrderStatusHistories] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_ProductImages_ProductId] ON [ProductImages] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Products_TenantId_CategoryId_Status] ON [Products] ([TenantId], [CategoryId], [Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Products_TenantId_IsDeleted_CreatedAt] ON [Products] ([TenantId], [IsDeleted], [CreatedAt]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Products_TenantId_Status] ON [Products] ([TenantId], [Status]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_ProductTags_ProductId] ON [ProductTags] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_ProductVariants_ProductId] ON [ProductVariants] ([ProductId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_SocialLinks_BusinessId] ON [SocialLinks] ([BusinessId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_StorefrontSettings_BusinessId] ON [StorefrontSettings] ([BusinessId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Tenants_ContactEmail] ON [Tenants] ([ContactEmail]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Tenants_Slug] ON [Tenants] ([Slug]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_TenantSubscriptions_PlanId] ON [TenantSubscriptions] ([PlanId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_TenantSubscriptions_TenantId] ON [TenantSubscriptions] ([TenantId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_UserRefreshTokens_UserId] ON [UserRefreshTokens] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_UserRoles_RoleId] ON [UserRoles] ([RoleId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_UserRoles_UserId] ON [UserRoles] ([UserId]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    CREATE INDEX [IX_Users_TenantId_IsActive] ON [Users] ([TenantId], [IsActive]);
END;
GO

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260430052403_InitialSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260430052403_InitialSchema', N'8.0.0');
END;
GO

COMMIT;
GO

