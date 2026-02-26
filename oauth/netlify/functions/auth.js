exports.handler = async (event) => {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const scope = event.queryStringParameters?.scope || "repo,user";
  const siteId = event.queryStringParameters?.site_id || "";

  const state = Math.random().toString(36).substring(2) + Date.now().toString(36);

  const params = new URLSearchParams({
    client_id: clientId,
    scope,
    state,
  });

  return {
    statusCode: 302,
    headers: {
      Location: `https://github.com/login/oauth/authorize?${params.toString()}`,
      "Cache-Control": "no-cache",
    },
  };
};
