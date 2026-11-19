import { getPlots, queryDB } from "./sql.js";

getPlots().then((dbResult)=>{
    console.log(dbResult.rows);
}).catch(err => {
    console.log(err.stack);
});