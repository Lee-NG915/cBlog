const express = require("express");
const { AuthorizationCode } = require("simple-oauth2");
const randomstring = require("randomstring");

const app = express();

const config = {
  client: {
    id: process.env.OAUTH_GITHUB_CLIENT_ID,
    secret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://github.com",
    tokenPath: "/login/oauth/access_token",
    authorizePath: "/login/oauth/authorize",
  },
};

const client = new AuthorizationCode(config);

app.get("/auth", (req, res) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: `${process.env.URL || `https://${req.headers.host}`}/callback`,
    scope: req.query.scope || "repo,user",
    state: randomstring.generate(32),
  });
  res.redirect(authorizationUri);
});

app.get("/callback", async (req, res) => {
  try {
    const tokenParams = {
      code: req.query.code,
      redirect_uri: `${process.env.URL || `https://${req.headers.host}`}/callback`,
    };
    const accessToken = await client.getToken(tokenParams);
    const token = accessToken.token.access_token;

    const responseBody = `
      <script>
        (function() {
          function receiveMessage(e) {
            console.log("receiveMessage %o", e);
            window.opener.postMessage(
              'authorization:github:success:${JSON.stringify({ token, provider: "github" })}',
              e.origin
            );
            window.removeEventListener("message", receiveMessage, false);
          }
          window.addEventListener("message", receiveMessage, false);
          window.opener.postMessage("authorizing:github", "*");
        })();
      </script>
    `;
    res.send(responseBody);
  } catch (error) {
    res.status(500).send(`<p>OAuth error: ${error.message}</p>`);
  }
});

app.get("/success", (req, res) => {
  res.send("OAuth authentication successful. You can close this window.");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`OAuth server listening on port ${port}`);
});
