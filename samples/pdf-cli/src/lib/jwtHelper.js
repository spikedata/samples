const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const util = require("util");

exports.verify = async function (token, jwksUri) {
  const client = jwksClient({
    jwksUri,
  });

  function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      if (err) {
        log.error("getSigningKey failed:", err);
        return callback(err);
      }
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  const verifyAsync = util.promisify(jwt.verify);
  try {
    const decoded = await verifyAsync(token, getKey);
    // console.log("valid token:", JSON.stringify(decoded, null, 2));
    return decoded;
  } catch (err) {
    if (err) {
      log.error("invalid token:", err);
      return false;
    }
  }
};
