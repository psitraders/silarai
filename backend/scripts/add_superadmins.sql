-- ============================================================
--  Add 5 SuperAdmins (admin_one..admin_five@silarai.com)
--  Run against: local Docker SQL Server and the staging Azure SQL DB.
--  Idempotent: re-running skips users that already exist (by Id or Email).
--  IDs match DataSeeder.ExtraSuperAdmins — keep them in sync.
--  Passwords are stored as BCrypt hashes only (cost=11); share them privately.
-- ============================================================

SET XACT_ABORT ON;
BEGIN TRANSACTION;

DECLARE @now           DATETIME2        = SYSUTCDATETIME();
DECLARE @adminTenantId UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000001';

-- ── 1. Silarai System tenant (same as DataSeeder) ─────────
IF NOT EXISTS (SELECT 1 FROM Tenants WHERE Id = @adminTenantId)
BEGIN
    INSERT INTO Tenants (Id, Name, Slug, ContactEmail, IsActive, IsEmailVerified, CreatedAt)
    VALUES (@adminTenantId, N'Silarai System', 'admin-system', 'system@silarai.app', 1, 1, @now);
    PRINT 'Created Silarai System tenant.';
END

-- ── 2. SuperAdmin role ─────────────────────────────────────
DECLARE @roleId UNIQUEIDENTIFIER;
SELECT TOP 1 @roleId = Id FROM Roles WHERE Name = 'SuperAdmin';

IF @roleId IS NULL
BEGIN
    SET @roleId = '00000000-0000-0000-0000-000000000010';
    INSERT INTO Roles (Id, Name, Description, CreatedAt)
    VALUES (@roleId, 'SuperAdmin', 'Full platform access', @now);
    PRINT 'Created SuperAdmin role.';
END

-- ── 3. Users + UserRoles ───────────────────────────────────
DECLARE @admins TABLE (UserId UNIQUEIDENTIFIER, UserRoleId UNIQUEIDENTIFIER, Name NVARCHAR(200), Email NVARCHAR(256), PwdHash NVARCHAR(500));
INSERT INTO @admins VALUES
 ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201', N'Silarai Admin One',   'admin_one@silarai.com',   '$2a$11$chtMi4Jq0cRiEsspqLSB/.LG8GXHH5AKTR.NFZPZF/5GygEM2nT4q'),
 ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000202', N'Silarai Admin Two',   'admin_two@silarai.com',   '$2a$11$XmLQkCDEgGe5zyQ5o16QKufeJwbVQWg/RHG5VZtm6i7retZRoDAH2'),
 ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000203', N'Silarai Admin Three', 'admin_three@silarai.com', '$2a$11$l/42uEwxCCbG5J/c7IikluNnEtXi00nby8TZifjG2XYYGGLRSmJL6'),
 ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000204', N'Silarai Admin Four',  'admin_four@silarai.com',  '$2a$11$wyJWr8zaDO5svjW71.SHH.V/aWg5w0Ro5JzFGuA240erNHEsPW3VK'),
 ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000205', N'Silarai Admin Five',  'admin_five@silarai.com',  '$2a$11$w7B/.VgT6kHDc.KMYDNAdeA5yVl7FQRL4eAfKUafThCRg6C5rwHHu');

-- Skip any that already exist
DELETE a FROM @admins a
WHERE EXISTS (SELECT 1 FROM Users u WHERE u.Id = a.UserId OR u.Email = a.Email);

INSERT INTO Users (Id, TenantId, Name, Email, PasswordHash, IsActive, IsEmailVerified, CreatedAt)
SELECT UserId, @adminTenantId, Name, Email, PwdHash, 1, 1, @now FROM @admins;

INSERT INTO UserRoles (Id, UserId, RoleId, CreatedAt)
SELECT UserRoleId, UserId, @roleId, @now FROM @admins;

DECLARE @added INT = (SELECT COUNT(*) FROM @admins);
COMMIT;

PRINT CONCAT('Added ', @added, ' SuperAdmin(s).');

-- Verify
SELECT u.Email, u.IsActive, r.Name AS Role
FROM Users u JOIN UserRoles ur ON ur.UserId = u.Id JOIN Roles r ON r.Id = ur.RoleId
WHERE r.Name = 'SuperAdmin' ORDER BY u.Email;
