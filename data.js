// Mock data for CRED prototype

const dealPipeline = [
  {
    id: 1,
    org: "Red Bull Racing",
    initials: "RB",
    color: "#1E3A5F",
    logo: "https://logo.clearbit.com/redbullracing.com",
    dealSize: "$2.5M",
    stage: "Negotiation",
    heat: "hot",
    type: "Title Sponsorship",
    contact: "Christian Horner",
    probability: "75%",
    assignee: "Eszter Vass",
    notes: "Multi-year deal discussion. Awaiting board approval on final terms. Strong interest from both sides."
  },
  {
    id: 2,
    org: "Emirates",
    initials: "EK",
    color: "#D71921",
    logo: "https://logo.clearbit.com/emirates.com",
    dealSize: "$4.8M",
    stage: "Offer",
    heat: "hot",
    type: "Kit Sponsorship",
    contact: "Sarah Al-Maktoum",
    probability: "60%",
    assignee: "Eszter Vass",
    notes: "Proposal sent last week. Follow-up meeting scheduled for Friday. Key decision maker engaged."
  },
  {
    id: 3,
    org: "Nike",
    initials: "NK",
    color: "#111111",
    logo: "https://logo.clearbit.com/nike.com",
    dealSize: "$1.2M",
    stage: "First Meeting",
    heat: "medium",
    type: "Apparel Partnership",
    contact: "James Collins",
    probability: "30%",
    assignee: "Alex Turner",
    notes: "Initial discovery call completed. Exploring jersey and training kit partnership options."
  },
  {
    id: 4,
    org: "Coca-Cola",
    initials: "CC",
    color: "#E61A27",
    logo: "https://logo.clearbit.com/coca-cola.com",
    dealSize: "$3.1M",
    stage: "Negotiation",
    heat: "hot",
    type: "Stadium Naming",
    contact: "Maria Rodriguez",
    probability: "90%",
    assignee: "Eszter Vass",
    notes: "Deal signed. Activation plan in progress for Q3 launch at season opener."
  },
  {
    id: 5,
    org: "Adidas",
    initials: "AD",
    color: "#000000",
    logo: "https://logo.clearbit.com/adidas.com",
    dealSize: "$900K",
    stage: "Qualify",
    heat: "cold",
    type: "Event Sponsorship",
    contact: "Thomas Weber",
    probability: "15%",
    assignee: "David Kim",
    notes: "No response to last two outreach attempts. Consider alternative contact at org."
  },
  {
    id: 6,
    org: "AWS",
    initials: "AW",
    color: "#FF9900",
    logo: "https://logo.clearbit.com/aws.amazon.com",
    dealSize: "$1.7M",
    stage: "Negotiation",
    heat: "medium",
    type: "Technology Partnership",
    contact: "Priya Sharma",
    probability: "55%",
    assignee: "Sophie Chen",
    notes: "Technical integration review underway. Legal team reviewing contract terms."
  },
  {
    id: 7,
    org: "Heineken",
    initials: "HK",
    color: "#00A650",
    logo: "https://logo.clearbit.com/heineken.com",
    dealSize: "$2.0M",
    stage: "Offer",
    heat: "cold",
    type: "Hospitality Sponsorship",
    contact: "Jan de Vries",
    probability: "20%",
    assignee: "Laura Martinez",
    notes: "Budget cycle delayed to next quarter. Maintain relationship for future opportunity."
  }
];

// Stage weights for importance scoring (higher = more advanced)
const stageWeights = {
  "Contacted": 0.1,
  "First Meeting": 0.25,
  "Discovery": 0.25,
  "Qualify": 0.4,
  "Qualification": 0.4,
  "Proposal": 0.55,
  "Offer": 0.7,
  "Negotiation": 0.85,
  "Closed Won": 1.0
};

// Activity log per deal (keyed by deal id)
const activityLog = {
  1: [
    { type: "meeting", text: "Contract review meeting with Christian Horner", time: "2 hours ago", icon: "calendar" },
    { type: "email", text: "Sent revised term sheet to Red Bull legal team", time: "6 hours ago", icon: "mail" },
    { type: "note", text: "Board approval expected by end of week", time: "1 day ago", icon: "file" },
    { type: "call", text: "Call with Christian to discuss activation rights", time: "2 days ago", icon: "phone" },
    { type: "update", text: "Deal size updated from $2.2M to $2.5M", time: "3 days ago", icon: "edit" }
  ],
  2: [
    { type: "email", text: "Follow-up email sent to Sarah Al-Maktoum", time: "1 day ago", icon: "mail" },
    { type: "meeting", text: "Presentation to Emirates sponsorship committee", time: "2 days ago", icon: "calendar" },
    { type: "note", text: "Positive feedback on stadium visibility package", time: "3 days ago", icon: "file" }
  ],
  3: [
    { type: "call", text: "Discovery call with James Collins - Nike EMEA", time: "5 days ago", icon: "phone" },
    { type: "email", text: "Sent capabilities deck to Nike partnerships team", time: "8 days ago", icon: "mail" }
  ],
  4: [
    { type: "update", text: "Stage changed to Closed Won", time: "1 day ago", icon: "edit" },
    { type: "meeting", text: "Final signing ceremony with Maria Rodriguez", time: "1 day ago", icon: "calendar" },
    { type: "email", text: "Activation timeline shared with Coca-Cola marketing", time: "2 days ago", icon: "mail" }
  ],
  5: [
    { type: "email", text: "Third outreach attempt to Thomas Weber", time: "16 days ago", icon: "mail" },
    { type: "email", text: "Follow-up email sent", time: "22 days ago", icon: "mail" }
  ],
  6: [
    { type: "meeting", text: "Technical integration review with AWS solutions team", time: "4 days ago", icon: "calendar" },
    { type: "note", text: "Legal team flagged clause 7.2 for renegotiation", time: "6 days ago", icon: "file" }
  ],
  7: [
    { type: "email", text: "Budget cycle update requested from Jan de Vries", time: "18 days ago", icon: "mail" },
    { type: "call", text: "Brief check-in call - budget delayed to Q3", time: "25 days ago", icon: "phone" }
  ]
};

// Company news (keyed by org name) — sourced from Reuters, AP News, Bloomberg + motorsport outlets
const companyNews = {
  "Red Bull Racing": [
    { title: "Oracle Red Bull Racing Unveil 2026 F1 Livery as Ford Powertrains Era Begins", source: "Formula1.com", date: "Feb 13, 2026", url: "https://www.formula1.com/en/latest/article/first-look-red-bull-unveil-striking-new-livery-for-2026-f1-season.61MNwo6zMoxUtOAjS8JH0S" },
    { title: "Red Bull Progress 'Better Than We Hoped For' Says Hadjar After Bahrain Test", source: "Formula1.com", date: "Feb 14, 2026", url: "https://www.formula1.com/en/latest/article/hadjar-calls-red-bulls-progress-better-than-we-hoped-for-as-he-praises.4Mnc6unLMrfm3nDvrJiyhY" },
    { title: "Red Bull Confirm Weight Challenge with 2026 RB22 Ahead of New Season", source: "RacingNews365", date: "Feb 15, 2026", url: "https://racingnews365.com/red-bull-confirm-problem-with-2026-f1-car" },
    { title: "F1 2026 Uncovered: The Design Clues That Red Bull Renders Reveal", source: "PlanetF1", date: "Feb 14, 2026", url: "https://www.planetf1.com/features/f1-2026-uncovered-red-bull-racing-bulls-render-design-clues" },
    { title: "Red Bull Reveals Refreshed 2026 F1 Livery at Detroit Launch Event", source: "Motorsport.com", date: "Feb 13, 2026", url: "https://www.motorsport.com/f1/news/red-bull-reveals-refreshed-2026-f1-livery-at-detroit-launch/10790360/" },
    { title: "Mercedes, Red Bull and the 2026 Engine Loophole Controversy Explained", source: "Motorsport.com", date: "Feb 11, 2026", url: "https://www.motorsport.com/f1/news/mercedes-red-bull-and-the-2026-engines-whats-behind-the-recent-fuss-in-f1/10786380/" }
  ],
  "Emirates": [
    { title: "Emirates Airline Expands Sponsorship Portfolio with Women's Sports Focus", source: "SportBusiness", date: "Feb 15, 2026", url: "#" },
    { title: "Emirates Renews Arsenal Shirt Deal for Additional 3 Years", source: "Sky Sports", date: "Feb 10, 2026", url: "#" }
  ],
  "Nike": [
    { title: "Nike Q3 Earnings Beat Expectations, Digital Sales Up 22%", source: "Bloomberg", date: "Feb 13, 2026", url: "#" },
    { title: "Nike Announces Sustainable Sportswear Line for Major Leagues", source: "Reuters", date: "Feb 9, 2026", url: "#" }
  ],
  "Coca-Cola": [
    { title: "Coca-Cola Increases Sports Marketing Budget by 18% for 2026", source: "Ad Age", date: "Feb 11, 2026", url: "#" },
    { title: "Coca-Cola to Become Lead Sponsor of New MLS Expansion Team", source: "ESPN", date: "Feb 6, 2026", url: "#" }
  ]
};

// Contact profiles (keyed by name)
const contactProfiles = {
  "Christian Horner": {
    title: "Team Principal & CEO",
    company: "Red Bull Racing",
    location: "Milton Keynes, UK",
    linkedin: "https://www.linkedin.com/in/christian-horner",
    experience: "20+ years in motorsport management",
    connections: 12500,
    mutual: 8
  },
  "Sarah Al-Maktoum": {
    title: "VP Global Sponsorships",
    company: "Emirates Group",
    location: "Dubai, UAE",
    linkedin: "https://www.linkedin.com/in/sarah-almaktoum",
    experience: "15 years in sports marketing & partnerships",
    connections: 8900,
    mutual: 5
  },
  "James Collins": {
    title: "Director of Sports Partnerships, EMEA",
    company: "Nike, Inc.",
    location: "London, UK",
    linkedin: "https://www.linkedin.com/in/jamescollins-nike",
    experience: "12 years in brand partnerships & sports marketing",
    connections: 6200,
    mutual: 3
  },
  "Maria Rodriguez": {
    title: "Head of Sports & Entertainment Partnerships",
    company: "The Coca-Cola Company",
    location: "Atlanta, GA, USA",
    linkedin: "https://www.linkedin.com/in/maria-rodriguez-coca-cola",
    experience: "18 years in sponsorship strategy",
    connections: 11000,
    mutual: 6
  },
  "Thomas Weber": {
    title: "Senior Manager, Event Sponsorships",
    company: "Adidas AG",
    location: "Herzogenaurach, Germany",
    linkedin: "https://www.linkedin.com/in/thomas-weber-adidas",
    experience: "10 years in event & sports sponsorship",
    connections: 4500,
    mutual: 2
  },
  "Priya Sharma": {
    title: "Global Sports Technology Lead",
    company: "Amazon Web Services",
    location: "Seattle, WA, USA",
    linkedin: "https://www.linkedin.com/in/priya-sharma-aws",
    experience: "8 years in technology partnerships",
    connections: 7800,
    mutual: 4
  },
  "Jan de Vries": {
    title: "Director of Hospitality & Events",
    company: "Heineken N.V.",
    location: "Amsterdam, Netherlands",
    linkedin: "https://www.linkedin.com/in/jan-devries-heineken",
    experience: "14 years in hospitality sponsorship",
    connections: 5600,
    mutual: 3
  }
};

const contacts = [
  "Christian Horner",
  "Sarah Al-Maktoum",
  "James Collins",
  "Maria Rodriguez",
  "Thomas Weber",
  "Priya Sharma",
  "Jan de Vries",
  "Alex Turner",
  "Sophie Chen",
  "David Kim",
  "Laura Martinez",
  "Michael O'Brien",
  "Emma Wilson",
  "Carlos Ruiz"
];

const latestDeals = [
  {
    org: "PepsiCo",
    initials: "PC",
    color: "#004B93",
    logo: "https://logo.clearbit.com/pepsico.com",
    date: "Feb 14, 2026",
    seller: "Manchester City FC",
    type: "Sponsorship"
  },
  {
    org: "Rolex",
    initials: "RX",
    color: "#006039",
    logo: "https://logo.clearbit.com/rolex.com",
    date: "Feb 12, 2026",
    seller: "Formula 1",
    type: "Sponsorship"
  },
  {
    org: "Samsung",
    initials: "SM",
    color: "#1428A0",
    logo: "https://logo.clearbit.com/samsung.com",
    date: "Feb 10, 2026",
    seller: "Real Madrid CF",
    type: "Sponsorship"
  },
  {
    org: "Mastercard",
    initials: "MC",
    color: "#EB001B",
    logo: "https://logo.clearbit.com/mastercard.com",
    date: "Feb 8, 2026",
    seller: "UEFA Champions League",
    type: "Sponsorship"
  },
  {
    org: "Visa",
    initials: "VI",
    color: "#1A1F71",
    logo: "https://logo.clearbit.com/visa.com",
    date: "Feb 5, 2026",
    seller: "FIFA World Cup",
    type: "Sponsorship"
  }
];

// Favorite Contacts for widget library
const favoriteContacts = [
  { name: "Christian Horner", company: "Red Bull Racing", initials: "CH", color: "#1E3A5F" },
  { name: "Sarah Al-Maktoum", company: "Emirates Group", initials: "SA", color: "#D71921" },
  { name: "Maria Rodriguez", company: "Coca-Cola", initials: "MR", color: "#E61A27" },
  { name: "Priya Sharma", company: "AWS", initials: "PS", color: "#FF9900" },
  { name: "James Collins", company: "Nike", initials: "JC", color: "#111111" }
];

// Favorite Companies for widget library
const favoriteCompanies = [
  { name: "Red Bull Racing", initials: "RB", color: "#1E3A5F", industry: "Motorsport", logo: "https://logo.clearbit.com/redbullracing.com" },
  { name: "Emirates", initials: "EK", color: "#D71921", industry: "Aviation", logo: "https://logo.clearbit.com/emirates.com" },
  { name: "Nike", initials: "NK", color: "#111111", industry: "Sportswear", logo: "https://logo.clearbit.com/nike.com" },
  { name: "Coca-Cola", initials: "CC", color: "#E61A27", industry: "Beverages", logo: "https://logo.clearbit.com/coca-cola.com" },
  { name: "AWS", initials: "AW", color: "#FF9900", industry: "Technology", logo: "https://logo.clearbit.com/aws.amazon.com" }
];

// Expiring Deals for widget library
const expiringDeals = [
  { org: "Red Bull Racing", contact: "Christian Horner", value: "$2.5M", expiryDate: "Mar 1, 2026", initials: "RB", color: "#1E3A5F" },
  { org: "Emirates", contact: "Sarah Al-Maktoum", value: "$4.8M", expiryDate: "Mar 15, 2026", initials: "EK", color: "#D71921" },
  { org: "AWS", contact: "Priya Sharma", value: "$1.7M", expiryDate: "Apr 2, 2026", initials: "AW", color: "#FF9900" },
  { org: "Heineken", contact: "Jan de Vries", value: "$2.0M", expiryDate: "Apr 20, 2026", initials: "HK", color: "#00A650" }
];
