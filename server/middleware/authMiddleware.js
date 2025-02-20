import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extrage token-ul din header

  if (!token) {
    return res.status(401).send("Autentificare necesară.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).send("Token invalid.");
  }
};

export default authMiddleware;
