// Vercel serverless function — proxies requests to Tesla Fleet API
// Bypasses CORS restrictions that block direct browser-to-Tesla API calls.

module.exports = async function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  var token    = req.headers["x-tesla-token"];
  var region   = req.query.region   || "https://fleet-api.prd.na.vn.cloud.tesla.com";
  var endpoint = req.query.endpoint || "/api/1/vehicles";

  if (!token) {
    return res.status(401).json({ error: "Missing X-Tesla-Token header" });
  }

  var allowed = [
    "https://fleet-api.prd.na.vn.cloud.tesla.com",
    "https://fleet-api.prd.eu.vn.cloud.tesla.com",
    "https://fleet-api.prd.cn.vn.cloud.tesla.com",
  ];
  if (allowed.indexOf(region) === -1) {
    return res.status(400).json({ error: "Invalid region" });
  }

  try {
    var response = await fetch(region + endpoint, {
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type":  "application/json",
      },
    });
    var body = await response.text();
    res.status(response.status).send(body);
  } catch (err) {
    res.status(502).json({ error: "Proxy fetch failed: " + err.message });
  }
};
