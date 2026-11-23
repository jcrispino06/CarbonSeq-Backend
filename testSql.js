import { getAllTrees, getPlotInfo, getPlots, getTreeMeasurements, getTrees, queryDB } from "./sql.js";

getAllTrees().then((result)=>{
    console.log(result)
});