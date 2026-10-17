using ReplyCart.Domain.Storefront;

namespace ReplyCart.Infrastructure.Persistence;

/// <summary>
/// Storefront builder designs for the demo stores (plan §7 step 8). The JSON is the output of each
/// frontend template pack's <c>build(store)</c> for that store (templates are code packs, D2), so
/// regenerate it when a template changes. Seeded as both draft and published.
/// </summary>
internal static class DemoStorefrontDesigns
{
    /// <summary>Aradhya Jewels on the Noor template.</summary>
    public static void AddAradhyaNoor(AppDbContext db, Guid tenantId, DateTime now) =>
        AddDesign(db, tenantId, now, AradhyaSite, AradhyaHome, AradhyaCollection, AradhyaProduct,
        [
            ("Our story", "about", true, true, AradhyaPage1),
            ("FAQ", "faq", false, true, AradhyaPage2),
            ("Contact", "contact", false, true, AradhyaPage3),
        ]);

    /// <summary>Priya's Boutique on the Bloom template.</summary>
    public static void AddPriyaBloom(AppDbContext db, Guid tenantId, DateTime now) =>
        AddDesign(db, tenantId, now, PriyaSite, PriyaHome, PriyaCollection, PriyaProduct,
        [
            ("About us", "about", true, true, PriyaPage1),
            ("FAQ", "faq", false, true, PriyaPage2),
            ("Contact", "contact", false, true, PriyaPage3),
        ]);

    /// <summary>Sugar and Crumbs on the Crumb template.</summary>
    public static void AddSugarCrumb(AppDbContext db, Guid tenantId, DateTime now) =>
        AddDesign(db, tenantId, now, SugarSite, SugarHome, SugarCollection, SugarProduct,
        [
            ("Our story", "about", true, true, SugarPage1),
            ("FAQ", "faq", false, true, SugarPage2),
            ("Contact", "contact", false, true, SugarPage3),
        ]);

    /// <summary>Theme + Home / catalogue / product designs + the template's custom pages, draft = published.</summary>
    private static void AddDesign(AppDbContext db, Guid tenantId, DateTime now, string site, string home, string collection, string product,
        (string Title, string Slug, bool Nav, bool Footer, string Layout)[] pages)
    {
        db.StorefrontThemes.Add(new StorefrontTheme
        {
            Id = Guid.NewGuid(), TenantId = tenantId,
            DraftJson = site, PublishedJson = site, PublishedAt = now, Version = 1, CreatedAt = now,
        });

        AddPage(db, tenantId, now, StorefrontPageType.Home, "Home", "__home", home);
        AddPage(db, tenantId, now, StorefrontPageType.CollectionTemplate, "CollectionTemplate", "__collection-template", collection);
        AddPage(db, tenantId, now, StorefrontPageType.ProductTemplate, "ProductTemplate", "__product-template", product);

        for (var i = 0; i < pages.Length; i++)
        {
            var page = AddPage(db, tenantId, now, StorefrontPageType.Custom, pages[i].Title, pages[i].Slug, pages[i].Layout);
            page.ShowInNav = pages[i].Nav;
            page.ShowInFooter = pages[i].Footer;
            page.SortOrder = i;
        }
    }

    private static StorefrontPage AddPage(AppDbContext db, Guid tenantId, DateTime now, StorefrontPageType type, string title, string slug, string layout)
    {
        var page = new StorefrontPage
        {
            Id = Guid.NewGuid(), TenantId = tenantId, PageType = type, Title = title, Slug = slug,
            IsPublished = true, DraftLayoutJson = layout, PublishedLayoutJson = layout, PublishedAt = now, CreatedAt = now,
        };
        db.StorefrontPages.Add(page);
        return page;
    }

    // ── Noor documents for Aradhya Jewels (generated from templates/noor/build.ts) ──

    private const string AradhyaSite = """
        {"schemaVersion":1,"templateId":"noor","theme":{"styleKit":"luxe","overrides":{},"palette":{"presetId":"luxe-gold"},"fontPair":"luxury-serif"},"behaviour":{"productView":"page","quickviewLayout":"immersive","cardStyle":"editorial","cartStyle":"drawer-right","cart":{"freeDeliveryAt":0,"upsell":true,"coupon":true,"autoOpen":true},"backToTop":true,"mobileBottomBar":false,"loader":"logo"},"header":{"id":"header","type":"header","layout":"stacked-centered","scheme":"light","v":2,"settings":{"announcements":["✨ Festive Sale — Flat 15% off on all Kundan & Meenakari sets! Use code FESTIVE15 on WhatsApp orders."],"announcementStyle":"static","sticky":"scroll-up","search":"icon","mobileMenu":"fullscreen","logoSize":"large","cartIcon":"bag","showAccount":true,"showWhatsApp":false,"featuredCategoriesInMenu":true}},"footer":{"id":"footer","type":"footer","layout":"big-wordmark","scheme":"contrast","v":1,"settings":{"about":"Handcrafted silver & oxidised jewelry made by artisans in Jaipur. Each piece is unique, ethically made and nickel-free.","showTrustStrip":false,"showCategories":true,"showReturnPolicy":true,"showSocial":true,"showPayments":true}},"menus":{"main":[],"footer":[]}}
        """;
    private const string AradhyaHome = """
        {"schemaVersion":1,"sections":[{"id":"hero","type":"hero","layout":"full-bleed","scheme":"contrast","v":1,"settings":{"eyebrow":"Handcrafted for you","image":{"$image":""},"primaryLabel":"Shop the collection","primaryLink":{"$link":"/products"},"showWhatsApp":false,"showHighlights":false,"height":"tall"}},{"id":"spotlight","type":"collection-spotlight","layout":"framed","scheme":"soft","v":1,"settings":{"eyebrow":"The collection","category":{"$categories":{"source":"featured","limit":1}},"buttonLabel":"Explore the collection"}},{"id":"new-in","type":"product-collection","layout":"large-first","scheme":"light","v":1,"settings":{"eyebrow":"New in","title":"Latest pieces","products":{"$products":{"source":"newest","limit":7}},"showViewAll":true}},{"id":"making","type":"craftsmanship-story","layout":"steps","scheme":"soft","v":1,"settings":{"eyebrow":"The making","heading":"From sketch to sparkle","subtitle":"Tell shoppers how your pieces are made — edit these steps to match your craft."},"blocks":[{"id":"step1","type":"step","settings":{"title":"Design","text":"Every piece starts as a hand sketch."}},{"id":"step2","type":"step","settings":{"title":"Crafting","text":"Shaped and finished by skilled artisans."}},{"id":"step3","type":"step","settings":{"title":"Detailing","text":"Stones and details are set by hand."}},{"id":"step4","type":"step","settings":{"title":"Finishing","text":"Polished, checked and packed with care."}}]},{"id":"look","type":"shop-the-look","layout":"hotspots","scheme":"light","v":1,"settings":{"eyebrow":"Shop the look","heading":"Styled for the evening","image":{"$image":""}}},{"id":"reviews","type":"reviews-summary","layout":"carousel","scheme":"contrast","v":1,"settings":{"eyebrow":"Kind words","heading":"From our customers","limit":6,"minRating":4,"showProduct":true}},{"id":"promise","type":"certification-strip","layout":"strip","scheme":"light","v":1,"settings":{"heading":"Our promise"},"blocks":[{"id":"badge1","type":"badge","settings":{"icon":"hand","title":"Handcrafted","detail":"Made by skilled artisans"}},{"id":"badge2","type":"badge","settings":{"icon":"gift","title":"Gift-ready","detail":"Packed to be given"}},{"id":"badge3","type":"badge","settings":{"icon":"shield","title":"Secure payments","detail":"Pay safely online"}},{"id":"badge4","type":"badge","settings":{"icon":"chat","title":"Help on WhatsApp","detail":"Real people, quick replies"}}]},{"id":"concierge","type":"concierge","layout":"card","scheme":"soft","v":1,"settings":{}}]}
        """;
    private const string AradhyaCollection = """
        {"schemaVersion":1,"sections":[{"id":"all-products","type":"all-products","layout":"editorial-2col","scheme":"light","v":1,"settings":{"showBreadcrumb":true,"title":"The collection"}}]}
        """;
    private const string AradhyaProduct = """
        {"schemaVersion":1,"sections":[{"id":"product-main","type":"product-main","layout":"split-screen","scheme":"light","v":1,"settings":{"imageRatio":"portrait","zoom":true,"infoStyle":"accordion","stickyBar":true,"breadcrumbs":true},"blocks":[{"id":"pb1","type":"badges"},{"id":"pb2","type":"title"},{"id":"pb3","type":"rating"},{"id":"pb4","type":"price"},{"id":"pb5","type":"description","settings":{"mode":"short","lines":4}},{"id":"pb6","type":"variants"},{"id":"pb7","type":"quantity"},{"id":"pb8","type":"buy-buttons"},{"id":"pb9","type":"wholesale"},{"id":"pb10","type":"quote"},{"id":"pb11","type":"inquiry"},{"id":"pb12","type":"delivery"},{"id":"pb13","type":"trust"},{"id":"pb14","type":"description","settings":{"mode":"full"}},{"id":"pb15","type":"accordion"},{"id":"pb16","type":"reviews"}]},{"id":"related","type":"related-products","layout":"carousel","scheme":"soft","v":1},{"id":"recent","type":"recently-viewed","layout":"carousel","scheme":"light","v":1}]}
        """;
    private const string AradhyaPage1 = """
        {"schemaVersion":1,"sections":[{"id":"story","type":"rich-text","layout":"narrow","scheme":"light","v":1,"settings":{"eyebrow":"Our story","heading":"Aradhya Jewels","content":{"$richtext":"<p>Handcrafted silver &amp; oxidised jewelry made by artisans in Jaipur. Each piece is unique, ethically made and nickel-free.</p>"},"align":"center"}},{"id":"making","type":"craftsmanship-story","layout":"alternating","scheme":"soft","v":1,"settings":{"eyebrow":"The making","heading":"How each piece is made","subtitle":""},"blocks":[{"id":"step1","type":"step","settings":{"title":"Designed by hand","text":"Describe where your designs come from."}},{"id":"step2","type":"step","settings":{"title":"Made by artisans","text":"Introduce the people who make your pieces."}}]},{"id":"concierge","type":"concierge","layout":"banner","scheme":"contrast","v":1,"settings":{}}]}
        """;
    private const string AradhyaPage2 = """
        {"schemaVersion":1,"sections":[{"id":"faq","type":"faq","layout":"accordion","scheme":"light","v":1,"settings":{"heading":"Questions, answered","subtitle":"Replace these answers with your own policies."},"blocks":[{"id":"q1","type":"question","settings":{"question":"How long does delivery take?","answer":"Tell shoppers how long delivery usually takes and where you ship."}},{"id":"q2","type":"question","settings":{"question":"Can I return or exchange a piece?","answer":"Explain your return and exchange policy, including any time limit."}},{"id":"q3","type":"question","settings":{"question":"How should I care for my jewellery?","answer":"Share simple care tips so pieces stay beautiful."}},{"id":"q4","type":"question","settings":{"question":"Do you offer gift wrapping?","answer":"Say whether pieces come gift-ready and if you add notes."}}]},{"id":"help","type":"whatsapp-cta","layout":"card","scheme":"soft","v":1,"settings":{"heading":"Still have a question?","buttonLabel":"Ask us on WhatsApp"}}]}
        """;
    private const string AradhyaPage3 = """
        {"schemaVersion":1,"sections":[{"id":"contact","type":"contact-info","layout":"split","scheme":"light","v":1,"settings":{"heading":"Visit or write to us","phone":"+910000000003","showWhatsApp":true}}]}
        """;

    // ── Bloom documents for Priya's Boutique (generated from templates/bloom/build.ts) ──

    private const string PriyaSite = """
        {"schemaVersion":1,"templateId":"bloom","theme":{"styleKit":"editorial","overrides":{},"palette":{"presetId":"rose-gold"},"fontPair":"classic-elegant"},"behaviour":{"productView":"popup","quickviewLayout":"story","cardStyle":"overlay","cartStyle":"drawer-right","cart":{"freeDeliveryAt":0,"upsell":true,"coupon":true,"autoOpen":true},"backToTop":true,"mobileBottomBar":false,"loader":"logo"},"header":{"id":"header","type":"header","layout":"centered-logo","scheme":"light","v":2,"settings":{"announcements":["🌸 New Festive Collection is LIVE! Get 10% off your first order — DM us on WhatsApp!"],"announcementStyle":"marquee","sticky":"scroll-up","search":"icon","mobileMenu":"drawer-left","logoSize":"medium","cartIcon":"bag","showAccount":true,"showWhatsApp":true,"featuredCategoriesInMenu":true}},"footer":{"id":"footer","type":"footer","layout":"instagram-strip","scheme":"soft","v":1,"settings":{"about":"Handcrafted ethnic & fusion wear for the modern Indian woman. Curated from artisans across Jaipur, Surat & Varanasi.","showTrustStrip":false,"showCategories":true,"showReturnPolicy":true,"showSocial":true,"showPayments":true}},"menus":{"main":[],"footer":[]}}
        """;
    private const string PriyaHome = """
        {"schemaVersion":1,"sections":[{"id":"hero","type":"slideshow","layout":"full","scheme":"contrast","v":1,"settings":{"autoplay":true,"interval":6,"height":"tall"},"blocks":[{"id":"slide1","type":"slide","settings":{"image":{"$image":""},"eyebrow":"New season","heading":"Priya's Boutique","text":"","buttonLabel":"Shop new arrivals","buttonLink":{"$link":"/products"},"align":"left"}},{"id":"slide2","type":"slide","settings":{"image":{"$image":""},"eyebrow":"The edit","heading":"Pieces we love right now","text":"","buttonLabel":"Explore","buttonLink":{"$link":"/products"},"align":"left"}}]},{"id":"occasions","type":"shop-by-occasion","layout":"arches","scheme":"light","v":1,"settings":{"heading":"Shop by occasion"},"blocks":[{"id":"occ1","type":"occasion","settings":{"label":"Festive"}},{"id":"occ2","type":"occasion","settings":{"label":"Wedding"}},{"id":"occ3","type":"occasion","settings":{"label":"Office"}},{"id":"occ4","type":"occasion","settings":{"label":"Casual"}}]},{"id":"trending","type":"product-collection","layout":"carousel","scheme":"soft","v":1,"settings":{"eyebrow":"Trending","title":"Most loved right now","products":{"$products":{"source":"featured","limit":12}},"showRank":true,"showViewAll":true}},{"id":"stories","type":"lookbook-stories","layout":"circles","scheme":"light","v":1,"settings":{"heading":"Lookbook"},"blocks":[]},{"id":"story","type":"image-with-text","layout":"overlap","scheme":"light","v":1,"settings":{"eyebrow":"Our story","heading":"Made for the way you dress","body":{"$richtext":"<p>Handcrafted ethnic &amp; fusion wear for the modern Indian woman. Curated from artisans across Jaipur, Surat &amp; Varanasi.</p>"},"image":{"$image":""},"imageRatio":"portrait","buttonLabel":"About us","buttonLink":{"$link":"/p/about"}}},{"id":"insta","type":"instagram-grid","layout":"grid","scheme":"light","v":1,"settings":{"eyebrow":"As seen on Instagram","heading":"Styled by you","showHandle":true},"blocks":[]},{"id":"reviews","type":"reviews-summary","layout":"carousel","scheme":"soft","v":1,"settings":{"eyebrow":"Reviews","heading":"What shoppers say","limit":6,"minRating":4,"showProduct":true}},{"id":"newsletter","type":"newsletter","layout":"band","scheme":"brand","v":1,"settings":{}}]}
        """;
    private const string PriyaCollection = """
        {"schemaVersion":1,"sections":[{"id":"all-products","type":"all-products","layout":"masonry","scheme":"light","v":1,"settings":{"showBreadcrumb":true,"title":"Shop all"}}]}
        """;
    private const string PriyaProduct = """
        {"schemaVersion":1,"sections":[{"id":"product-main","type":"product-main","layout":"stacked-sticky","scheme":"light","v":1,"settings":{"imageRatio":"portrait","zoom":true,"infoStyle":"accordion","stickyBar":true,"breadcrumbs":true},"blocks":[{"id":"pb1","type":"badges"},{"id":"pb2","type":"title"},{"id":"pb3","type":"rating"},{"id":"pb4","type":"price"},{"id":"pb5","type":"description","settings":{"mode":"short","lines":4}},{"id":"pb6","type":"variants"},{"id":"pb7","type":"quantity"},{"id":"pb8","type":"buy-buttons"},{"id":"pb9","type":"wholesale"},{"id":"pb10","type":"quote"},{"id":"pb11","type":"inquiry"},{"id":"pb12","type":"delivery"},{"id":"pb13","type":"trust"},{"id":"pb14","type":"description","settings":{"mode":"full"}},{"id":"pb15","type":"accordion"},{"id":"pb16","type":"reviews"}]},{"id":"related","type":"related-products","layout":"carousel","scheme":"soft","v":1},{"id":"recent","type":"recently-viewed","layout":"carousel","scheme":"light","v":1}]}
        """;
    private const string PriyaPage1 = """
        {"schemaVersion":1,"sections":[{"id":"story","type":"rich-text","layout":"narrow","scheme":"light","v":1,"settings":{"eyebrow":"About us","heading":"Priya's Boutique","align":"center","content":{"$richtext":"<p>Handcrafted ethnic &amp; fusion wear for the modern Indian woman. Curated from artisans across Jaipur, Surat &amp; Varanasi.</p>"}}},{"id":"newsletter","type":"newsletter","layout":"card","scheme":"soft","v":1,"settings":{"askName":true}}]}
        """;
    private const string PriyaPage2 = """
        {"schemaVersion":1,"sections":[{"id":"faq","type":"faq","layout":"accordion","scheme":"light","v":1,"settings":{"heading":"Questions, answered","subtitle":"Replace these answers with your own policies."},"blocks":[{"id":"q1","type":"question","settings":{"question":"How do I find my size?","answer":"Explain how your sizes run and link to your size guide."}},{"id":"q2","type":"question","settings":{"question":"How long does delivery take?","answer":"Tell shoppers how long delivery usually takes and where you ship."}},{"id":"q3","type":"question","settings":{"question":"Can I return or exchange an item?","answer":"Explain your return and exchange policy, including any time limit."}},{"id":"q4","type":"question","settings":{"question":"Do you take custom orders?","answer":"Say whether you alter or make pieces to measure, and how to ask."}}]},{"id":"help","type":"whatsapp-cta","layout":"card","scheme":"soft","v":1,"settings":{"heading":"Need styling help?","buttonLabel":"Chat on WhatsApp"}}]}
        """;
    private const string PriyaPage3 = """
        {"schemaVersion":1,"sections":[{"id":"contact","type":"contact-info","layout":"split","scheme":"light","v":1,"settings":{"heading":"Get in touch","phone":"+910000000001","showWhatsApp":true}}]}
        """;

    // ── Crumb documents for Sugar & Crumbs (generated from templates/crumb/build.ts) ──

    private const string SugarSite = """
        {"schemaVersion":1,"templateId":"crumb","theme":{"styleKit":"soft","overrides":{"foodMarkers":true},"palette":{"presetId":"caramel"},"fontPair":"bakery-sc"},"behaviour":{"productView":"popup","quickviewLayout":"menu-item","cardStyle":"rounded-center","cartStyle":"bottom-sheet","cart":{"freeDeliveryAt":0,"upsell":true,"coupon":true,"autoOpen":true},"backToTop":true,"mobileBottomBar":true,"loader":"logo"},"header":{"id":"header","type":"header","layout":"two-tier","scheme":"light","v":2,"settings":{"announcements":["🎂 Birthday coming up? Pre-order your custom cake today! 48hr advance booking required. Call/WhatsApp us!"],"announcementStyle":"static","utilityText":"","sticky":"always","search":"icon","mobileMenu":"drawer-left","logoSize":"medium","cartIcon":"basket","showAccount":true,"showWhatsApp":true,"featuredCategoriesInMenu":true}},"footer":{"id":"footer","type":"footer","layout":"contact-card","scheme":"contrast","v":1,"settings":{"about":"Handcrafted custom cakes, cupcakes & desserts made with love. 100% eggless options available. Based in Bengaluru.","showTrustStrip":false,"showCategories":true,"showReturnPolicy":true,"showSocial":true,"showPayments":true,"contactPhone":"+910000000002"}},"menus":{"main":[],"footer":[]}}
        """;
    private const string SugarHome = """
        {"schemaVersion":1,"sections":[{"id":"hero","type":"hero","layout":"split-right","scheme":"soft","v":1,"settings":{"eyebrow":"Baked fresh","image":{"$image":""},"primaryLabel":"See today’s menu","primaryLink":{"$link":"#section-menu"},"showWhatsApp":true,"showHighlights":false,"height":"regular"}},{"id":"today","type":"todays-bake","layout":"cards","scheme":"accent","v":1,"settings":{"eyebrow":"Fresh today","heading":"Today’s bake","products":{"$products":{"source":"featured","limit":4}},"cutoff":""}},{"id":"menu","type":"menu-board","layout":"board","scheme":"light","v":1,"settings":{"eyebrow":"Our menu","heading":"Baked fresh","categories":{"$categories":{"source":"all","limit":6}},"perCategory":8}},{"id":"occasion","type":"product-collection","layout":"carousel","scheme":"soft","v":1,"settings":{"eyebrow":"For every celebration","title":"Occasion favourites","products":{"$products":{"source":"featured","limit":12}},"showViewAll":true}},{"id":"cake","type":"custom-cake-request","layout":"split","scheme":"light","v":1,"settings":{}},{"id":"reviews","type":"reviews-summary","layout":"carousel","scheme":"soft","v":1,"settings":{"eyebrow":"Reviews","heading":"Sweet words","limit":6,"minRating":4,"showProduct":true}},{"id":"visit","type":"contact-info","layout":"card","scheme":"light","v":1,"settings":{"heading":"Visit or order","phone":"+910000000002","showWhatsApp":true}}]}
        """;
    private const string SugarCollection = """
        {"schemaVersion":1,"sections":[{"id":"all-products","type":"all-products","layout":"category-rows","scheme":"light","v":1,"settings":{"showBreadcrumb":true,"title":"Our menu"}}]}
        """;
    private const string SugarProduct = """
        {"schemaVersion":1,"sections":[{"id":"product-main","type":"product-main","layout":"menu-item","scheme":"light","v":1,"settings":{"imageRatio":"square","zoom":true,"infoStyle":"plain","stickyBar":true,"breadcrumbs":true,"addOnsHeading":"Goes well with"},"blocks":[{"id":"pb1","type":"badges"},{"id":"pb2","type":"title"},{"id":"pb3","type":"rating"},{"id":"pb4","type":"price"},{"id":"pb5","type":"description","settings":{"mode":"short","lines":4}},{"id":"pb6","type":"variants"},{"id":"pb7","type":"quantity"},{"id":"pb8","type":"buy-buttons"},{"id":"pb9","type":"wholesale"},{"id":"pb10","type":"quote"},{"id":"pb11","type":"inquiry"},{"id":"pb12","type":"delivery"},{"id":"pb13","type":"trust"},{"id":"pb14","type":"description","settings":{"mode":"full"}},{"id":"pb15","type":"accordion"},{"id":"pb16","type":"reviews"}]},{"id":"related","type":"related-products","layout":"carousel","scheme":"soft","v":1}]}
        """;
    private const string SugarPage1 = """
        {"schemaVersion":1,"sections":[{"id":"story","type":"rich-text","layout":"narrow","scheme":"light","v":1,"settings":{"eyebrow":"Our story","heading":"Sugar & Crumbs Cake Studio","align":"center","content":{"$richtext":"<p>Handcrafted custom cakes, cupcakes &amp; desserts made with love. 100% eggless options available. Based in Bengaluru.</p>"}}},{"id":"slots","type":"delivery-slots","layout":"card","scheme":"soft","v":1,"settings":{"heading":"When and where we deliver"},"blocks":[{"id":"slot1","type":"slot","settings":{"label":"Morning","time":"Add your times"}},{"id":"slot2","type":"slot","settings":{"label":"Evening","time":"Add your times"}}]}]}
        """;
    private const string SugarPage2 = """
        {"schemaVersion":1,"sections":[{"id":"faq","type":"faq","layout":"accordion","scheme":"light","v":1,"settings":{"heading":"Questions, answered","subtitle":"Replace these answers with your own policies."},"blocks":[{"id":"q1","type":"question","settings":{"question":"How early should I order?","answer":"Say how much notice you need for regular items and for custom cakes."}},{"id":"q2","type":"question","settings":{"question":"Do you have eggless options?","answer":"Explain which items can be made eggless. Tag products “eggless” or “veg” to show the marks."}},{"id":"q3","type":"question","settings":{"question":"Which areas do you deliver to?","answer":"List the areas you deliver to and any delivery charges."}},{"id":"q4","type":"question","settings":{"question":"Can I pick up my order?","answer":"Tell shoppers if and when they can collect from you."}}]}]}
        """;
    private const string SugarPage3 = """
        {"schemaVersion":1,"sections":[{"id":"contact","type":"contact-info","layout":"split","scheme":"light","v":1,"settings":{"heading":"Get in touch","phone":"+910000000002","showWhatsApp":true}},{"id":"map","type":"map","layout":"contained","scheme":"light","v":1,"settings":{"heading":"Find us"}}]}
        """;
}
