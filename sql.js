import pg from "pg";
import 'dotenv/config';
// import toGeoJSON from "util.js"

const pgUSER = process.env.DB_USER;
const pgPASS = process.env.DB_PASS;
const pgURL = process.env.DB_HOST;
const connectionStr = `postgres://${pgUSER}:${pgPASS}@${pgURL}?sslmode=verify-full`
const client = new pg.Client(connectionStr);

export async function queryDB(queryStr){
    const pgUSER = process.env.DB_USER;
    const pgPASS = process.env.DB_PASS;
    const pgURL = process.env.DB_HOST;
    const connectionStr = `postgres://${pgUSER}:${pgPASS}@${pgURL}?sslmode=verify-full`
    const client = new pg.Client(connectionStr);
    await client.connect().catch((error) => {
        console.error(error);
        return null;
    });

    let rtnRes;
    try {
        const res = await client.query(queryStr);
        const data = res.rows;
        rtnRes = res;
        await client.end();
    } catch (err){
        console.error(err);
        await client.end();
    }

    //console.log(rtnRes);
    return rtnRes;
}
export async function getUserInfo(username){
    let userInfo = null;
    queryDB("SELECT u.username, u.firstname, u.lastname, u.email FROM test_carbonseq.user AS u where u.username='"+username+"';").then((dbResult)=>{
        console.log(dbResult)}
    ).catch(err => {
        console.log(err.stack);
    })
    return userInfo;
}

export async function getPlots() {
    const result = await queryDB("select plot.id, plot.pos_x, plot.pos_y, forest.name as forest, reserve.name as reserve from test_carbonseq.plot, test_carbonseq.forest, test_carbonseq.reserve where plot.forest_id = forest.id and plot.reserve_id = reserve.id;")
	.then((dbResult)=>{
        //console.log(dbResult);
        return dbResult.rows;
    }).catch(err => {
        console.log(err.stack);
    }).finally(()=>{})
    const geoJsonObjArr = [];
    let currElem;
    result.map(element => {
        currElem = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(element.pos_x), parseFloat(element.pos_y)]
            },
            properties: {
                id: element.id,
                forest: element.forest,
                reserve: element.reserve,
            }
        }   
        geoJsonObjArr.push(currElem);
    });
    return JSON.parse('{"type": "FeatureCollection","features":' + JSON.stringify(geoJsonObjArr) + '}');
}

export async function getPlotInfo(plot_id) {
    const queryStr = "select p.id, forest.name as forest, reserve.name as reserve, p.pos_x, p.pos_y from test_carbonseq.plot p, test_carbonseq.forest, test_carbonseq.reserve where p.forest_id = forest.id and p.reserve_id = reserve.id and p.id = '"+plot_id.toUpperCase()+"';"
    const result = await queryDB(queryStr)
	.then((dbResult)=>{
        //console.log(dbResult);
        return dbResult.rows;
    }).catch(err => {
        console.log(err.stack);
    }).finally(()=>{})
    const geoJsonObjArr = [];
    let currElem;
    result.map(element => {
        currElem = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(element.pos_x), parseFloat(element.pos_y)]
            },
            properties: {
                id: element.id,
                forest: element.forest,
                reserve: element.reserve,
            }
        }   
        geoJsonObjArr.push(currElem);
    });
    return JSON.parse('{"type": "FeatureCollection","features":' + JSON.stringify(geoJsonObjArr) + '}');
}


// Returns trees in GeoJSON format
export async function getTrees(plot_id) {
    const queryStr = "select * from test_carbonseq.info_tree where info_tree.plot_id = '"+plot_id.toUpperCase()+"' order by info_tree.plot_id;";
    const result = await queryDB(queryStr)
        .then((dbResult)=>{return dbResult.rows})
        .catch(err => {console.log(err.stack)})
    const geoJsonObjArr = [];
    let currElem;
    result.map(element => {
        currElem = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(element.pos_x), parseFloat(element.pos_y)]
            },
            properties: {
                id: element.id,
                plot_id: element.plot_id,
                common_name: element.common_name,
                status: element.status
            }
        }
        geoJsonObjArr.push(currElem);
    });
    return JSON.parse('{"type": "FeatureCollection","features":' + JSON.stringify(geoJsonObjArr) + '}');
}

export async function getAllTrees() {
    const queryStr = "select * from test_carbonseq.info_tree t order by t.plot_id;";
    const result = await queryDB(queryStr)
        .then((dbResult)=>{return dbResult.rows})
        .catch(err => {console.log(err.stack)})
    const geoJsonObjArr = [];
    let currElem;
    result.map(element => {
        currElem = {
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [parseFloat(element.pos_x), parseFloat(element.pos_y)]
            },
            properties: {
                id: element.id,
                plot_id: element.plot_id,
                common_name: element.common_name,
                status: element.status
            }
        }
        geoJsonObjArr.push(currElem);
    });
    return JSON.parse('{"type": "FeatureCollection","features":' + JSON.stringify(geoJsonObjArr) + '}');
}

// Returns a list of measurements for a specific tree
export async function getTreeMeasurements(treeID) {
    const queryStr = "select m.username, g.name as group, m.timestamp, m.measurement from test_carbonseq.measurement m, test_carbonseq.group g where m.treeid = "+treeID+" and m.groupid = g.groupid;"
    const result = await queryDB(queryStr)
        .then((dbResult)=>{return dbResult.rows})
        .catch(err => {console.log(err.stack)})
    const jsonObjArr = []
    let currElem;
    result.map(element => {
        currElem = {
            username: element.username,
            groupid: element.group,
            timestamp: element.timestamp,
            measurement: parseFloat(element.measurement)
        }
        jsonObjArr.push(currElem);
    });
    return JSON.parse('{"id":'+treeID+',"measurements":'+JSON.stringify(jsonObjArr)+'}');
}

