/**
 * The founding Community members and the requests they raised.
 *
 * Kept separate from the seeding logic so the same data can be loaded either
 * through Prisma (`npm run db:seed`) or over Neon's HTTPS driver, without the
 * two ever drifting apart.
 */
import type { Prisma } from "@prisma/client";

/**
 * NOTE ON SCOPE: this file bootstraps an empty directory. Once someone claims
 * their profile they maintain it themselves, and re-seeding would fight them —
 * `db:seed` matches on an exact name, so a member who capitalises their own
 * name differently gets a duplicate rather than an update. Add people here only
 * before they have an account; afterwards use Admin -> Members.
 */

export interface SeedRequest {
  requesterName: string;
  requesterCompany: string;
  type: string;
  market: string;
  request: string;
  supportNeeded: string;
}

export const members: Prisma.MemberCreateInput[] = [
  {
    name: "Dipendu Biswas",
    company: "Tarisa Technologies",
    roleTitle: "Director",
    baseCountry: "India",
    markets: ["USA", "UAE", "Switzerland", "Africa", "Worldwide"],
    whatTheyDo:
      "Software as a Service for financial institutions to assess the creditworthiness of small and medium businesses using alternative data sources.",
    expertise: ["Fintech", "SME creditworthiness", "Alternative data", "Financial institutions"],
    currentFocus:
      "Evolving the platform based on customer and market feedback, and planning demonstrations in Africa.",
    lookingFor:
      "Introductions to stakeholders and decision-makers in financial institutions, particularly in Africa and other international markets.",
    canOffer: "",
    status: "ACTIVE",
  },
  {
    name: "James Baker",
    company: "Groupe CANAL International Inc.",
    roleTitle: "CEO",
    baseCountry: "Canada",
    markets: ["Canada", "North Africa", "West Africa", "Middle East", "Europe", "Asia"],
    whatTheyDo:
      "International trading company focused on import/export and sourcing of food commodities. The company works on supplier identification, international sourcing, export development, distribution and B2B trade transactions, connecting producers with importers, distributors and institutional buyers.",
    expertise: [
      "Premium Extra Virgin Olive Oil",
      "Fish & seafood — fresh, frozen and canned",
      "Edible vegetable oils",
      "Pulses",
      "Grains",
      "Agricultural commodities",
      "Caviar",
      "Selected premium food products",
    ],
    currentFocus:
      "Expanding an international network of reliable producers, exporters, importers, wholesalers and distributors. Current opportunities particularly involve olive oil, frozen fish and seafood, canned seafood, edible oils, grains and pulses, and other food commodities, with particular interest in African and Middle Eastern markets.",
    lookingFor:
      "Serious importers and distributors; supermarket and retail purchasing networks; food-service and HORECA distributors; reliable manufacturers and producers; seafood importers and wholesalers; government or institutional procurement opportunities; logistics, inspection, customs, trade-finance and market-entry specialists; local representatives or partners.",
    canOffer:
      "Product sourcing, supplier identification, export/import opportunities, introductions to buyers and producers, international trade development and market connections — particularly between Canada, Africa, Europe and the Middle East.",
    status: "ACTIVE",
  },
  {
    name: "Sebastian",
    company: "ITRO — International Trade & Representative Office",
    roleTitle: "",
    baseCountry: "Poland",
    markets: ["Poland", "Europe", "International"],
    whatTheyDo:
      "Export consulting company. ITRO helps manufacturers find new clients and expand into new markets, using HS Code analysis to identify the best markets to enter.",
    expertise: [
      "Export consulting",
      "Market entry",
      "HS Code analysis",
      "Market selection",
      "Manufacturer representation",
    ],
    currentFocus: "Starting a large project to build new international trade infrastructure.",
    lookingFor:
      "Members with an interest in international trade who could take part in the project. The intention is to prepare the project for the Community and gather feedback once it is ready.",
    canOffer:
      "Extensive contacts in the Polish market for members interested in Poland, plus export consulting and market-entry support for manufacturers.",
    status: "ACTIVE",
  },
  {
    name: "Lord JD Waverley",
    company: "LordWaverley",
    roleTitle: "Founder & Executive Chair",
    baseCountry: "United Kingdom",
    markets: [
      "Africa",
      "South America",
      "Middle East",
      "Central Asia",
      "Asia Pacific",
      "Worldwide",
    ],
    whatTheyDo:
      "Cross-border trade and investment support, with particular experience in emerging and developing markets: market entry, strategic partnerships, trade finance, supply chains, structuring, compliance, digital trade tools and international business development. Works through an international network of trade envoys and specialists with country- and region-specific expertise.",
    expertise: [
      "Market entry strategy",
      "Trade missions and matchmaking",
      "Supplier sourcing",
      "Procurement opportunities",
      "Investment attraction",
      "Strategic partner identification",
      "M&A / JV / partnership structuring",
      "Trade finance and structured lending",
      "Governance and compliance",
      "Customs advisory",
      "Risk analysis",
      "Supply chain and logistics",
      "Commodity trading",
      "Projects and PPP planning",
      "Digital trade",
    ],
    currentFocus: "",
    // Left blank deliberately: nothing stated as a current personal need.
    // To be completed by the member directly.
    lookingFor: "",
    canOffer:
      "Market-entry introductions, strategic partners, suppliers, procurement opportunities, trade missions, emerging-market access, investment connections, localisation programmes, trade finance contacts and introductions to trade enablers.",
    website: "https://www.lordwaverley.com",
    status: "ACTIVE",
  },
];

export const requests: SeedRequest[] = [
  {
    requesterName: "Dipendu Biswas",
    requesterCompany: "Tarisa Technologies",
    type: "Introduction / Business Development",
    market: "Africa / Worldwide",
    request:
      "Seeking introductions to financial institutions interested in SME creditworthiness solutions using alternative data.",
    supportNeeded:
      "Introductions to relevant decision-makers and stakeholders in financial institutions.",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Buyers / Distribution",
    market: "Africa / Middle East",
    request:
      "Looking for serious importers and distributors for food commodities including olive oil, seafood, edible oils, grains and pulses.",
    supportNeeded: "",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Retail / HORECA",
    market: "Africa / Middle East",
    request:
      "Seeking introductions to supermarket purchasing networks, retail buyers and food-service/HORECA distributors.",
    supportNeeded: "",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Supplier / Sourcing",
    market: "International",
    request:
      "Looking for reliable manufacturers, producers and exporters of olive oil, seafood, edible oils, grains, pulses and other food commodities.",
    supportNeeded: "",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Seafood",
    market: "Africa / Middle East",
    request:
      "Seeking seafood importers and wholesalers for fresh, frozen and canned seafood products.",
    supportNeeded: "",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Trade Services",
    market: "International / Target Markets",
    request:
      "Looking for logistics, customs, inspection, trade-finance and market-entry specialists who can support international trade transactions.",
    supportNeeded: "",
  },
  {
    requesterName: "James Baker",
    requesterCompany: "Groupe CANAL International Inc.",
    type: "Distribution / Representation",
    market: "Africa / Middle East / International",
    request:
      "Seeking local representatives or commercial partners capable of helping develop specific markets.",
    supportNeeded: "",
  },
  {
    requesterName: "Sebastian",
    requesterCompany: "ITRO — International Trade & Representative Office",
    type: "Project / Collaboration",
    market: "International",
    request:
      "Building new international trade infrastructure and looking for members with an interest in international trade who could take part in the project.",
    supportNeeded:
      "Expressions of interest now, and feedback on the project once it is ready to be presented to the Community.",
  },
];
