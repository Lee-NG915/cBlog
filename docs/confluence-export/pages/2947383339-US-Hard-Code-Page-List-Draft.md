---
confluence_id: "2947383339"
title: "US Hard Code Page List (Draft)"
status: current
parent_id: "2914549854"
depth: 3
domain: architecture
web_url: https://castlery.atlassian.net/wiki/spaces/EC/pages/2947383339
local_joyboy_doc: null
blog_post: null
---
**A Page without a blue background indicates it can be migrated to Storyblok with relatively low cost; a Page with a blue background means that migration to a Storyblok is either unnecessary or would incur a high cost.**

#### Home Page (confirmed: can be)

##### Route: [/](http://www.castlery.com/us)

##### Can Be Hard Code Page?

Due to [home page A/B test in US](https://app.clickup.com/t/86epcx91g) last time, can be a storyblok page, use configuration.

##### Reason

- current home page is consists of hardcoded components and components configured from platforms such as Storyblok and DY
- easy to migrate those widgets logic from hard code to storyblok widgets, keep the same data source which from Storyblok or DY (need UI resource)
- can more flexible
#### Shop The Look Page (confirmed: can be)

##### Route: [/shop-the-look](http://www.castlery.com/us/shop-the-look)

##### Can Be Hard Code Page?

can be a storyblok page, use widgets and configuration.

##### Reason

- we created shop the look widget in Storyblok in PLA refactor
- extra develop work only create a tab widget in Storyblok (need UI resource for check)
- can more flexible
#### Wish List Page (confirmed: not can be)

##### Route: [/wishlist](http://www.castlery.com/us/wishlist)

##### Can Be Hard Code Page?

can be a storyblok page, use widgets.

##### Reason

- we have wishlist data in redux, so don’t need extra data fetch widget or logic
- just change some styles based on product list widgets, then can use for wish list widgets (need UI resource for tab widget check)
- can more flexible
#### Virtual Studio Page (confirmed: can be)

##### Route: [/virtual-studio](http://www.castlery.com/us/virtual-studio)

##### Can Be Hard Code Page?

can be a storyblok page, use widgets.

##### Reason

- virtual studio page only has a iframe in the page content, very easy replace to a storyblok widget (dont need UI resource)
- can more flexible
#### Unsubscribe Page (confirmed: not can be)

##### Route: [/unsubscribe](http://www.castlery.com/us/unsubscribe)

##### Can Be Hard Code Page?

can be a storyblok page, use widgets.

##### Reason

- because page content is not complicated, can easy let it be a storyblok widget (dont need UI resource)
- can more flexible
#### Stay Home Page (confirmed with Zihan, can be migrate, check if have internal link)

##### Route: [/stay-home](http://www.castlery.com/us/stay-home)

##### Can Be Hard Code Page?

can use storyblok configuration

##### Reason

- because many configuration logic in hard code now can migrate to Storyblok
- can more flexible
#### Terms And Condition Page (confirmed: can be)

##### Route: [/terms-of-use](http://www.castlery.com/us/terms-of-use), [/delivery](http://www.castlery.com/us/delivery), [/accessibility](http://www.castlery.com/us/accessibility), [/referral-issue](http://www.castlery.com/us/referral-issue), [/privacy-policy](http://www.castlery.com/us/privacy-policy), [/sales-and-refunds](http://www.castlery.com/us/sales-and-refunds), [/warranty](http://www.castlery.com/us/warranty), [/promo-terms](http://www.castlery.com/us/promo-terms)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because current page content display based on Stroyblok configuration
- can more flexible
#### Help Center Page (confirmed: can be)

##### Route: [/help-center](http://www.castlery.com/us/help-center)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because current page content display based on Stroyblok configuration
- can more flexible
#### Contact Us Page (confirmed: can be a storyblok page/configuration)

##### Route: [/contact-us](http://www.castlery.com/us/contact-us)

##### Can Be Hard Code Page?

can be a hard page

##### Reason

- current page content data from backend
- have form widget need create first if need migrate
#### Trade Page (confirmed: can be a storyblok page/configuration)

##### Route: [/trade](http://www.castlery.com/us/trade)

##### Can Be Hard Code Page?

can be a hard code page

##### Reason

- because not have current similar UI widgets in Stroyblok now, may be need a bit more UI resource and develop resource
#### Press Page (confirmed: can be)

##### Route: [/press](http://www.castlery.com/us/press)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because current page content display based on Stroyblok configuration
- can more flexible
#### Reviews Page (confirmed: can be a hard code)

##### Route: [/reviews](http://www.castlery.com/us/reviews)

##### Can Be Hard Code Page?

recommend to be a hard code page, but can be a storyblok page

##### Reason

- not have current similar UI widgets in Stroyblok now, may be need a bit more UI resource and develop resource
- can consider these UI will be use in other scenes, if it can be widely applied, it can be migrated to Storyblok
#### Swatches Page (confirmed: can be)

##### Route: [/swatches](http://www.castlery.com/us/swatches)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because many configuration logic in hard code now can migrate to Storyblok
- can more flexible
#### Feat Page (confirmed: can be, need wait feedkback)

##### Route: [/feat](http://www.castlery.com/us/feat)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because most of page content is image or banners which have similar style with storyblok banner
- can more flexible
#### New Way Of Living Page (confirmed: checked with Zihan)

##### Route: [/new-way-of-living](http://www.castlery.com/us/new-way-of-living)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because most of page content is image or banners which have similar style with storyblok banner
- can more flexible
#### Delivery Review Page (confirmed: can be a hardcode)

##### Route: [/delivery-review](http://www.castlery.com/us/delivery-review)

##### Can Be Hard Code Page?

can be a hard code page

##### Reason

- because not have current similar UI widgets in Stroyblok now, may be need a bit more UI resource and develop resource
#### Designer Community Page (confirmed: can be)

##### Route: [/designer-community](http://www.castlery.com/us/designer-community)

##### Can Be Hard Code Page?

can be a hard code page

##### Reason

- because not have current similar UI widgets in Stroyblok now, may be need a bit more UI resource and develop resource
#### Referral Page  (confirmed: can be a Storyblok, checked with JieYao)

##### Route: [/referral](http://www.castlery.com/us/referral)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because only has a Yopto plugin block in page content, can easy to migrate
- can more flexible
#### The Castlery Club Page (confirmed: can be a Storyblok)

##### Route: [/the-castlery-club](http://www.castlery.com/us/the-castlery-club)

##### Can Be Hard Code Page?

can be a storyblok page

##### Reason

- because only has a Yotpo plugin block in page content, can easy to migrate
- can more flexible
#### Sitemap Page (confirmed: can be a hardcode)

##### Route: [/sitemap](http://www.castlery.com/us/sitemap)

##### Can Be Hard Code Page?

can be a hard code page

##### Reason

- Although current use storyblok configuration, just it need storyblok page catalog