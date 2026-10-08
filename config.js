/* =========================================================
   SHANI TRADERS — SITE SETTINGS
   Edit only this file to change shop details.
   Product photos: images/<item code>.jpg (item code is shown in master control).
   ========================================================= */
window.SHOP = {
  name: "Shani Traders",
  nameHi: "शनि ट्रेडर्स",
  tagline: "Building material, Saraipali",
  taglineHi: "बिल्डिंग मटेरियल, सरायपाली",

  // WhatsApp number with country code, digits only (91 + 10-digit mobile)
  whatsapp: "919399893129",
  phone: "+91 93998 93129",
  email: "shanitraders52@gmail.com",

  address: "Main Road, Patsendri, Saraipali, Dist. Mahasamund, Chhattisgarh",
  addressHi: "मेन रोड, पटसेंद्री, सरायपाली, ज़िला महासमुंद, छत्तीसगढ़",
  gstin: "22HEPPP0273E1ZH",
  hours: "Monday to Saturday, 8 am to 8 pm",
  hoursHi: "सोमवार से शनिवार, सुबह 8 से रात 8 बजे",

  // Language shown to a first-time visitor: "en", "hi", or "auto" (Hindi if the phone is set to Hindi)
  defaultLang: "auto",
  mapQuery: "Patsendri, Saraipali, Mahasamund, Chhattisgarh",

  // Paste the Google Apps Script Web App URL here (ends with /exec).
  apiUrl: "https://script.google.com/macros/s/AKfycbx4-LLOOYhSBMiqe9-MOBjXp53IfkUG_TDUmvLQx3cfq1deY-WeYXCpOHnQtZO5Z7-C/exec",

  // How long a visitor's browser keeps the price list before re-checking (minutes)
  cacheMinutes: 5,

  credit: { name: "Weave Solutions", url: "https://weavesolution.com" }
};

/* Categories, in the order a building goes up.
   "id" is what you type in the Category column of the sheet. */
window.CATEGORIES = [
  { id: "cement",     icon: "cement",     name: "Cement, sand & gitti",  nameHi: "सीमेंट, रेत और गिट्टी",   stage: "Foundation",  stageHi: "नींव",
    blurb: "Cement bags, river sand and stone aggregate.", blurbHi: "सीमेंट की बोरियाँ, नदी की रेत और गिट्टी।" },
  { id: "steel",      icon: "steel",      name: "Sariya & steel",        nameHi: "सरिया और स्टील",          stage: "Structure",   stageHi: "ढाँचा",
    blurb: "TMT bars in every size and binding wire.", blurbHi: "हर साइज़ का TMT सरिया और बाइंडिंग तार।" },
  { id: "bricks",     icon: "bricks",     name: "Bricks & blocks",       nameHi: "ईंट और ब्लॉक",            stage: "Walls",       stageHi: "दीवार",
    blurb: "Red clay bricks, fly ash bricks and AAC blocks.", blurbHi: "लाल ईंट, फ्लाई ऐश ईंट और AAC ब्लॉक।" },
  { id: "plumbing",   icon: "plumbing",   name: "Plumbing & sanitary",   nameHi: "प्लंबिंग और सैनिटरी",      stage: "Services",    stageHi: "फ़िटिंग",
    blurb: "Pipes, fittings, taps and water tanks.", blurbHi: "पाइप, फ़िटिंग, नल और पानी की टंकी।" },
  { id: "electrical", icon: "electrical", name: "Electrical",            nameHi: "बिजली का सामान",          stage: "Services",    stageHi: "फ़िटिंग",
    blurb: "House wire, switches and fittings.", blurbHi: "हाउस वायर, स्विच और फ़िटिंग।" },
  { id: "tiles",      icon: "tiles",      name: "Tiles & flooring",      nameHi: "टाइल्स और फ़र्श",          stage: "Finishing",   stageHi: "फ़िनिशिंग",
    blurb: "Floor and wall tiles, tile adhesive.", blurbHi: "फ़र्श और दीवार की टाइल्स, टाइल एडहेसिव।" },
  { id: "paints",     icon: "paints",     name: "Paint & waterproofing", nameHi: "पेंट और वॉटरप्रूफ़िंग",     stage: "Finishing",   stageHi: "फ़िनिशिंग",
    blurb: "Emulsions, putty and waterproofing chemicals.", blurbHi: "इमल्शन, पुट्टी और वॉटरप्रूफ़िंग केमिकल।" },
  { id: "tools",      icon: "tools",      name: "Hardware & tools",      nameHi: "हार्डवेयर और औज़ार",        stage: "Every stage", stageHi: "हर चरण",
    blurb: "Tasla, phawda, line-dori and site tools.", blurbHi: "तसला, फावड़ा, सूत-डोरी और साइट के औज़ार।" }
];
