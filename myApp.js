let  mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });4

const checkDatabase = () => {
    if (mongoose) {
        return { isMongooseOk: !!mongoose.connection.readyState };
    } else {
        return { isMongooseOk: false };
    }
}

const userSchema = new mongoose.Schema({
    username: {type: String, require: true},
})
const exerciseSchema = new mongoose.Schema({
    description: {type: String, require: true},
    duration: {type: Number, require: true},
    date: { type: String,
            validate: {
                validator: (v) => {
                 const re = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
                    return (!v || !v.trim().length) || re.test(v)
            },
                message: "Provide valid date in format YYYY-MM-DD!"
    }}
})
const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);
const createUser = async (username) => {
    const newUser = new User({username});
    return await newUser.save();
}
const createExercise = async ({description, duration, date}) => {
    const newExercise = new Exercise({
        description,
        duration,
        date
    });
    return await newExercise.save();
}
exports.checkDatabase = checkDatabase;
exports.createUser = createUser;
exports.createExercise = createExercise;