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
        throw(err);
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
    const result = queryDB("select plot.id, forest.name as forest, reserve.name as reserve from test_carbonseq.plot, test_carbonseq.forest, test_carbonseq.reserve where plot.forest_id = forest.id and plot.reserve_id = reserve.id;")
	.then((dbResult)=>{
        //console.log(dbResult);
        return dbResult;
    }).catch(err => {
        console.log(err.stack);
    }).finally(()=>{})
    return result;
}


// Returns trees in GeoJSON format
export async function getTrees() {
    const queryStr = "select t.id, t.plot_id, t.pos_x, t.pos_y from test_carbonseq.tree t where t.pos_x is not null order by t.plot_id;";
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
                coordinates: [element.pos_x, element.pos_y]
            },
            properties: {
                id: element.id,
                plot_id: element.plot_id
            }
        }
        geoJsonObjArr.push(currElem);
    });
    return JSON.parse('{"type": "FeatureCollection","features":' + JSON.stringify(geoJsonObjArr) + '}');
}

