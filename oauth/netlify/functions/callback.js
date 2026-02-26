const fetch = require("node-fetch");

exports.handler = async (event) => {
  const code = event.queryStringParameters?.code;

  if (!code) {
    return { statusCode: 400, body: "Missing code parameter" };
  }

  try {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.OAUTH_GITHUB_CLIENT_ID,
        client_secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html" },
        body: `<script>
          (function() {
            window.opener.postMessage(
              'authorization:github:error:${JSON.stringify(data)}',
              '*'
            );
          })();
        </script>`,
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html" },
      body: `<script>
        (function() {
          function receiveMessage(e) {
            window.opener.postMessage(
              'authorization:github:success:{"token":"${data.access_token}","provider":"github"}',
              e.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>`,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `OAuth error: ${err.message}`,
    };
  }
};
