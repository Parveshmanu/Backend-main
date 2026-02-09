import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

    if (!authHeader) {
    return res.status(403).json({ message: "Token required" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "Invalid token format. 'Bearer <token>' required." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("Decoded user:", req.user); 

    next()
  } catch (err) {
    console.error("JWT verification failed", err);

        if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired, please log in again." });
    }
    
    return res.status(401).json({ message: "Invalid token" });
  }
};