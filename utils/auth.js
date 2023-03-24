const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    return jwt.sign({ userId: user.id, userRole: user.role }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '5h',
    });
}

function generateRefreshToken(user, jti) {
    return jwt.sign({
        userId: user.id,
        userRole: user.role,
        jti,
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '8h',
    });
}

function generateTokens(user, jti) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, jti);

    return {
        accessToken,
        refreshToken,
    };
}
function hashToken(token) {
    return crypto.createHash('sha512').update(token).digest('hex');
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokens,
    hashToken
  };
  