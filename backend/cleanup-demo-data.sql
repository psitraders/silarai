-- ============================================================
-- ReplyCart — Clean ALL non-admin tenant data
-- Run this against ReplyCart_Dev before re-seeding demo stores
-- Connection: Server=(localdb)\mssqllocaldb;Database=ReplyCart_Dev
-- ============================================================

DECLARE @AdminTenantId UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000001';

PRINT 'Starting cleanup of non-admin tenant data...';

-- Marketing
DELETE FROM CampaignRecipients WHERE TenantId != @AdminTenantId;
DELETE FROM Campaigns          WHERE TenantId != @AdminTenantId;
DELETE FROM AbandonedCarts     WHERE TenantId != @AdminTenantId;
PRINT 'Marketing data cleared.';

-- CRM
DELETE FROM LeadActivities WHERE TenantId != @AdminTenantId;
DELETE FROM LeadNotes      WHERE TenantId != @AdminTenantId;
DELETE FROM Leads          WHERE TenantId != @AdminTenantId;
DELETE FROM Customers      WHERE TenantId != @AdminTenantId;
PRINT 'CRM data cleared.';

-- Orders
DELETE FROM OrderStatusHistories WHERE TenantId != @AdminTenantId;
DELETE FROM Payments             WHERE TenantId != @AdminTenantId;
DELETE FROM OrderItems           WHERE TenantId != @AdminTenantId;
DELETE FROM Orders               WHERE TenantId != @AdminTenantId;
PRINT 'Orders cleared.';

-- Catalog
DELETE FROM ProductTags     WHERE TenantId != @AdminTenantId;
DELETE FROM ProductVariants WHERE TenantId != @AdminTenantId;
DELETE FROM ProductImages   WHERE TenantId != @AdminTenantId;
DELETE FROM ProductReviews  WHERE TenantId != @AdminTenantId;
DELETE FROM Coupons         WHERE TenantId != @AdminTenantId;
DELETE FROM Products        WHERE TenantId != @AdminTenantId;
DELETE FROM Categories      WHERE TenantId != @AdminTenantId;
PRINT 'Catalog cleared.';

-- AI
DELETE FROM AiSuggestions WHERE TenantId != @AdminTenantId;
DELETE FROM AiUsageLogs   WHERE TenantId != @AdminTenantId;
DELETE FROM ReplyTemplates WHERE TenantId != @AdminTenantId;
PRINT 'AI data cleared.';

-- Business
DELETE FROM StorefrontSettings WHERE TenantId != @AdminTenantId;
DELETE FROM SocialLinks        WHERE TenantId != @AdminTenantId;
DELETE FROM Businesses         WHERE TenantId != @AdminTenantId;
PRINT 'Business data cleared.';

-- Identity (non-admin users)
DELETE FROM UserRefreshTokens WHERE UserId IN (SELECT Id FROM Users WHERE TenantId != @AdminTenantId);
DELETE FROM UserTokens        WHERE UserId IN (SELECT Id FROM Users WHERE TenantId != @AdminTenantId);
DELETE FROM UserRoles         WHERE UserId IN (SELECT Id FROM Users WHERE TenantId != @AdminTenantId);
DELETE FROM Users             WHERE TenantId != @AdminTenantId;
PRINT 'Users cleared.';

-- Tenants
DELETE FROM TenantSubscriptions WHERE TenantId != @AdminTenantId;
DELETE FROM Tenants             WHERE Id != @AdminTenantId;
PRINT 'Tenants cleared.';

PRINT '';
PRINT '✅ Cleanup complete! Restart the API to trigger DataSeeder for 3 demo stores.';
