-- Migration: Add Slug to Products table
-- Run on Azure SQL before deploying the new backend build.

ALTER TABLE Products
ADD Slug NVARCHAR(200) NULL;

-- One slug per tenant (different tenants can have the same slug)
CREATE UNIQUE INDEX IX_Products_TenantId_Slug
    ON Products(TenantId, Slug)
    WHERE Slug IS NOT NULL;
GO

-- Backfill slugs for all existing products.
-- Converts title to lowercase, replaces spaces/special chars with hyphens.
-- Appends the first 8 chars of the product ID to guarantee uniqueness per tenant.
UPDATE Products
SET Slug = LOWER(
    LEFT(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(
                        REPLACE(Title, ' ', '-'),
                    '/', '-'),
                '(', ''),
            ')', ''),
        ',', ''),
    80)
) + '-' + LEFT(CAST(Id AS NVARCHAR(36)), 8)
WHERE Slug IS NULL;
GO
