const mongoos = require("mongoose")

const userSchema = new mongoos.Schema({
    name: {type: String, required: true, minlength: 3, maxlength:50},
    username: {type: String, required: true, minlength: 3, maxlength:50, unique: true},
    password: {type: String, required: true, minlength: 3, maxlength:1024},
},{
    timestamps: true,
});

const userModel = mongoos.model("User", userSchema);

module.exports = userModel;