-- ============================================================
--  Onboard: Soniya's Kurti Collection
--  Email   : soniyasaini21345@gmail.com
--  Phone   : 07976255311
--  Location: Jaipur Airport Area, India, 302017
--  Slug    : soniyas-kurti-collection
--  Temp pw : Welcome@123  (tell her to change on first login)
-- ============================================================
-- Run against: replycart.database.windows.net / ReplyCart DB
-- ============================================================

BEGIN TRANSACTION;

-- ── Fixed IDs (generated once, stable across re-runs) ──────
DECLARE @tenantId         UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0001-000000000001';
DECLARE @userId           UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0002-000000000001';
DECLARE @businessId       UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0003-000000000001';
DECLARE @storefrontId     UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0004-000000000001';
DECLARE @subscriptionId   UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0005-000000000001';
DECLARE @userRoleId       UNIQUEIDENTIFIER = 'A1B2C3D4-0001-0001-0006-000000000001';

DECLARE @email    NVARCHAR(256) = 'soniyasaini21345@gmail.com';
DECLARE @phone    NVARCHAR(20)  = '07976255311';
DECLARE @slug     NVARCHAR(100) = 'soniyas-kurti-collection';
DECLARE @now      DATETIME2     = SYSUTCDATETIME();

-- BCrypt hash of: Welcome@123  (cost=11)
DECLARE @pwdHash  NVARCHAR(500) =
    '$2a$11$.bE9LW9cqJBwq5T7fMRHIu4dhtvLU5Xi3G/K9LC4Lo4VU6hhyDjWO';

-- ── Guard: skip if already inserted ───────────────────────
IF EXISTS (SELECT 1 FROM Tenants WHERE Id = @tenantId)
BEGIN
    PRINT 'Already onboarded — nothing to do.';
    ROLLBACK;
    RETURN;
END

-- ── 1. Tenant ──────────────────────────────────────────────
INSERT INTO Tenants
    (Id, Name, Slug, ContactEmail, ContactPhone,
     IsActive, IsEmailVerified,
     CreatedAt)
VALUES
    (@tenantId,
     N'Soniya''s Kurti Collection',
     @slug,
     @email,
     @phone,
     1, 1,      -- IsActive=true, IsEmailVerified=true (bypass OTP)
     @now);

-- ── 2. User ────────────────────────────────────────────────
INSERT INTO Users
    (Id, TenantId, Name, Email, PasswordHash, Phone,
     IsActive, IsEmailVerified,
     CreatedAt)
VALUES
    (@userId,
     @tenantId,
     N'Soniya',
     @email,
     @pwdHash,
     @phone,
     1, 1,
     @now);

-- ── 3. UserRole  (TenantAdmin) ─────────────────────────────
DECLARE @roleId UNIQUEIDENTIFIER;
SELECT TOP 1 @roleId = Id FROM Roles WHERE Name = 'TenantAdmin';

IF @roleId IS NULL
BEGIN
    SET @roleId = NEWID();
    INSERT INTO Roles (Id, Name, Description, CreatedAt)
    VALUES (@roleId, 'TenantAdmin', 'TenantAdmin', @now);
END

INSERT INTO UserRoles (Id, UserId, RoleId, CreatedAt)
VALUES (@userRoleId, @userId, @roleId, @now);

-- ── 4. Business ────────────────────────────────────────────
INSERT INTO Businesses
    (Id, TenantId, Name, Category,
     Currency, Country, Language,
     PaymentGateway, AutoReplyEnabled, AutoReplyTone, AutoCampaignEnabled,
     IsOnboardingComplete,
     IsDeleted, CreatedAt)
VALUES
    (@businessId,
     @tenantId,
     N'Soniya''s Kurti Collection',
     N'Fashion',       -- sensible default for a kurti store
     N'INR', N'India', N'en',
     N'Razorpay',
     0, N'Friendly', 0,
     0,                -- IsOnboardingComplete=false → she'll see the onboarding wizard
     0, @now);

-- ── 5. StorefrontSettings ──────────────────────────────────
INSERT INTO StorefrontSettings
    (Id, TenantId, BusinessId, Slug,
     ThemeColor, SecondaryColor,
     WhatsAppCtaLabel, InstagramCtaLabel, FacebookCtaLabel,
     ShowOutOfStockProducts, AllowPublicInquiries, LoaderEnabled,
     IsDeleted, CreatedAt)
VALUES
    (@storefrontId,
     @tenantId,
     @businessId,
     @slug,
     N'#9333EA',   -- purple — nice for a kurti/fashion brand
     N'#6B21A8',
     N'Order on WhatsApp',
     N'Message on Instagram',
     N'Message on Facebook',
     1, 1, 1,
     0, @now);

-- ── 6. TenantSubscription (10-day Trial on Basic plan) ─────
DECLARE @planId UNIQUEIDENTIFIER;
SELECT TOP 1 @planId = Id FROM SubscriptionPlans WHERE Slug = 'basic';

IF @planId IS NOT NULL
BEGIN
    INSERT INTO TenantSubscriptions
        (Id, TenantId, PlanId, Status,
         StartDate, EndDate,
         IsAnnual, PricePaid,
         CreatedAt)
    VALUES
        (@subscriptionId,
         @tenantId,
         @planId,
         0,          -- 0 = Trial (SubscriptionStatus enum)
         @now,
         DATEADD(DAY, 10, @now),
         0, 0,
         @now);
END
ELSE
    PRINT 'WARNING: No "basic" plan found — subscription row skipped.';

-- ── Done ───────────────────────────────────────────────────
COMMIT;

PRINT '✅ Onboarded Soniya''s Kurti Collection';
PRINT '   Login  : soniyasaini21345@gmail.com';
PRINT '   Temp pw: Welcome@123  — ask her to change on first login';
PRINT '   Store  : https://replycart.app/store/soniyas-kurti-collection';
