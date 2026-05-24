export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan." });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  res.status(error.statusCode || 500).json({
    message: error.message || "Terjadi kesalahan pada server.",
  });
};
