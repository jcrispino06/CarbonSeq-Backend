import { getMeasurements, getPlots, getTrees, queryDB } from "./sql.js";

getTrees("A").then((dbResult)=>{
    console.log(dbResult);
}).catch(err => {
    console.log(err.stack);
});