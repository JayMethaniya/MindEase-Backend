const userModel = require('../model/user.model');

module.exports.createUser = async ({
    fullName,
    email,
    password,
    
}) => {
    if (!fullName || !email || !password ) {
        throw new Error('All fields are required');
    }
    const user = await userModel.create({
        fullName,
        email,
        password,
       
    });
    return user;
};