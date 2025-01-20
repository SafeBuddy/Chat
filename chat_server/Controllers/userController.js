const userModel = require("../Models/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) =>{
    const jwt_key = process.env.JWT_SECRET_KEY;
    return jwt.sign({_id},jwt_key, {expiresIn: "3d"});
}


const registerUser = async(req, res) => {
    try {
        const {name, username, password} = req.body;
        if(!name || !username || !password) {
            return res.status(400).json({message: "All fields are required"});
        }

        // if(!validator.isStrongPassword(password)){
        //     return res.status(400).json({message: "Password must contain: 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character"});
        // }

        let user = await userModel.findOne({username})
        if(user) {
            return res.status(400).json({message: "Username already exists"});
        }

        user = new userModel({name, username, password});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        
        const token = createToken(user._id);
        res.status(200).json({_id: user._id, name, username, token});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Error registering user: ", error});
    }
};

const loginUser = async(req, res) => {
    const {username, password} = req.body;
    try {
        if (!username || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
    
        
        let user = await userModel.findOne({username});
        if(!user) {
            return res.status(400).json({message: "Invalid username or password"});
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if(!isValidPassword) {
            return res.status(400).json({message: "Invalid username or password"});
        }

        const token = createToken(user._id);
        res.status(200).json({_id: user._id, name: user.name, username, token});
    } catch(error){
        console.log(error);
        res.status(500).json({message: "Error login user: ", error});
    }
};

const findUser = async(req, res) =>{
    const userId = req.params.userId;
    try {
        const user = await userModel.findById(userId);

        res.status(200).json(user);
    } catch(error){
        console.log(error);
        res.status(500).json({message: "Error findUser user: ", error});
    }
};

const getUsers = async(req, res) =>{
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch(error){
        console.log(error);
        res.status(500).json({message: "Error findUser user: ", error});
    }
};

module.exports = {  registerUser, loginUser, findUser, getUsers };