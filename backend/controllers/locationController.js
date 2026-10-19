const { CITY_PROFILES, getLocationInsight } = require('../utils/locationData');

const locationController = {
  getCities: (req, res) => {
    try {
      const cities = Object.values(CITY_PROFILES);
      return res.json({
        success: true,
        count: cities.length,
        cities
      });
    } catch (err) {
      console.error('getCities error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve city list.' });
    }
  },

  getLocationDetails: (req, res) => {
    try {
      const { city } = req.params;
      const { industry } = req.query;

      const insight = getLocationInsight(city, industry);

      return res.json({
        success: true,
        insight
      });
    } catch (err) {
      console.error('getLocationDetails error:', err);
      return res.status(500).json({ success: false, message: 'Failed to retrieve location details.' });
    }
  }
};

module.exports = locationController;
