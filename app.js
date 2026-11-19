// Load HTTP module
import express from 'express';
import https from 'https'; 
import cors from 'cors'; // use to disable cors
import 'dotenv/config';
import fs from 'fs'; // use to get file listing and upload files
import {getPlots, queryDB} from './sql.js';
import {parseHTTPHeader} from './util.js';

// DO NOT EDIT
const app = express();

const hostname = "127.0.0.1";
const PORT = process.env.PORT;
let CertDir = process.env.CERT;
let URL = process.env.DB_HOST;
let cert = "";
let key = "";
let SECRET_KEY = process.env.TOKEN_SECRET_KEY;
//const port = 21962;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function getCert (){
    try {
        let privkey = CertDir + 'privkey.pem';
        let fullchain = CertDir + 'fullchain.pem';

        console.log("privkey is " + privkey);
        console.log("fullchain is " + fullchain);
        console.log("PORT is " + PORT);

        key = await fs.readFileSync(privkey, 'utf8');
        cert = await fs.readFileSync(fullchain, 'utf8');

        let httpsServer = https.createServer({key, cert}, app).listen(PORT);
//app.listen(PORT, () => console.log(`Express server currently running on port ${PORT}`));
        console.log("Started server listening on port " + PORT);
    } catch (err) {
        console.error(err);
    }

    return {key, cert};
};

// Start Editable Section
app.get("/", (req, res, next) => {
    console.log(parseHTTPHeader(req.rawHeaders));
    res.send(req.rawHeaders);
})

let trees = {
    trees:[
      {tag: '43', nameCommon: 'Red Maple', status: 'measured'},
      {tag: '44', nameCommon: 'Red Maple', status: 'measured'},
      {tag: '39', nameCommon: 'Ash', status: 'unmeasured'},
      {tag: '78', nameCommon: 'Red Oak', status: 'measured'}
]};

app.get("/app/trees", (req, res, next) => {
    res.json(trees);
})

app.get("/app/plots", (req, res, next) => {
    getPlots().then((dbResult)=>{
        res.json(dbResult.rows);
    })
})

app.get("/app/user", (req, res, next) => {
    const httpHeader = parseHTTPHeader(req.rawHeaders);
    const username = httpHeader.get("username");
    const password = httpHeader.get("password");
    queryDB("SELECT u.username, u.firstname, u.lastname, u.email FROM test_carbonseq.user AS u where u.username='"+username+"';")
    .then((dbResult)=>{
        res.json(dbResult.rows);
        console.log(dbResult)}
    ).catch(err => {
        console.log(err.stack);
    })
})

app.put("/app/user", (req, res, next)=> {
    const httpHeader = parseHTTPHeader(req.rawHeaders);
    const username = httpHeader.get("username");
    queryDB("SELECT u.username, u.firstname, u.lastname, u.email FROM test_carbonseq.user AS u where u.username='"+username+"';")
    .then((dbResult)=>{
        if (dbResult.rowCount == 0){
            res.json({status:"Available"})
        } else {
            res.json({status:"Unavalible"})
        }

    }).catch(err => {
        console.log(err.stack);
    })
})

app.post('/auth', function(request, response){
    const name = request.body.account;
    const pass = request.body.pass;
    const year = request.body.year;

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, { 'Content-Type': 'text/html'});
    response.write("<h1>Hello " + name + ", welcome to our site!</h1>");
    response.end("<h3>" + year + ", year!</h3>");
});

app.post('/info', function(request, response){
    const name = request.body.name;
    const dob = request.body.dob;
    const pin = request.body.pin;
    const pickNum = request.body.pickNum;
    const emailAddr = request.body.emailAddr;

    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    response.writeHead(200, { 'Content-Type': 'text/html'});
    response.write("<!DOCTYPE html> <html> <head> <title>Info</title></head><body>");
    response.write("<h1>Hello " + name + ", welcome to our site!</h1>");
    response.write("<p>Today is <b>" + dob + "</b></p>");
    response.write("<p>Your pin is <b>" + pin + "</b></p>");
    response.write("<p>Your number is <b>" + pickNum + "</b></p>");
    response.write("<p>Your email address is <b>" + emailAddr + "</b></p>");
    response.write("<h1>Goodbye " + name + ", hope you enjoyed our site!</h1>");
    response.end("</body></html>");

});

// End Editable Section
await getCert();
