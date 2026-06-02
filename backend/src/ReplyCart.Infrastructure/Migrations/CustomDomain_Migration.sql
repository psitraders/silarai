-- Migration: Add Custom Domain support to Tenants table
-- Run this on Azure SQL before deploying the new backend build

ALTER TABLE Tenants
ADD
    CustomDomain           NVARCHAR(253) NULL,
    CustomDomainStatus     NVARCHAR(20)  NULL,
    CloudflareHostnameId   NVARCHAR(100) NULL,
    CustomDomainVerifiedAt DATETIME2     NULL;

-- Unique index: one domain per tenant
CREATE UNIQUE INDEX IX_Tenants_CustomDomain
    ON Tenants(CustomDomain)
    WHERE CustomDomain IS NOT NULL;
GO
