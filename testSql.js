import { getPlots, getTrees, queryDB } from "./sql.js";

getTrees().then((dbResult)=>{
    console.log(dbResult);
}).catch(err => {
    console.log(err.stack);
});