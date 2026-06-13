// GET /api/dashboard  (protected)
const getDashboard = (req, res) => {
  res.json({
    message: `Welcome to MediHist, ${req.user.email}`,
    userId: req.user.id,
  });
};

module.exports = { getDashboard };
