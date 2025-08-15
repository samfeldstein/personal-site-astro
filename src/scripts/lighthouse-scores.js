// https://developers.google.com/speed/docs/insights/v5/get-started#javascript

export default async function fetchLighthouseData(target, apiKey) {
  const endpoint =
    'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
  const url = new URL(endpoint);
  url.searchParams.set('url', target)
  url.searchParams.set('key', apiKey)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const json = await response.json()

    // Get lighthouse metrics
    const lighthouse = json.lighthouseResult

    const lighthouseMetrics = {
      performanceScore: Math.round(lighthouse?.categories?.performance?.score * 100),
      fcp:
        lighthouse.audits['first-contentful-paint']?.displayValue,
      speedIndex: lighthouse.audits['speed-index']?.displayValue,
      lcp:
        lighthouse.audits['largest-contentful-paint']?.displayValue,
      blockingTime:
        lighthouse.audits['total-blocking-time']?.displayValue,
      tti: lighthouse.audits['interactive']?.displayValue,
    }

    return lighthouseMetrics

  } catch (error) {
    console.error('Fetching PageSpeed Insights failed:', error)
  }
}
