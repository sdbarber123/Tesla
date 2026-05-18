// One-time Tesla Fleet API partner registration.
// Visit /api/register once in your browser to register your app with Tesla's servers.
// After success you'll see {"registered": true} and can delete this file.

module.exports = async function (req, res) {
  var clientId     = process.env.TESLA_CLIENT_ID;
  var clientSecret = process.env.TESLA_CLIENT_SECRET;
  var domain       = "project-99clb.vercel.app";
  var region       = "https://fleet-api.prd.na.vn.cloud.tesla.com";

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: "TESLA_CLIENT_ID and TESLA_CLIENT_SECRET environment variables must be set in Vercel."
    });
  }

  try {
    // Step 1: Get a partner token via client_credentials grant
    var tokenRes = await fetch("https://auth.tesla.com/oauth2/v3/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     clientId,
        client_secret: clientSecret,
        scope:         "openid vehicle_device_data",
        audience:      region,
      }).toString(),
    });

    if (!tokenRes.ok) {
      var t = await tokenRes.text();
      return res.status(tokenRes.status).json({ error: "Token fetch failed: " + t });
    }

    var tokenData    = await tokenRes.json();
    var partnerToken = tokenData.access_token;
    if (!partnerToken) {
      return res.status(500).json({ error: "No access_token in token response", data: tokenData });
    }

    // Step 2: Register the app domain with Tesla's Fleet API
    var regRes = await fetch(region + "/api/1/partner_accounts", {
      method:  "POST",
      headers: {
        "Authorization": "Bearer " + partnerToken,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({ domain }),
    });

    var regBody = await regRes.text();

    if (!regRes.ok) {
      return res.status(regRes.status).json({ error: "Registration failed: " + regBody });
    }

    return res.status(200).json({
      registered: true,
      domain,
      response: JSON.parse(regBody),
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
