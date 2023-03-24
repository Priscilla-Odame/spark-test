const { db } = require('../utils/db');
const bcrypt = require("bcrypt");

function getAllUsers() {

    return db.users.findMany({
        where: {
            isDeleted: false
        },
    });
};

function getAllCustomers() {

    return db.users.findMany({
        where: {
            isDeleted: false,
            role: "CUSTOMER"
        },
    });
};

function deleteUser(id) {
    return db.users.update({
        where: {
            id,
        },
        data: {
            isDeleted: true
        }
    },)
};

function findEmail(email) {
    return db.users.findFirst({ where: { email: email } });
}

function findUserByEmail(email) {
    return db.users.findUnique({
        where: {
            email,
        },
    });
};

function findUserByPhone(telephone) {
    return db.users.findUnique({
        where: {
            telephone,
        },
    });
};

function createUserByEmailAndPassword(user) {
    user.password = bcrypt.hashSync(user.password, 12);
    console.log(user)
    return db.users.create({
        data: user,
    });
};

function findUserById(id) {
    return db.users.findUnique({
        where: {
            id,
        },
    });
};

function updateUser(userid, userdata) {

    return db.users.update({
        where: {
            id: userid,
        },
        data: userdata,
    });
};

async function updatePassword(userid, userdata) {
    userdata.newpassword = bcrypt.hashSync(userdata.newpassword, 12);
    const oldData = await findUserById(userid);
    const match = await bcrypt.compare(userdata.oldpassword, oldData.password);
    if (!match) return { error: "Incorrect Password" };
    return db.users.update({
        where: {
            id: userid,
        },
        data: {
            password: userdata.newpassword
        },
    });
};

function resetPassword(user) {
    user.password = bcrypt.hashSync(user.password, 12);
    return db.users.update({
        where: {
            id: user.id,
        },
        data: {
            password: user.password,
        },
    });
};

function createUserByEmailAndPassword(user) {
    user.password = bcrypt.hashSync(user.password, 12);
    return db.users.create({
        data: user,
    });
};

module.exports = {
    findUserByEmail,
    findUserById,
    createUserByEmailAndPassword,
    updateUser,
    resetPassword,
    findEmail,
    getAllUsers,
    deleteUser,
    updatePassword,
    getAllCustomers,
    findUserByPhone
};
