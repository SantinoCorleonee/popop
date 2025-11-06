// api/apple-callback.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, id_token, state, user } = req.body;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });

    // <-- UTILISE CETTE URL (ta page mobile preview) -->
    const bubbleCallbackUrl = 'https://tirelire-16065.bubbleapps.io/api/1.1/mobile/preview_view=confirmation_view';

    const params = new URLSearchParams({
      code: code,
      state: state || '',
    });
    if (id_token) params.append('id_token', id_token);
    if (user) params.append('user', typeof user === 'object' ? JSON.stringify(user) : user);

    const redirectUrl = `${bubbleCallbackUrl}&${params.toString()}`;

    // 1) Essayer 302 (si le client suit automatiquement)
    try {
      res.writeHead(302, { Location: redirectUrl });
      return res.end();
    } catch (e) {
      // fallback HTML ci-dessous
    }

    // 2) Fallback HTML (meta refresh, JS redirect, form submit)
    const safeRedirect = redirectUrl.replace(/"/g, '%22');
    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta http-equiv="refresh" content="0;url=${safeRedirect}">
          <title>Retour vers l'application…</title>
        </head>
        <body>
          <p>Retour vers l'application…</p>
          <script>
            try {
              // tente d'aller directement vers la page Bubble dans le même WebView
              window.location.replace("${safeRedirect}");
            } catch (e) {
              // lien cliquable en dernier recours
              document.write('<p>Si vous n\\'êtes pas redirigé, <a href="${safeRedirect}" target="_self">cliquez ici</a>.</p>');
            }
          </script>

          <!-- fallback form submit (GET) -->
          <form id="f" action="${safeRedirect}" method="GET" style="display:none;"></form>
          <script>document.getElementById('f').submit();</script>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('Error in Apple callback:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
