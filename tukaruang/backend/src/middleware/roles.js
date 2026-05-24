export const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Autentikasi diperlukan." });
  }

  if (!allowedRoles.includes(req.user.role)) {
    return res
      .status(403)
      .json({ message: "Anda tidak memiliki akses ke resource ini." });
  }

  return next();
};
