export const verifyAdmin = (req, res, next) => {
  
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User data not found" });
  }

  console.log("Authenticated user:", req.user);
  
    if (req.user.role === "admin") {
      return next();
    } else {
      return res.status(403).json({ message: 'Access denied, Admins only!' });
    }
  };