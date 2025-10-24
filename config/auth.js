import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";
const EXPIRES_IN = "1h";
const REFRESH_EXPIRES_IN = "7d";

export const generateToken = (payload) =>
  jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);

export const validateToken = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    return next();
  } catch (e) {
    return res
      .status(e.name === "TokenExpiredError" ? 401 : 403)
      .json({ error: e.message });
  }
};
