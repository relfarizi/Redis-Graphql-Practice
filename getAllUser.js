
import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import Person from "./Models/person.js";
const url = 'mongodb://localhost:27017';

// mongoose.connect(url);

const getAllUser = async () => {
    // const users = await User.find();

    const users = MongoClient.connect(url, (error, db) =>{
        if(error){
            throw error;
        }
        const dbo = db.db('db-redis');
        const result = dbo.collection('jobs').find().toArray((error2, res) => {
            if(error2){
                return [];
            }
            db.close();
            console.log(res.length);
            return res;
        })
        console.log(result);
    })
    console.log(users);
    return JSON.stringify(users);
}

export default getAllUser;
