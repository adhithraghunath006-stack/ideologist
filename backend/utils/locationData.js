/**
 * Location Insights Engine
 * 
 * Provides city-based economic benchmarks, Tier classification, cost index,
 * industry clusters, and coordinates for OpenStreetMap visualization.
 * All indicators are illustrative demonstration benchmarks.
 */

const CITY_PROFILES = {
  'Bengaluru': {
    name: 'Bengaluru',
    state: 'Karnataka',
    tier: 'Tier 1',
    costIndex: 1.35, // Higher operating cost index
    marketDensity: 'Very High',
    techTalentIndex: 98,
    lat: 12.9716,
    lon: 77.5946,
    topIndustries: ['FinTech', 'SaaS', 'EdTech', 'EV Charging', 'AI/ML'],
    summary: 'India’s Silicon Valley. High operational cost offset by unmatched venture ecosystem and deep engineering talent pool.'
  },
  'Mumbai': {
    name: 'Mumbai',
    state: 'Maharashtra',
    tier: 'Tier 1',
    costIndex: 1.45,
    marketDensity: 'Extremely High',
    techTalentIndex: 90,
    lat: 19.0760,
    lon: 72.8777,
    topIndustries: ['FinTech', 'Logistics', 'Retail & D2C', 'MediaTech'],
    summary: 'Financial capital of India. Unbeatable access to corporate enterprises, capital markets, and dense consumer purchasing power.'
  },
  'Delhi NCR': {
    name: 'Delhi NCR',
    state: 'Delhi/Haryana/UP',
    tier: 'Tier 1',
    costIndex: 1.25,
    marketDensity: 'Very High',
    techTalentIndex: 88,
    lat: 28.6139,
    lon: 77.2090,
    topIndustries: ['Hyperlocal Commerce', 'Logistics', 'AgriTech', 'D2C', 'CleanTech'],
    summary: 'National capital region with massive consumer base, extensive manufacturing corridors, and policy access.'
  },
  'Hyderabad': {
    name: 'Hyderabad',
    state: 'Telangana',
    tier: 'Tier 1',
    costIndex: 1.15,
    marketDensity: 'High',
    techTalentIndex: 92,
    lat: 17.3850,
    lon: 78.4867,
    topIndustries: ['HealthTech', 'BioTech', 'SaaS', 'EV Charging'],
    summary: 'Rapidly expanding IT and life-sciences hub with cost advantages over Bengaluru and strong government digital infrastructure.'
  },
  'Pune': {
    name: 'Pune',
    state: 'Maharashtra',
    tier: 'Tier 2',
    costIndex: 1.05,
    marketDensity: 'Moderate-High',
    techTalentIndex: 85,
    lat: 18.5204,
    lon: 73.8567,
    topIndustries: ['Automotive & EV', 'Manufacturing', 'EdTech', 'AgriTech'],
    summary: 'Automotive and education powerhouse. Favorable rental rates and abundant university graduates.'
  },
  'Ahmedabad': {
    name: 'Ahmedabad',
    state: 'Gujarat',
    tier: 'Tier 2',
    costIndex: 0.95,
    marketDensity: 'Moderate',
    techTalentIndex: 78,
    lat: 23.0225,
    lon: 72.5714,
    topIndustries: ['Chemicals', 'CleanTech', 'FinTech', 'Supply Chain', 'AgriTech'],
    summary: 'Entrepreneurial heartland with low regulatory friction, low commercial rent, and robust industrial corridors.'
  },
  'Jaipur': {
    name: 'Jaipur',
    state: 'Rajasthan',
    tier: 'Tier 2',
    costIndex: 0.85,
    marketDensity: 'Moderate',
    techTalentIndex: 70,
    lat: 26.9124,
    lon: 75.7873,
    topIndustries: ['Tourism & TravelTech', 'D2C Artisans', 'EdTech', 'AgriTech'],
    summary: 'Emerging Tier-2 startup cluster with significantly lower operating expenses and growing co-working footprint.'
  },
  'Indore': {
    name: 'Indore',
    state: 'Madhya Pradesh',
    tier: 'Tier 2',
    costIndex: 0.80,
    marketDensity: 'Moderate',
    techTalentIndex: 72,
    lat: 22.7196,
    lon: 75.8577,
    topIndustries: ['AgriTech', 'Logistics', 'FoodTech', 'HealthTech'],
    summary: 'Cleanest city in India and central logistics node. Exceptionally low customer acquisition and office overhead costs.'
  },
  'Coimbatore': {
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    tier: 'Tier 2',
    costIndex: 0.82,
    marketDensity: 'Moderate',
    techTalentIndex: 75,
    lat: 11.0168,
    lon: 76.9558,
    topIndustries: ['Hardware & IoT', 'Textiles', 'AgriTech', 'EV Manufacturing'],
    summary: 'Industrial engineering cluster in Southern India known for manufacturing prowess and high hardware R&D density.'
  },
  'Kochi': {
    name: 'Kochi',
    state: 'Kerala',
    tier: 'Tier 2',
    costIndex: 0.88,
    marketDensity: 'Moderate',
    techTalentIndex: 80,
    lat: 9.9312,
    lon: 76.2673,
    topIndustries: ['MarineTech', 'Tourism', 'SaaS', 'HealthTech'],
    summary: 'Coastal tech hub supported by Maker Village and Kerala Startup Mission with high literacy and maritime trade.'
  }
};

function getLocationInsight(cityName, industry = null) {
  const profile = CITY_PROFILES[cityName] || {
    name: cityName || 'General Location',
    state: 'India',
    tier: 'Tier 2',
    costIndex: 1.0,
    marketDensity: 'Moderate',
    techTalentIndex: 70,
    lat: 20.5937,
    lon: 78.9629,
    topIndustries: ['Commerce', 'Services', 'Technology'],
    summary: 'Dynamic regional commercial market with standard operating expense benchmarks.'
  };

  // Industry fit evaluation
  const isTopFit = industry && profile.topIndustries.some(i => i.toLowerCase().includes(industry.toLowerCase()) || industry.toLowerCase().includes(i.toLowerCase()));

  // Suggested alternative locations for industry
  const recommendedAlternatives = Object.values(CITY_PROFILES)
    .filter(c => c.name !== profile.name && c.topIndustries.some(i => industry && (i.toLowerCase().includes(industry.toLowerCase()) || industry.toLowerCase().includes(i.toLowerCase()))))
    .slice(0, 3)
    .map(c => ({
      name: c.name,
      tier: c.tier,
      costIndex: c.costIndex,
      reason: `High cluster density for ${industry} with ${c.tier} cost efficiency.`
    }));

  return {
    profile,
    industryFit: isTopFit ? 'High Strategic Alignment' : 'Moderate Market Fit',
    mapUrl: `https://www.openstreetmap.org/export/embed.html?bbox=${profile.lon - 0.08}%2C${profile.lat - 0.08}%2C${profile.lon + 0.08}%2C${profile.lat + 0.08}&layer=mapnik&marker=${profile.lat}%2C${profile.lon}`,
    externalMapUrl: `https://www.openstreetmap.org/?mlat=${profile.lat}&mlon=${profile.lon}#map=12/${profile.lat}/${profile.lon}`,
    recommendedAlternatives
  };
}

module.exports = {
  CITY_PROFILES,
  getLocationInsight
};
