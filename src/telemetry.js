export function projectCount(year, base = 12846) {
  return Math.round(base * Math.pow(1.49, Number(year) - 2026));
}
export function filterClusters(clusters, { search = '', region = 'all', model = 'all' } = {}) {
  const regions = { americas: ['United States','Canada','Brazil','Chile'], europe: ['France','United Kingdom','Germany','Netherlands','Sweden'], asia: ['Japan','China','Singapore','India','South Korea','United Arab Emirates'], africa: ['South Africa'], oceania: ['Australia'] };
  return clusters.filter(c => `${c.location.city} ${c.location.country} ${c.clusterId}`.toLowerCase().includes(search.toLowerCase()) && (region === 'all' || regions[region]?.includes(c.location.country)) && (model === 'all' || c.activeModels.some(m => m.name.startsWith(model))));
}
export class TelemetryAPI {
  async load() {
    const response = await fetch(`${import.meta.env.BASE_URL}data.json`);
    if (!response.ok) throw new Error(`Cluster data could not load (${response.status}). Reload to retry.`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length || data.some(c => !c.clusterId || !Array.isArray(c.coordinates) || c.coordinates.length !== 2 || !c.coordinates.every(Number.isFinite) || !c.activeModels?.length || !c.cybersecurity || !c.infrastructure || !c.location?.city)) throw new Error('Cluster data has an invalid schema. Check data.json.');
    return data;
  }
}
