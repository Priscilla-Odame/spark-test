const express = require("express");
const { getTotalActiveCustomers, getTotalDeletedCustomers, getTotalCustomers, getMostRecentCustomers } = require("../controllers/report.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get('/customer',  async (req, res, next) => {
    try {
        const totalActiveCustomers = await getTotalActiveCustomers();
        const totalDeletedCustomers = await getTotalDeletedCustomers();
        const totalCustomers = await getTotalCustomers();
        const recentCustomers = await getMostRecentCustomers()
        const response = {
            "totalActiveCustomers":totalActiveCustomers,
            "totalDeletedCustomers": totalDeletedCustomers,
            "totalCustomers":totalCustomers,
        }
        res.json(response);
    } catch (err) {
        next(err);
    }
});

module.exports = router;