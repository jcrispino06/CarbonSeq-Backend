import { getMeasurements, getPlotInfo, getPlots, getTrees, queryDB } from "./sql.js";

getTrees("a").then((dbResult)=>{
    console.log(dbResult);
}).catch(err => {
    console.log(err.stack);
});