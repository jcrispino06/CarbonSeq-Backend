import { getPlotInfo, getPlots, getTreeMeasurements, getTrees, queryDB } from "./sql.js";

getTreeMeasurements(263).then((result)=>{
    console.log(result)
});