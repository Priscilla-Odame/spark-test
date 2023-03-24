const express = require("express");
const { updateUser, deleteUser, findUserById, getAllUsers, getAllCustomers, updatePassword } = require("../controllers/user.controller");
const { isAuthenticated, isAdmin } = require("../middleware/auth.middleware");

const router = express.Router();

router.get('/', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const user = await getAllUsers();
        for (let c = 0; c < user.length; c++) {
            delete user[c].password;
        }

        res.json(user);
    } catch (err) {
        next(err)
    }
});

router.get('/customers/all', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const customer = await getAllCustomers();
        for (let c = 0; c < customer.length; c++) {
            delete customer[c].password;
        }
        res.json(customer);
    } catch (err) {
        next(err)
    }
});

router.get('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
    id = req.params.id
    try {
        const user = await findUserById(id);
        delete user.password;
        res.json(user);

    } catch (err) {
        next(err)
    }
});

router.delete('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const user = await deleteUser(req.params.id)
        res.status(204).json({ message: `User with id ${req.params.id} deleted successfully` });

    } catch (err) {
        next(err)
    }
});

router.patch('/:id', isAuthenticated, isAdmin, async (req, res, next) => {
    try {
        const user = await updateUser(req.params.id, req.body)
        delete user.password;
        res.json(user)
    } catch (err) {
        next(err)
    }
});

router.patch('/profile/changepassword', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const user = await updatePassword(userId, req.body);
        delete user.password;
        res.json(user)
    } catch (err) {
        next(err)
    }
});

router.patch('/profile/update', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload
        const user = await updateUser(userId, req.body)
        delete user.password;
        res.json(user)
    } catch (err) {
        next(err)
    }
});

router.get('/profile/details', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req.payload;
        const user = await findUserById(userId);
        delete user.password;
        res.json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;