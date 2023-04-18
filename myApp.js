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
    username: {type: String},
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
const getUserByName = async (username) => {
    return  User.findOne({username: username})
}
const getAllUsers = async () => {
    return  User.find({});
}
const getUserById = async (uid) => {
    return User.findById(uid);
}
const createExercise = async ({uid, description, duration, date}) => {
    const user = await User.findById(uid);
    const newExercise = new Exercise({
        username: user.username,
        description,
        duration: parseInt(duration),
        date
    });
    await newExercise.save();
    let result = {
        _id: user._id,
        username: user.username,
        date: new Date(date).toDateString(),
        duration: parseInt(duration),
        description
    }
    return result;
}

const getLog = async ({uid, from, to, limit}) => {
    const user = await User.findById(uid);
    const exercises = await Exercise.find({username: user.username})
    let result = {
        _id: user._id,
        username: user.username,
        count: exercises.length,
        log: undefined
    }
    if(from && to && limit){
        const filteredExercises = exercises.filter( ex => (new Date(ex.date) >= new Date(from) && new Date(ex.date) <= new Date(to)))
        const limitArray = filteredExercises.slice(0, limit);
        result["from"] = new Date(from).toDateString(),
        result["to"] = new Date(to).toDateString(),
        result.count = limitArray.length;
        result.log = [...limitArray.map(el => ({
            description: el.description,
            duration: el.duration,
            date:new Date(el.date).toDateString()
        }))];
        return result;
    } else {
        result.log = [...exercises.map( el => ({
            description: el.description,
            duration: el.duration,
            date:new Date(el.date).toDateString()
        }))];
        return result;
    }

}

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getLog = getLog;
exports.getUserByName = getUserByName;
exports.checkDatabase = checkDatabase;
exports.createUser = createUser;
exports.createExercise = createExercise;