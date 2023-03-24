const { db } = require('../utils/db');

function getTotalActiveCustomers() {

    return db.users.count({
        where: {
            role: "CUSTOMER",
            isDeleted: false
        },
    });
};

function getTotalDeletedCustomers() {

    return db.users.count({
        where: {
            role: 'CUSTOMER',
            isDeleted: true
        },
    });
};

async function getTotalCustomers() {

    return await db.users.count({
        where:{
            role:"CUSTOMER"
        }
    });
};

function getMostRecentCustomers(){
    return db.users.findMany({
        where: {
            role: "CUSTOMER"
        },
        orderBy: {
            createdAt:'desc'
        }
    })
}
module.exports = {
    getTotalActiveCustomers,
    getTotalCustomers,
    getTotalDeletedCustomers,
    getMostRecentCustomers
}