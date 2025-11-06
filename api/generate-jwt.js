const jwt = require('jsonwebtoken');

const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY;
const TEAM_ID = process.env.TEAM_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const KEY_ID = process.env.KEY_ID;

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ⚠️ COMMENTÉ TEMPORAIREMENT POUR TEST, Décommentez pour sécuriser votre connexion API avec le SECRET_TOKEN
  /*
  const authHeader = req.headers.authorization;
  const SECRET_TOKEN = process.env.SECRET_TOKEN || 'votre-secret-pour-securiser';
  
  if (authHeader !== `Bearer ${SECRET_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  */

  try {
    const token = jwt.sign(
      {},
      APPLE_PRIVATE_KEY,
      {
        algorithm: 'ES256',
        expiresIn: '180d',
        audience: 'https://appleid.apple.com',
        issuer: TEAM_ID,
        subject: CLIENT_ID,
        header: {
          alg: 'ES256',
          kid: KEY_ID
        }
      }
    );

    return res.status(200).json({
      client_secret: token,
      expires_in: 15552000,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('JWT Generation Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate token',
      details: error.message 
    });
  }
};
