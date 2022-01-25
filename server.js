import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import mongoose from 'mongoose';
import redis from "redis";
import Person from "./Models/person.js";

const url = 'mongodb://localhost:27017/db-redis';

mongoose.connect(url);
const db = mongoose.connection;
db.on('error', (error)=> console.error(error));
db.once('open', () => console.log('Database Connected'));

const client = redis.createClient({
    legacyMode: true
});
await client.connect();
client.on('connect', function() {
    console.log('Connected!');
});
client.on("error", (error) => {
    console.log(error);
})

const app = express();
app.get("/", async (req, res) => {
    const searchTerm = req.query.job;
    const job = {job : new RegExp(searchTerm)};
    try {
        client.get(searchTerm, async (error, peopleData) => {
            if(error){
                throw error;
            }
            if(peopleData){
                res.status(200).send({
                    message: "from redis",
                    total: JSON.parse(peopleData).length,
                    data: JSON.parse(peopleData)
                })
                return;
            }

            const person = await Person.find(job);
            client.setEx(searchTerm,600, JSON.stringify(person));
            res.send({
                message: "from db",
                total : person.length,
                data : person
            })
        })
    } catch (error) {
        console.log(error);
        res.status(500).send({message: error.message});    
    }
})

// ------ GRAPHQL ---------
const schema = buildSchema(`
type Person {
    id : ID!,
    first_name : String,
    last_name : String,
    email : String,
    gender : String,
    job : String
}
type Query {
    people : [Person!]!
}
`);

const people = await Person.find().limit(5);
const root = {
    people: () =>  {
        return people;
    }
}

app.use('/graphql', graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}))

app.listen(3000, () => {
    console.log("Node server started");
})