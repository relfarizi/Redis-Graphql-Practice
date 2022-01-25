import mongoose  from "mongoose";
const schema = mongoose.Schema;

const PersonSchema = new schema({
    first_name : String,
    last_name : String,
    email : String,
    gender : String,
    job : String
})

const Person = mongoose.model('jobs', PersonSchema)

export default Person;