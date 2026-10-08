# Shani Traders website

## Files in the GitHub repo
Upload these to the main (root) folder of the repo:

index.html, products.html, product.html, enquiry.html, about.html, contact.html, calculator.html, admin.html,
style.css, config.js, lang.js, app.js, calc.js, admin.js, starter-items.json, README.md

Create one folder named `images` and put favicon.svg and all product photos in it.

`Code.gs` does not go on GitHub. It lives only in Apps Script.

## Hindi / English
- Every page has a हिंदी / English button in the header. The choice is remembered on that phone.
- First-time visitors: set `defaultLang` in config.js to "en", "hi" or "auto" (Hindi when the phone is in Hindi).
- To share a page in Hindi, add `?lang=hi` to the link, e.g. yoursite/calculator.html?lang=hi
- All website wording is in lang.js (English first, Hindi below). Edit there to change any text.
- Item names: each item has optional "Name in Hindi" and "Description in Hindi" in master control.
  Items without them show the English name. If you loaded the starter items earlier,
  click **Add Hindi names** in master control to fill them in one click.

## Material calculator (calculator.html)
Brick wall, concrete (slab, beam, column, footing), plaster, floor tiles and paint.
Customers enter sizes in feet and get bricks, cement bags, sand and gitti trolleys (1 trolley = 100 cft), sariya, tiles, putty and paint.
"Add to enquiry list" puts the result straight into their enquiry. The rules used are shown under "How this is worked out" on the page,
and the numbers can be adjusted at the top of calc.js.

## Product photos
Photos are added from master control and stored in your Google Drive, in a folder named
"Shani Traders website photos" (created automatically). Nothing needs uploading to GitHub.

- **Add missing photos** (button above the item list): finds a free photo online for every item
  without one. Use this once after loading the starter items, then check each photo.
- **Edit > Upload photo**: take or pick a photo on your phone. It is shrunk to about 150 KB before upload.
- **Edit > Find photo online**: choose from free photos. Type other words to search again.
- **Edit > Remove**: deletes the photo (the old file goes to Drive trash).

Online photos come from Wikimedia Commons, where every photo is free to use with credit.
The credit is saved with the item and shown under the photo on the product page. Replace them
with photos of your own stock when you can; real shop photos sell better.

Optional: a photo named `item-code.jpg` in the GitHub `images` folder is used when an item has no Drive photo.

## Apps Script: update to this version (needed for photos and Hindi names)
1. Open the Sheet > Extensions > Apps Script. Select all the old code, delete it, paste the new Code.gs, save.
2. Choose `authorize` in the function dropdown, click Run, and allow the permissions
   (Google Drive for photos, external service for online photos).
   If Google says "app isn't verified": Advanced > Go to project (unsafe) > Allow. This is your own script.
3. Deploy > Manage deployments > pencil icon > Version: New version > Deploy. The /exec URL stays the same.

Check it works: open the /exec URL in a browser. It should show text starting with {"ok":true,"products":[

## First login
Open yoursite/admin.html, enter the admin key from the setup() log, click "Load starter items" (or add your own), then fill in prices.
Items with no price show "Ask for price".

## Notes
- In stock off: shows "Out of stock", add button disabled.
- Show on site off: hidden from the website, kept in the sheet.
- Show on rate board: appears in "Today's rates" on the home page (up to 7).
- Price changes reach visitors within about 5 minutes.
- If you edit the Products sheet by hand, run `refreshSite` in Apps Script so the site updates at once.
