-- ============================================================================
--  Silarai — per-tenant B2B toggle
--  Manual schema migration (idempotent — safe to re-run)
--  Mirrors EF migration 20260817000000_AddB2BEnabledToggle
--
--  StorefrontSettings.B2BEnabled: when 0, the tenant's storefront hides all
--  B2B features (business-buyer signup, wholesale tiers, quote requests).
--  Defaults to 1 so existing tenants keep current behaviour.
-- ============================================================================

IF COL_LENGTH(N'dbo.StorefrontSettings', N'B2BEnabled') IS NULL
BEGIN
    ALTER TABLE [dbo].[StorefrontSettings]
        ADD [B2BEnabled] bit NOT NULL CONSTRAINT [DF_StorefrontSettings_B2BEnabled] DEFAULT 1;
END
GO

-- Mark migration applied so a future startup MigrateAsync() skips it
IF NOT EXISTS (SELECT 1 FROM [dbo].[__EFMigrationsHistory]
               WHERE [MigrationId] = N'20260817000000_AddB2BEnabledToggle')
BEGIN
    INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260817000000_AddB2BEnabledToggle', N'8.0.22');
END
GO
