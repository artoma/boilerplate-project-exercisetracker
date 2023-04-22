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

const formatDate = (date) => {
    let year = date.getFullYear().toString();
    let month = date.getMonth().toString();
    let day = date.getDate().toString();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return year+"-"+month+"-"+day;
}
const createExercise = async ({uid, description, duration, date}) => {
    const user = await User.findById(uid);
    let now = formatDate(new Date(Date.now()));
    let validDate = date ? date : now;

    const newExercise = new Exercise({
        username: user.username,
        description,
        duration: parseInt(duration),
        date: validDate
    });
    await newExercise.save();
    let result = {
        _id: user._id,
        username: user.username,
        date: new Date(validDate).toDateString(),
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
    if(from || to || limit){
        let filteredExercises;
        if(from && to){
           filteredExercises = exercises.filter( ex => (new Date(ex.date) >= new Date(from) && new Date(ex.date) <= new Date(to)));
            result["from"] = new Date(from).toDateString();
            result["to"] = new Date(to).toDateString();
        } else {
            filteredExercises = [...exercises];
        }
        let limitArray;
        if(limit){
            limitArray = filteredExercises.slice(0, limit);
        } else {
            limitArray = filteredExercises;
        }


        result.count = limitArray.length;
        result.log = [...limitArray.map(el => ({
            description: el.description,
            duration: el.duration,
            date: el.date ? dateConvert(el.date) : dateConvert(Date.now())
        }))];
        return result;
    } else {
        result.log = [...exercises.map( el => ({
            description: el.description,
            duration: el.duration,
            date: el.date ? dateConvert(el.date) : dateConvert(Date.now())
        }))];
        return result;
    }

}
const dateConvert = (date) =>  new Date(date).toLocaleDateString("en-US", {
    timeZone: "UTC", weekday: "short", month: "short",
    day: "2-digit", year: "numeric"});

exports.getAllUsers = getAllUsers;
exports.getUserById = getUserById;
exports.getLog = getLog;
exports.getUserByName = getUserByName;
exports.checkDatabase = checkDatabase;
exports.createUser = createUser;
exports.createExercise = createExercise;