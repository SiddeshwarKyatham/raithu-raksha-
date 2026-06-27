import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'te';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    logoTitle: "Raithu Raksha",
    logoSubtitle: "Farmer Recovery Platform",
    navHome: "Home",
    navFarmers: "Farmers",
    navImpact: "Impact",
    navReport: "Report Damage",
    navAbout: "About Us",
    navContact: "Contact",
    navAdmin: "NGO Admin",

    // Common Buttons / Actions
    donateNow: "Donate Now",
    pay: "Proceed to Pay",
    viewDetails: "View Details",
    submitReport: "Submit Crop Report",
    back: "Back",
    cancel: "Cancel",
    confirm: "Confirm",
    verified: "Verified",
    pendingVerification: "Pending Verification",
    loading: "Loading...",

    // General Metrics & Labels
    crop: "Crop",
    disaster: "Disaster",
    district: "District",
    village: "Village",
    landArea: "Land Area",
    damage: "Damage Percentage",
    goal: "Goal",
    raised: "Raised",
    age: "Age",
    phone: "Phone Number",
    requestedAmount: "Requested Recovery Amount",
    location: "Location",
    story: "Farmer Story",
    timeline: "Verification Timeline",
    breakdown: "Requirements & Budget Breakdown",
    donors: "Recent Donors",

    // Homepage
    heroTitle: "Empowering Farmers to Recover and Rebuild",
    heroSubtitle: "Direct transparent crowdfunding connecting disaster-struck farmers with compassionate donors for verified crop recovery support.",
    browseCampaigns: "Browse Active Recovery Campaigns",
    reportDamageNow: "Report Crop Damage Now",
    whyTitle: "Why Raithu Raksha?",
    whyDirect: "Direct to Farmer Support",
    whyDirectDesc: "100% of your donation is transferred directly into the verified farmer's recovery timeline and input purchases.",
    whyVerified: "100% NGO Verified",
    whyVerifiedDesc: "Every farmer case is physically audited on the field by local NGO partners, assessing land and crop damages.",
    whyTransparent: "Transparent Progress",
    whyTransparentDesc: "Track each stage from seeds purchased to field sowing via public updates and timeline updates.",
    latestCampaigns: "Latest Campaigns Seeking Support",

    // Report Page
    reportTitle: "Report Crop Damage",
    reportSubtitle: "Are you a farmer or local NGO worker? Report crop failures due to natural disasters to request recovery assistance.",
    farmerNameLabel: "Farmer's Full Name",
    farmerAgeLabel: "Age of the Farmer",
    phoneLabel: "Contact Phone Number",
    districtLabel: "District (e.g. Warangal, Nalgonda)",
    villageLabel: "Village Name",
    cropLabel: "Crop Cultivated (e.g. Cotton, Paddy)",
    disasterLabel: "Disaster Type (e.g. Pest attack, Flood, Drought)",
    landAreaLabel: "Land Area Affected (e.g. 3 Acres)",
    damageLabel: "Estimated Damage (%)",
    reqAmtLabel: "Required Funding (₹)",
    proofLabel: "Photo/Video Proof",
    uploadProof: "Upload clear photo/video showing field crop damage",
    geoLinkLabel: "Google Maps Location Link (Optional)",
    successReport: "Crop report submitted successfully! NGO team will inspect your field shortly.",

    // Success Donation Receipt Screen
    donationSuccess: "Thank You for Your Generous Support!",
    donationSuccessSub: "Your donation has been verified and processed successfully.",
    receiptTitle: "Donation Receipt",
    transactionId: "Transaction / Payment ID",
    orderId: "Order ID",
    amountPaid: "Amount Paid",
    donorName: "Donor Name",
    date: "Date",
    downloadReceipt: "Print / Download Receipt",
    close: "Close",

    // Impact Map Page
    impactTitle: "Our Ground Impact Map",
    impactSubtitle: "Real-time geographical distribution of verified disaster-stricken farmers we support. Click on pins to see local recovery campaigns.",
    activeCases: "Active Recovery Cases",
    fullyRecovered: "Fully Recovered Farmers",
    topDonorsTitle: "Our Top Patrons & Donors"
  },
  te: {
    // Navigation
    logoTitle: "రైతు రక్ష",
    logoSubtitle: "రైతు పునరుద్ధరణ వేదిక",
    navHome: "హోమ్",
    navFarmers: "రైతులు",
    navImpact: "ప్రభావం",
    navReport: "పంట నష్టం నివేదిక",
    navAbout: "మా గురించి",
    navContact: "సంప్రదించండి",
    navAdmin: "NGO అడ్మిన్",

    // Common Buttons / Actions
    donateNow: "ఇప్పుడే విరాళం ఇవ్వండి",
    pay: "చెల్లింపుకు కొనసాగండి",
    viewDetails: "వివరాలు చూడండి",
    submitReport: "పంట నివేదిక సమర్పించండి",
    back: "వెనుకకు",
    cancel: "రద్దు చేయి",
    confirm: "ధృవీకరించు",
    verified: "ధృవీకరించబడింది",
    pendingVerification: "ధృవీకరణ పెండింగ్‌లో ఉంది",
    loading: "లోడ్ అవుతోంది...",

    // General Metrics & Labels
    crop: "పంట",
    disaster: "విపత్తు",
    district: "జిల్లా",
    village: "గ్రామం",
    landArea: "భూమి వైశాల్యం",
    damage: "నష్టం శాతం",
    goal: "లక్ష్యం",
    raised: "సేకరించబడింది",
    age: "వయస్సు",
    phone: "ఫోన్ నంబర్",
    requestedAmount: "అవసరమైన పునరుద్ధరణ మొత్తం",
    location: "ప్రదేశం",
    story: "రైతు కథనం",
    timeline: "ధృవీకరణ కాలక్రమం",
    breakdown: "అవసరాలు & బడ్జెట్ వివరాలు",
    donors: "ఇటీవలి దాతలు",

    // Homepage
    heroTitle: "రైతులు కోలుకోవడానికి మరియు పునర్నిర్మించడానికి తోడ్పడండి",
    heroSubtitle: "విపత్తుల బారిన పడిన రైతులకు నేరుగా, పారదర్శకంగా విరాళాలు అందించి సహాయపడటానికి దాతలను అనుసంధానించే ఏకైక వేదిక.",
    browseCampaigns: "సహాయం కోరుతున్న రైతుల జాబితా",
    reportDamageNow: "పంట నష్టాన్ని ఇప్పుడే నివేదించండి",
    whyTitle: "రైతు రక్ష ఎందుకు?",
    whyDirect: "రైతుకు నేరుగా సహాయం",
    whyDirectDesc: "మీరు అందించే విరాళంలో 100% నేరుగా రైతు ఖాతాలోకి మరియు వ్యవసాయ పెట్టుబడులకు ఉపయోగించబడుతుంది.",
    whyVerified: "100% NGO ధృవీకరణ",
    whyVerifiedDesc: "ప్రతి రైతు కేసును మా స్థానిక NGO భాగస్వాములు స్వయంగా పరిశీలించి నష్టాన్ని అంచనా వేస్తారు.",
    whyTransparent: "పారదర్శక పురోగతి",
    whyTransparentDesc: "విత్తనాల కొనుగోలు నుండి విత్తే వరకు ప్రతి దశను ఆన్‌లైన్ ద్వారా పారదర్శకంగా తెలుసుకోవచ్చు.",
    latestCampaigns: "సహాయం కోసం ఎదురుచూస్తున్న తాజా ప్రచారాలు",

    // Report Page
    reportTitle: "పంట నష్టాన్ని నివేదించండి",
    reportSubtitle: "మీరు ఒక రైతు లేదా స్థానిక NGO కార్యకర్తలా? పునరుద్ధరణ సహాయం కోసం సహజ విపత్తుల వల్ల సంభవించిన పంట నష్టాన్ని ఇక్కడ నివేదించండి.",
    farmerNameLabel: "రైతు పూర్తి పేరు",
    farmerAgeLabel: "రైతు వయస్సు",
    phoneLabel: "సంప్రదించవలసిన ఫోన్ నంబర్",
    districtLabel: "జిల్లా (ఉదా. వరంగల్, నల్గొండ)",
    villageLabel: "గ్రామం పేరు",
    cropLabel: "సాగు చేసిన పంట (ఉదా. పత్తి, వరి)",
    disasterLabel: "విపత్తు రకం (ఉదా. తెగుళ్లు, వరదలు, కరువు)",
    landAreaLabel: "నష్టపోయిన భూమి వైశాల్యం (ఉదా. 3 ఎకరాలు)",
    damageLabel: "అంచనా వేసిన నష్టం (%)",
    reqAmtLabel: "అవసరమైన ఆర్థిక సహాయం (₹)",
    proofLabel: "ఫోటో/వీడియో రుజువు",
    uploadProof: "పంట నష్టాన్ని స్పష్టంగా చూపించే ఫోటో లేదా వీడియోను అప్‌లోడ్ చేయండి",
    geoLinkLabel: "గూగుల్ మ్యాప్స్ లొకేషన్ లింక్ (ఐచ్ఛికం)",
    successReport: "పంట నష్ట నివేదిక విజయవంతంగా సమర్పించబడింది! మా NGO బృందం త్వరలోనే మీ పొలాన్ని తనిఖీ చేస్తుంది.",

    // Success Donation Receipt Screen
    donationSuccess: "మీ ఉదారమైన విరాళానికి ధన్యవాదాలు!",
    donationSuccessSub: "మీ విరాళం విజయవంతంగా ధృవీకరించబడింది మరియు ప్రాసెస్ చేయబడింది.",
    receiptTitle: "విరాళం రశీదు",
    transactionId: "లావాదేవీ / పేమెంట్ ఐడి",
    orderId: "ఆర్డర్ ఐడి",
    amountPaid: "చెల్లించిన మొత్తం",
    donorName: "దాత పేరు",
    date: "తేదీ",
    downloadReceipt: "రశీదు ప్రింట్ / డౌన్‌లోడ్ చేసుకోండి",
    close: "మూసివేయండి",

    // Impact Map Page
    impactTitle: "మా సహాయ క్షేత్ర మ్యాప్",
    impactSubtitle: "ధృవీకరించబడిన విపత్తు బారిన పడిన రైతులకు మేము అందిస్తున్న భౌగోళిక సహాయ వివరణ. వివరాలు చూడటానికి పిన్‌లపై క్లిక్ చేయండి.",
    activeCases: "క్రియాశీల సహాయ ప్రచారాలు",
    fullyRecovered: "పూర్తిగా కోలుకున్న రైతులు",
    topDonorsTitle: "మా ప్రముఖ దాతలు"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved === 'te' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
