---
id: catalog-categories
status: current
prefix: CAT
related: [catalog-products, storefront, storefront-builder-commerce]
---
# Catalog — Categories

## Purpose
Group products into categories with one optional level of sub-categories, for dashboard filtering, storefront navigation and builder sections.

## Scope
- **In:** `Category` CRUD, sub-categories, featured flag, category image, sort order, active flag.
- **Out:** how categories render on the storefront (`storefront-builder-commerce`), product assignment (`catalog-products`).

## Functional behaviour
- **Categories** page (`/catalog/categories`): tree of root categories with their sub-categories, counts, create / edit / delete in a modal (name, description, parent, image, featured, active, sort order).
- **Featured** applies to root categories only: featured categories appear in the storefront top navigation with sub-category dropdowns.
- Storefront product lists for a root category include products of its sub-categories.
- The storefront setting *Sub-categories enabled* (`StorefrontSettings.SubCategoriesEnabled`) is stored with the store settings.
- Delete is a soft delete.

## Rules
- **CAT-R1** — Categories support only one level of sub-categories (`ParentCategoryId`).
- **CAT-R9** — `IsFeatured` is always false for a sub-category (forced on create / update).

## Backend
- **Data:** `Catalog/Category` (`Name`, `Description`, `ImageUrl`, `SortOrder`, `IsActive`, `ParentCategoryId`, `IsFeatured`; self-referencing FK `FK_Categories_Categories_ParentCategoryId`).
- **API — `CategoriesController` `/api/v1/categories` 🔒:** `GET` (roots with `subCategories`), `POST`, `PUT {id}`, `DELETE {id}` (soft), `POST {id}/image` (multipart `file` via `IStorageProvider`; returns `{url}` — the caller then saves it with `PUT`).
- **Logic:** `Application/Catalog/Commands/CreateCategoryCommand`, `UpdateCategoryCommand`, `DeleteCategoryCommand`, `Queries/GetCategoriesQuery`.
- **Public:** `GET /public/{slug}/categories` (active, ordered, with sub-categories; `Cache-Control: public, max-age=300, stale-while-revalidate=60`).

## Frontend
- **Routes & screens:** `pages/catalog/CategoriesPage.tsx`.
- **Code:** local `categoriesApi` inside the page (`getAll`, `create`, `update`, `delete`, `uploadImage`) on `apiClient`; `catalogApi.getCategories` used by the product form.

## Known issues
Open items in [known-issues](known-issues.md): KI-038, KI-039.

## Suggestions
- Validate the parent on the server (must be a root category of the same tenant).

## Changes to be done
