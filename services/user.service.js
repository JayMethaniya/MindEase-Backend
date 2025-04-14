const userModel = require('../models/user.model');

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
module.exports.updateUserProfile = async (userId, updatedData) => {
    const user = await userModel.findByIdAndUpdate(userId, updatedData, { new: true });
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};