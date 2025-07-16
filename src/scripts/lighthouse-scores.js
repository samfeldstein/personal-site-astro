// ←── Insert your real API key here.
const apiKey = "AIzaSyDZEaRCQCP0oAdNo3Ty4Ttm99ZBCpxY4nA";
const endpoint =
  "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export default async function fetchLighthouseData(target) {
  try {
    const url = new URL(endpoint);
    url.searchParams.set("url", target);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url);

    if (!response.ok) throw new Error(`PageSpeed API error: ${response.status}`);
    const json = await response.json();
    console.log(json);
    
    return json;
  }
  catch (error) {
    console.error(`❌ fetchLighthouseData failed for ${target}`, error);
    // Re-throw so caller knows something went wrong
    throw error;
  }
}
