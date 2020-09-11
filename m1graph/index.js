const appInsights = require("applicationinsights");
// const appInsightsKey = process.env["APPINSIGHTS_INSTRUMENTATIONKEY"];
// console.log(`APPINSIGHTS_INSTRUMENTATIONKEY: ${appInsightsKey}`)
// using environment variables for instrumentationKeys
appInsights
  .setup()
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .setSendLiveMetrics(true)
  .setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
  .start();
appInsights.defaultClient.context.tags["ai.cloud.role"] = process.env[
  "APPSETTING_WEBSITE_SITE_NAME"
]
  ? process.env["APPSETTING_WEBSITE_SITE_NAME"]
  : appInsights.defaultClient.context.tags["ai.cloud.role"];
const util = require("util");

const nodeoutlook = require("nodejs-nodemailer-outlook");
const {
  ApolloServer,
  gql,
  graphiqlAzureFunctions,
} = require("apollo-server-azure-functions");
const GraphQLJSON = require("graphql-type-json");
const axios = require("axios");
const sql = require("mssql");
const uuidv4 = require("uuid/v4");
const { CosmosClient } = require("@azure/cosmos");
const Gremlin = require("gremlin");
const context = require("./function.json");
const typeDefs = require("./schema");

//SQL Server
const connectionString =
  "Driver={ODBC Driver 13 for SQL Server};Server=tcp:m1data.database.windows.net,1433;Database=m1core;Uid=m1admin;Pwd={your_password_here};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30";
const config = {
  user: "m1admin",
  password: "makethemarket2019!",
  server: "m1data.database.windows.net",
  //server: 'gsdatabase.database.windows.net',
  port: 1433,
  database: "m1core",
  requestTimeout: 300000,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    parseJSON: true, //use for SQL JSON support
  },
};

//cosmos
let cosmosConfig;
let configGraph;
let tenant = process.env["tenant"];

console.log(`connecting to tenant: ${tenant}`);

//add look to tenant's cosmos to get configs in future
if (tenant === "m1c1") {
  cosmosConfig = {
    endpoint: "https://m1cosmos.documents.azure.com:443/",
    key:
      "cXjIbIzaD3WoKBZRS9WNps5uzVPIZ9856iyU4wPRkWWKH9r09ZDfYQ8hJClNCRTtDI44TKbw7LIlBJBNbY6sjw==",
    databaseId: "m1c1",
  };
  configGraph = {
    endpoint: "wss://m1graphdb.gremlin.cosmos.azure.com:443/",
    primaryKey:
      "A1Tsm4BVlZs4jakwGZvTjNDROWkS0v6V6lB8fNiNhPsPabzs0waGSFORzqHr8frOizgUTtW7vctEOb52JPp9Fg==",
    database: "m1c1",
    collection: "m1graph",
  };
} else if (tenant === "m1c2") {
  cosmosConfig = {
    endpoint: "https://m1cosmos.documents.azure.com:443/",
    key:
      "cXjIbIzaD3WoKBZRS9WNps5uzVPIZ9856iyU4wPRkWWKH9r09ZDfYQ8hJClNCRTtDI44TKbw7LIlBJBNbY6sjw==",
    databaseId: "m1c2",
  };
  configGraph = {
    endpoint: "wss://m1graphdb.gremlin.cosmos.azure.com:443/",
    primaryKey:
      "A1Tsm4BVlZs4jakwGZvTjNDROWkS0v6V6lB8fNiNhPsPabzs0waGSFORzqHr8frOizgUTtW7vctEOb52JPp9Fg==",
    database: "m1c2",
    collection: "m1graph",
  };
} else {
  cosmosConfig = {
    endpoint: "https://m1cosmos.documents.azure.com:443/",
    key:
      "cXjIbIzaD3WoKBZRS9WNps5uzVPIZ9856iyU4wPRkWWKH9r09ZDfYQ8hJClNCRTtDI44TKbw7LIlBJBNbY6sjw==",
    databaseId: "core",
  };
  configGraph = {
    endpoint: "wss://m1graphdb.gremlin.cosmos.azure.com:443/",
    primaryKey:
      "A1Tsm4BVlZs4jakwGZvTjNDROWkS0v6V6lB8fNiNhPsPabzs0waGSFORzqHr8frOizgUTtW7vctEOb52JPp9Fg==",
    database: "m1graphdb",
    collection: "m1graph",
  };
}

//Mongodb Connection
let MONGODB_CONNECTION_STRING = process.env["MONGODB_CONNECTION_STRING"];
let MongoConnection = require("./mongo/mongoConnection").connect(
  MONGODB_CONNECTION_STRING
); //Creating Mongodb Azure Connection
let MongoDb = require("./mongo/models")(MongoConnection);
//External resolvers
let { QueryResolvers, MutationResolvers } = require("./resolvers")(MongoDb);

const client = new CosmosClient(cosmosConfig);

let authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(
  `/dbs/${configGraph.database}/colls/${configGraph.collection}`,
  configGraph.primaryKey
);

const clientGraph = new Gremlin.driver.Client(configGraph.endpoint, {
  authenticator,
  traversalsource: "g",
  rejectUnauthorized: true,
  mimeType: "application/vnd.gremlin-v2.0+json",
});

async function sendMail({ subject, html }) {
  return new Promise((resolve, reject) => {
    nodeoutlook.sendEmail({
      auth: {
        user: "admin@m1neral.com", // email of account to send from
        pass: "M1neral20!9", // pw of account to send email from
      },
      from: `admin@m1neral.com`,
      to: "support@m1neral.com",
      bcc: "jacob@m1neral.com",
      subject,
      html,
      onError: (e) => {
        console.log(e);

        reject({
          success: false,
          message: "failed to send email",
        });
      },
      onSuccess: (i) => {
        console.log(i);

        resolve({
          success: true,
          message: "email sent successfully",
          // titleOpinion: result,
        });
      },
    });
  });
}

/*************cosmosdb************* */

// async function upsertUser(User) {
//   const databaseId = { id: "core" };
//   const database = await client.databases.createIfNotExists(databaseId);
//   console.log("created database");
//   const containerId = { id: "Users" };
//   const { container } = await client
//     .database(databaseId.id)
//     .containers.createIfNotExists(containerId);

//   const { item } = await client
//     .database(databaseId.id)
//     .container(containerId.id)
//     .items.upsert(User);
//   return User;
// }

async function upsertTitleOpinion(titleOpinion) {
  const databaseId = { id: cosmosConfig.databaseId };
  const database = await client.databases.createIfNotExists(databaseId);
  console.log("created database");
  const containerId = { id: "TitleOpinions" };
  const { container } = await client
    .database(databaseId.id)
    .containers.createIfNotExists(containerId);
  const { item } = await client
    .database(databaseId.id)
    .container(containerId.id)
    .items.upsert(titleOpinion);
  return titleOpinion;
}

async function getTitleOpinions() {
  const databaseId = { id: cosmosConfig.databaseId };
  const database = await client.databases.createIfNotExists(databaseId);
  const containerId = { id: "TitleOpinions" };
  const { container } = await client
    .database(databaseId.id)
    .containers.createIfNotExists(containerId);
  let querySpec = "";
  /* if(id){
    
    querySpec = {
      query: `SELECT * FROM c WHERE c.id = ${id}`
   };
  }
  else { */
  querySpec = {
    query: "SELECT * FROM c",
    // };
  };
  const { resources: results } = await client
    .database(databaseId.id)
    .container(containerId.id)
    .items.query(querySpec)
    .fetchAll();
  return results;
}
// async function getUsers(ids) {
//   const databaseId = { id: cosmosConfig.databaseId };
//   const database = await client.databases.createIfNotExists(databaseId);
//   const containerId = { id: "Users" };
//   const { container } = await client
//     .database(databaseId.id)
//     .containers.createIfNotExists(containerId);
//   let querySpec = "";
//   if (ids) {
//     querySpec = {
//       query: `SELECT * FROM c WHERE c.id IN (${ids})`,
//       //query: 'SELECT * FROM c WHERE ARRAY_CONTAINS('+ids+', c.Id)'
//     };
//   } else {
//     querySpec = {
//       query: "SELECT * FROM c",
//     };
//   }
//   const { resources: results } = await client
//     .database(databaseId.id)
//     .container(containerId.id)
//     .items.query(querySpec)
//     .fetchAll();
//   return results;
// }

// async function getUser(id) {
//   const collectionDefinition = { id: "Users" };
//   const { container } = await database.containers.create(collectionDefinition);

//   const querySpec = {
//     query: "SELECT * FROM c WHERE c.id = @id",
//     parameters: [
//       {
//         name: "@id",
//         value: id,
//       },
//     ],
//   };
//   const { results } = await client
//     .database(databaseId)
//     .container(containerId)
//     .items.query(querySpec, { enableCrossPartitionQuery: true })
//     .fetchAll();
//   return results;
// }
// async function getTenant(tenantId) {
//   const dbId = { id: cosmosConfig.databaseId };
//   const database = await client.databases.createIfNotExists(dbId);
//   const containerId = { id: "Tenants" };
//   const { container } = await client
//     .database(dbId.id)
//     .containers.createIfNotExists(containerId);

//   const querySpec = {
//     query: "SELECT * FROM c WHERE c.tenant = @id",
//     parameters: [
//       {
//         name: "@id",
//         value: tenantId,
//       },
//     ],
//   };
//   const { resources } = await client
//     .database(dbId.id)
//     .container(containerId.id)
//     .items.query(querySpec, { enableCrossPartitionQuery: true })
//     .fetchAll();
//   return resources[0];
// }
// async function getUserByEmail(email) {
//   const databaseId = { id: cosmosConfig.databaseId };
//   const database = await client.databases.createIfNotExists(databaseId);
//   const containerId = { id: "Users" };
//   const { container } = await client
//     .database(databaseId.id)
//     .containers.createIfNotExists(containerId);

//   const querySpec = {
//     query: "SELECT * FROM c WHERE c.email = @email",
//     parameters: [
//       {
//         name: "@email",
//         value: email,
//       },
//     ],
//   };
//   const { resources } = await client
//     .database(databaseId.id)
//     .container(containerId.id)
//     .items.query(querySpec)
//     .fetchAll();
//   return resources[0];
// }

/*************cosmosdb************* */

/*************graphDB************* */

async function getUserTenantId(userId) {
  //get user's tenantId from m1 core graph (not tenant's graph)
  const q = `g.V().has('SourceId',sourceId).in('granted access to').values('SourceId')`;
  let t = await clientGraph.submit(q, { sourceId: userId });
  let res = "";
  if (t._items) {
    if (t._items.length > 0) {
      res = t._items[0];
    }
  }
  return res;
}

async function getVertexEdges(source, edgeLabel, targetLabel) {
  try {
    const q = `g.V().has('SourceId',sourceId).outE(label).inV().has('label',targetLabel).values('SourceId')`;
    let t = await clientGraph.submit(q, {
      sourceId: source.sourceId,
      label: edgeLabel,
      targetLabel: targetLabel,
    });
    let result;
    if (t) {
      if (t._items) {
        if (t._items.length > 0) {
          result = {
            success: true,
            message: "found vertex edges",
            sourceIds: t._items,
          };
        } else {
          result = {
            success: false,
            message: "no vertex edges found",
            sourceIds: [],
          };
        }
      }
    } else {
      result = {
        success: false,
        message: "no vertex edge traversal found",
        sourceIds: [],
      };
    }
    return result;
  } catch (err) {
    let result = {
      success: false,
      message: err,
      sourceIds: [],
    };
    return result;
  }
}

/* async function getVertexEdges(source,edgeLabel,targetLabel,targetId,tagEdgeLabel,tagLabel) { 
  try {
    const q;
    let t;
    //the tag scenario requires getting all tags created by a user (source) that also tag the target (well, owner, etc)
      if(tagEdgeLabel && tagLabel && targetId){
        q = `g.V().has('SourceId',sourceId).outE(tagEdgeLabel).inV().has('label',tagLabel).outE(label).inV().has(targetLabel,'SourceId',targetId).values('SourceId')`
        t = await clientGraph.submit(q,{sourceId:source.sourceId,tagEdgeLabel:tagEdgeLabel,tagLabel:tagLabel,label:edgeLabel,targetLabel:targetLabel,targetId:targetId})
      }
      else {
        q = `g.V().has('SourceId',sourceId).outE(label).inV().has('label',targetLabel).values('SourceId')`
        t = await clientGraph.submit(q,{sourceId:source.sourceId,label:edgeLabel,targetLabel:targetLabel})
      }

        let result;
        if(t){
          if(t._items){
            if(t._items.length > 0){
              result = {
                success:true,
                message:"found vertex edges",
                sourceIds: t._items
              } 
            }
            else {
              result = {
                success:false,
                message:"no vertex edges found",
                sourceIds: []
              } 
            }
          }
        }
        else {
          result = {
            success:false,
            message:"no vertex edge traversal found",
            sourceIds: []
          } 
        }
          return result
        }
        catch (err) {
            let result = {
              success:false,
              message:err,
              sourceIds:[]
            }
            return result
        }
} */

async function dropVertex(vertex) {
  try {
    const findLabelSourceId = `g.V().has(label,'SourceId',sourceId)`;
    let vertexExists = await clientGraph.submit(findLabelSourceId, {
      label: vertex.label,
      sourceId: vertex.sourceId,
    });
    if (vertexExists._items && vertexExists._items.length > 0) {
      vertex.id = vertexExists._items[0].id;
      let qD = `g.V(id).drop()`;
      let dropVertex = await clientGraph.submit(qD, { id: vertex.id });
    }
    let result = {
      success: true,
      message: "dropped vertex",
    };

    return result;
  } catch (err) {
    let error = {
      success: false,
      message: err,
    };
    return error;
  }
}
async function dropEdge(source, target, relationshipLabel) {
  try {
    let g = await clientGraph.open();
    //remove source vertex given the orignal SourceId from source Feed
    const findLabelSourceId = `g.V().has(label,'SourceId',sourceId)`;
    let sourceExists = await clientGraph.submit(findLabelSourceId, {
      label: source.label,
      sourceId: source.sourceId,
    });
    if (sourceExists) {
      if (sourceExists._items) {
        if (sourceExists._items.length > 0) {
          source.id = sourceExists._items[0].id;
        }
      }
    }
    let targetExists = await clientGraph.submit(findLabelSourceId, {
      label: target.label,
      sourceId: target.sourceId,
    });
    if (targetExists) {
      if (targetExists._items) {
        if (targetExists._items.length > 0) {
          target.id = targetExists._items[0].id;
        }
      }
    }
    let dropEdge;
    if (source.id && target.id && relationshipLabel) {
      let qE = `g.V(source).outE(label).as('e').inV().has('id',target).select('e')`;
      let edgeExists = await clientGraph.submit(qE, {
        source: source.id,
        label: relationshipLabel,
        target: target.id,
      });
      if (edgeExists) {
        if (edgeExists._items) {
          if (edgeExists._items && edgeExists._items.length > 0) {
            let qD = `g.V(source).outE(label).as('e').inV().has('id',target).select('e').drop()`;
            dropEdge = await clientGraph.submit(qD, {
              source: source.id,
              label: relationshipLabel,
              target: target.id,
            });
          }
        }
      }
    }
    let result;
    if (dropEdge) {
      if (dropEdge._items) {
        if (dropEdge._items.length === 0) {
          result = {
            success: true,
            message: "edge dropped",
          };
        }
      }
    } else {
      result = {
        success: false,
        message: "edge drop failed",
      };
    }

    return result;
  } catch (err) {
    let error = {
      success: false,
      message: err,
    };
    return error;
  }
}

async function v2e(source, target, relationshipLabel) {
  try {
    let g = await clientGraph.open();
    const findLabelSourceId = `g.V().has(label,'SourceId',sourceId)`;
    //see if source and/or target already exists and don't add if they do
    let sourceExists = await clientGraph.submit(findLabelSourceId, {
      label: source.label,
      sourceId: source.sourceId,
    });
    let targetExists = await clientGraph.submit(findLabelSourceId, {
      label: target.label,
      sourceId: target.sourceId,
    });

    let s;
    if (sourceExists._items && sourceExists._items.length > 0) {
      source.id = sourceExists._items[0].id;
      s = sourceExists._items[0];
    } else {
      //add source vertex
      source.id = uuidv4();
      const sourceProperties = source.properties;
      qS = `g.addV(label).property('id',id).property('SourceId',sourceId).property('name',name)`;
      qV = {
        label: source.label,
        id: source.id,
        sourceId: source.sourceId,
        name: source.name,
      };
      if (sourceProperties && sourceProperties.length > 0) {
        //when vertexInput object has properties add them to the vertex
        sourceProperties.forEach((p) => {
          qS += `.property('${p.key}',${p.key})`;
        });

        sourceProperties.forEach((p) => {
          qV[p.key] = p.value;
        });
      }
      let newS = await clientGraph.submit(qS, qV);
      s = newS._items[0];
    }

    let t;
    if (targetExists._items && targetExists._items.length > 0) {
      target.id = targetExists._items[0].id;
      t = targetExists._items[0];
    } else {
      //add new Vertex for target
      target.id = uuidv4();
      const targetProperties = target.propeties;
      qT = `g.addV(label).property('id',id).property('SourceId',sourceId).property('name',name)`;
      qV = {
        label: target.label,
        id: target.id,
        sourceId: target.sourceId,
        name: target.name,
      };

      if (targetProperties && targetProperties.length > 0) {
        //when vertexInput object has properties add them to the vertex
        targetProperties.forEach((p) => {
          qT += `.property('${p.key}',${p.key})`;
        });
        targetProperties.forEach((p) => {
          qV[p.key] = p.value;
        });
      }
      let newT = await clientGraph.submit(qT, qV);
      t = newT._items[0];
    }

    //check to see if edge between them exists already before we add it
    let e;
    let qE = `g.V(source).outE(label).as('e').inV().has('id',target).select('e')`;
    let edgeExists = await clientGraph.submit(qE, {
      source: source.id,
      label: relationshipLabel,
      target: target.id,
    });
    if (edgeExists._items && edgeExists._items.length > 0) {
      e = edgeExists._items[0];
    } else {
      //create edge
      let newE = await clientGraph.submit(
        "g.V(source).addE(label).to(g.V(target))",
        { source: source.id, label: relationshipLabel, target: target.id }
      );
      e = newE._items[0];
    }

    let result = {
      success: true,
      message: "Created source vertex, target vertex, and edge",
      source: s,
      target: t,
      edge: e,
    };

    return result;
  } catch (err) {
    let error = {
      success: false,
      message: err,
      source: null,
      target: null,
      edge: null,
    };
    return error;
  }
}

/*************graphDB************* */

/*************SQL************* */

// WHERE LodId  IN ('${ownersIds.join("','")}')

async function sqlQueryPermits(offset, amount) {
  try {
    let templateStringQuery = `SELECT *
    FROM api.PermitRecord
    ORDER BY PermitRecordId OFFSET ${offset} ROWS FETCH NEXT ${amount} ROWS ONLY`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryRigs(offset, amount) {
  try {
    let templateStringQuery = `SELECT *
    FROM api.Rig
    WHERE ReportDate = (
      SELECT MAX(ReportDate)
      FROM [api].[Rig])
    ORDER BY RigId OFFSET ${offset} ROWS FETCH NEXT ${amount} ROWS ONLY`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryAbstractGeo(polygon) {
  try {
    let templateStringQuery = `SELECT AI.GeoJSON AS geo_json
    FROM api.Abstract AI
    INNER JOIN (
      SELECT geometry::STGeomFromText('${polygon}', 4326) AS Geom) VP
      ON VP.Geom.STIntersects(AI.Geom) = 1`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryAbstractGeoContains(polygon) {
  try {
    let templateStringQuery = `SELECT AI.GeoJSON AS geo_json
    FROM api.Abstract AI
    INNER JOIN (
      SELECT geometry::STGeomFromText('${polygon}', 4326) AS Geom) VP
      ON VP.Geom.STContains(AI.Geom) = 1`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryBasinShapes(names) {
  try {
    let templateStringQuery = `SELECT GeoJSON AS shape
    FROM api.Basin
    WHERE Name IN ('${names.join("','")}')`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryBasinNames() {
  try {
    let templateStringQuery = `SELECT Name AS name
    FROM api.Basin`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryWellsMinMaxLatLongFromIdsArray(idsArray) {
  try {
    if (idsArray.length === 0) return [];

    let templateStringQuery = `SELECT  MAX(Latitude) maxLat, MIN(Latitude) minLat ,MAX(Longitude) maxLong, MIN(Longitude) minLong 
    FROM api.WellHeader WHERE Id  IN ('${idsArray.join("','")}')`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryWellsMinMaxLatLong(whereFields) {
  try {
    let templateStringQuery = `SELECT  MAX(Latitude) maxLat, MIN(Latitude) minLat ,MAX(Longitude) maxLong, MIN(Longitude) minLong 
    FROM api.WellHeader`;
    let notEmpty = true;
    for (const fieldName in whereFields) {
      if (notEmpty) {
        templateStringQuery += ` WHERE ${fieldName} = '${whereFields[fieldName]}'`;
        notEmpty = false;
      } else
        templateStringQuery += ` and ${fieldName} = '${whereFields[fieldName]}'`;
    }

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryWellGrId12345(gridNumber, whereFields) {
  try {
    let templateStringQuery = `SELECT distinct GrId${gridNumber} FROM api.WellHeader WHERE NOT(GrId${gridNumber} IS NULL) and GrId${gridNumber} <> '' and GrId${gridNumber} <> 'N/A'`;

    for (const fieldName in whereFields) {
      templateStringQuery += ` and ${fieldName} = '${whereFields[fieldName]}'`;
    }

    templateStringQuery += ` group by GrId${gridNumber} order by GrId${gridNumber} asc`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryGetGrId12345ForTXFromAbstract(
  fieldToSelect,
  county,
  whereFields
) {
  try {
    let templateStringQuery = `SELECT distinct a.${fieldToSelect}, count(geoJSON) as geoJSONcount FROM api.Abstract a join api.County b on a.countyFIPS=b.countyFIPS and b.statename='Texas' WHERE b.name ='${county}' and NOT(a.${fieldToSelect} IS NULL) and a.${fieldToSelect} <> '' and a.${fieldToSelect} <> 'N/A'`;

    for (let fieldName in whereFields) {
      if (fieldName == "Abstract") fieldName = "AbstractName";
      templateStringQuery += ` and a.${fieldName} = '${whereFields[fieldName]}'`;
    }

    templateStringQuery += ` group by a.${fieldToSelect} order by a.${fieldToSelect} asc`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryOwnerLatsLonsArray(ownerId) {
  try {
    const templateStringQuery = `SELECT DISTINCT F.Latitude AS latitude, F.Longitude AS longitude, F.Id AS id 
    FROM api.GlobalOwner_VIEW A
    LEFT JOIN api.GlobalOwnerOverrideRollup B
    ON A.Id = B.GlobalOwnerOverrideId
    OR A.Id = B.GlobalOwnerId
    LEFT JOIN api.GlobalOwnerLODSimilarity C
    ON COALESCE(B.GlobalOwnerId, A.Id) = C.GlobalOwnerId
    LEFT JOIN api.LOD2019 D
    ON C.LodId = D.Id
    LEFT JOIN api.WellLodYearMatch E
    ON D.Id = E.LodId
    LEFT JOIN api.WellHeader F
    ON E.WellId = F.Id
    WHERE A.Id = '${ownerId}'
    AND F.Id IS NOT NULL
    AND (ISNULL(F.Longitude, 0) != 0 AND ISNULL(F.Latitude, 0) != 0)`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryOperatorLatsLonsArray(operatorName) {
  try {
    const templateStringQuery = `SELECT Latitude AS latitude, Longitude AS longitude, Id AS id FROM api.WellHeader WHERE NOT(Longitude IS NULL) AND
     NOT(Latitude IS NULL) AND Longitude <> 0 AND Latitude <> 0 AND CurrentOperator = '${operatorName}'`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryLeaseLatsLonsArray(fieldName, value) {
  //// As a fieldName you can pass "Lease" or "LeaseId" ////
  try {
    const templateStringQuery = `SELECT Latitude AS latitude, Longitude AS longitude, Id AS id FROM api.WellHeader WHERE NOT(Longitude IS NULL) AND
     NOT(Latitude IS NULL) AND Longitude <> 0 AND Latitude <> 0 AND ${fieldName} = '${value}'`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function getWellSummaryDetail(wellId) {
  try {
    const templateStringQuery = `
      SELECT
        LeaseId,
        Lease,
        Field,
        County,
        State,
        MeasuredDepth,
        TrueVerticalDepth,
        LateralLength,
        Latitude,
        Longitude,
        BHLatitude,
        BHLongitude,
        Grid1,
        Grid2,
        Grid3,
        Grid4,
        Grid5
      FROM api.WellHeader
      WHERE Id = '${wellId}'`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

async function sqlQueryWell(templateStringQuery) {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);
    let arr = JSON.parse(
      result.recordset[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
    );
    let res = arr[0];

    return res;
  } catch (err) {
    return err;
  }
}

async function sqlQueryOwnerWells(ownerId) {
  try {
    let templateStringQuery = `
      SELECT DISTINCT F.Id AS WellId
      FROM api.GlobalOwner_VIEW A
      LEFT JOIN api.GlobalOwnerOverrideRollup B
      ON A.Id = B.GlobalOwnerOverrideId
      OR A.Id = B.GlobalOwnerId
      LEFT JOIN api.GlobalOwnerLODSimilarity C
      ON COALESCE(B.GlobalOwnerId, A.Id) = C.GlobalOwnerId
      LEFT JOIN api.LOD2019 D
      ON C.LodId = D.Id
      LEFT JOIN api.WellLodYearMatch E
      ON D.Id = E.LodId
      LEFT JOIN api.WellHeader F
      ON E.WellId = F.Id
      WHERE A.Id = '${ownerId}'
      AND F.Id IS NOT NULL`;

    // let templateStringQuery = `SELECT WellId FROM api.WellLodYearMatch WHERE Year = 2019 AND CalendarYear = 2019 AND LodId = '${ownerId}'`;

    // const templateStringQuery = `
    //     SELECT
    //     Id,
    //     SourceWellId,
    //     StateWellId,
    //     WellName,
    //     ApiNumber,
    //     ApiNumberFull,
    //     SourceDateCreated,
    //     SourceDateLastModified,
    //     WellTypeId,
    //     WellStatusId,
    //     WellType,
    //     WellStatus,
    //     CurrentOperator,
    //     OriginalOperator,
    //     LeaseId,
    //     Lease,
    //     Field,
    //     County,
    //     State,
    //     MeasuredDepth,
    //     TrueVerticalDepth,
    //     LateralLength,
    //     Latitude,
    //     Longitude,
    //     BHLatitude,
    //     BHLongitude,
    //     Grid1,
    //     Grid2,
    //     Grid3,
    //     Grid4,
    //     Grid5
    //   FROM api.WellHeader AS w
    //   INNER JOIN api.WellLodYearMatch AS m
    //   ON w.Id = m.WellId
    //   WHERE m.LodId = '${ownerId}'`;

    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);
    let res =
      result && result.recordset && result.recordset.length > 0
        ? result.recordset
        : [];

    return res;
  } catch (err) {
    return err;
  }
}

async function sqlQueryBasic(templateStringQuery) {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);
    let res =
      result.recordset[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"].length >
      0
        ? JSON.parse(
            result.recordset[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
          )
        : null;

    return res;
  } catch (err) {
    return err;
  }
}

async function sqlQueryOperators() {
  try {
    const templateStringQuery = `SELECT Name FROM api.Operators WHERE NOT(Name IS NULL) and Name <> '' ORDER BY [Name] ASC`;
    let pool = await sql.connect(config);
    let result = await pool.request().query(templateStringQuery);

    return result.recordset;
  } catch (err) {
    return err;
  }
}

/*************SQL************* */

/*************fetch apis************* */
const apiBase = "https://m1-search-api.azurewebsites.net";
// const apiBase = "https://localhost:5001";

const apiToken = "082C5CC4-C922-43CB-A004-ACAB67F708DF";

//8596d222-7287-48fc-911d-00000156895c

async function fetchQuadChart(wellId) {
  const url = `${apiBase}/api/v1.0/well/${apiToken}/prodSummary/${wellId}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchWells(wellIdArray, authToken) {
  const config = {
    headers: {
      "M1-Correlation-Id": uuidv4(),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      Authorization: `Bearer ${authToken}`,
    },
  };
  const url = `${apiBase}/api/v1.0/wells`;
  let body = wellIdArray;

  try {
    const response = await axios({
      method: "post",
      url: url,
      data: body,
      headers: config.headers,
    });

    let data = await response.data;
    let result = {
      success: true,
      message: "Results Found",
      results: data,
    };
    return result;
  } catch (error) {
    let result = {
      success: false,
      message: error,
      results: null,
    };
    return result;
  }
}

async function fetchNotifications(wellIdArray) {
  let ids = "('" + wellIdArray.slice(0, 999).join("'),('") + "')";
  try {
    let queryTemplate = `
    DECLARE @wellIds TABLE(wellIds UNIQUEIDENTIFIER);
    INSERT INTO @wellIds values ${ids};
    
      SELECT *
      FROM (
        SELECT WHH.Id, WHH.SpudDate, MIN(WHH.SysStartTime) AS SpudDateChangeTime, COUNT(0) AS RecordsWithSpudDate,
        ROW_NUMBER() OVER (PARTITION BY Id ORDER BY MIN(WHH.SysStartTime) DESC) AS RowNum
        FROM (
          SELECT WH.Id, WH.SpudDate, WH.SysStartTime
          FROM api.WellHeader WH
          WHERE SysEndTime >= DATEADD(DAY, -21, GETUTCDATE())
          AND SysStartTime >= DATEADD(DAY, -21, GETUTCDATE())
          AND Id IN (SELECT WellIds FROM @wellIds)
          UNION
          SELECT WHH.Id, WHH.SpudDate, WHH.SysStartTime
          FROM (
            SELECT WH.Id, WH.SpudDate, WH.SysStartTime
            FROM api.WellHeader WH
            WHERE SysEndTime >= DATEADD(DAY, -21, GETUTCDATE())
            AND SysStartTime >= DATEADD(DAY, -21, GETUTCDATE())
            AND Id IN (SELECT WellIds FROM @wellIds)
            ) WH
          INNER JOIN (
            SELECT WHH.Id, WHH.SpudDate, WHH.SysStartTime
            FROM api.WellHeaderHistory WHH
          ) WHH
          ON WH.Id = WHH.Id) WHH
        GROUP BY WHH.Id, WHH.SpudDate) WHHSD
      WHERE RowNum = 1
      AND SpudDateChangeTime >= DATEADD(DAY, -21, GETUTCDATE()) FOR JSON AUTO
    `;
    let pool = await sql.connect(config);
    let result = await pool.request().query(queryTemplate);
    let res =
      result.recordset[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"].length >
      0
        ? JSON.parse(
            result.recordset[0]["JSON_F52E2B61-18A1-11d1-B105-00805F49916B"]
          )
        : null;

    return res;
  } catch (err) {
    return err;
  }
}

async function fetchOwners(ownerIdArray, authToken) {
  const config = {
    headers: {
      "M1-Correlation-Id": uuidv4(),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      Authorization: `Bearer ${authToken}`,
    },
  };
  const url = `${apiBase}/api/v1.0/owners`;
  let body = ownerIdArray;

  try {
    const response = await axios({
      method: "post",
      url: url,
      data: body,
      headers: config.headers,
    });

    let data = await response.data;
    let result = {
      success: true,
      message: "Results Found",
      results: data,
    };
    return result;
  } catch (error) {
    let result = {
      success: false,
      message: error,
      results: null,
    };
    return result;
  }
}

async function fetchWellOwners(wellId) {
  const url = `${apiBase}/api/v1.0/well/${apiToken}/owners/${wellId}`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
function fetchWellsOwners(wellIdArray) {
  let ownersList = [];
  wellIdArray.forEach(async (wellId) => {
    const owners = await fetchWellOwners(wellId);
    onwerList = [...ownerList, owners];
  });
  if (ownersList.length > 1) {
    let props = Object.keys(ownersList[0]);
    return ownersList.filter(
      (item, index, self) =>
        index ===
        self.findIndex((t) =>
          props.every((prop) => {
            return t[prop] === item[prop];
          })
        )
    );
  }
  return ownersList;
}
async function fetchWellsRanges(authToken) {
  const config = {
    headers: {
      "M1-Correlation-Id": uuidv4(),
      Accept: "application/json",
      "Content-Type": "application/json-patch+json",
      Authorization: `Bearer ${authToken}`,
    },
  };
  const url = `${apiBase}/api/v1.0/wells/ranges`;

  try {
    const response = await axios({
      method: "get",
      url: url,
      headers: config.headers,
    });

    let data = await response.data;
    return data;
  } catch (error) {
    console.log(error);
  }
}
async function fetchWell(wellId) {
  const url = `${apiBase}/api/v1.0/well/${apiToken}/${wellId}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
}
async function fetchWellProdHistory(wellId) {
  const url = `${apiBase}/api/v1.0/well/${apiToken}/prodHistory/${wellId}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
  }
}
// async function login(userName, password, tenantId) {
//   const config = {
//     headers: {
//       "M1-Correlation-Id": uuidv4(),
//       Accept: "application/json",
//     },
//   };
//   const url = `${apiBase}/api/v1.0/jwt`;
//   let body = `username=${userName}&password=${password}`;

//   try {
//     const response = await axios({
//       method: "post",
//       url: url,
//       data: body,
//       headers: config.headers,
//     });

//     let data = await response.data;

//     if (data.access_token) {
//       //get user data from cosmos
//       const user = await getUserByEmail(userName);

//       //data { access_token, expires_in,refresh_token}
//       if (user) {
//         user.authToken = data.access_token;
//         user.authTokenExpires = data.expires_in;
//         user.authRefreshToken = data.refresh_token;
//         //get user's tenantId from graph
//         // const tenantId = await getUserTenantId(user.id)

//         //get tenant from the cosmos
//         const tenant = await getTenant(tenantId);
//         user.tenant = tenant;
//         return {
//           success: true,
//           message: "User Found",
//           user: user,
//         };
//       } else {
//         return {
//           success: false,
//           message: "User Not Found",
//           user: null,
//         };
//       }
//     } else {
//       return {
//         success: false,
//         message: "Authentication Failed",
//         user: null,
//       };
//     }
//   } catch (error) {
//     return {
//       success: false,
//       message: error,
//       user: null,
//     };
//   }
// }
/*************fetch apis************* */

//const selectColumns = "Id,WellId,WellName,ApiNumber,WellType,WellStatus,CurrentOperator,Field,County,State,WellBoreProfile,Latitude,Longitude,PermitDate,SpudDate,CompletionDate,FirstProdDate,Basin,PermitNumber,Lease";
//const selectColumnsOwner = "Id,Name,OwnerType,OwnershipType,OwnershipPercentage,AppraisedValue,IsTracked";

const resolvers = {
  JSON: GraphQLJSON,
  Mutation: {
    sendEmailBug: (_, { email }) => {
      return new Promise(async (resolve, reject) => {
        // convert first letter of category to uppercase
        const { issue, description } = email;
        let issueName = `${
          issue.slice(0, 1).toUpperCase() + issue.slice(1, issue.length)
        } Information`;

        const html = `<div>
        <p><strong>Issue Type: </strong>${issueName}</p>
        <p><strong>Description: </strong> ${description}</p>
        </div>`;
        const subject = `[m1neral Bug Report] ${issueName}`;

        try {
          const result = await sendMail({ subject, html });
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    },
    sendEmailContact: (_, { email }) => {
      return new Promise(async (resolve, reject) => {
        // convert first letter of category to uppercase
        const { name, category, comment } = email;
        const emailAddr = email.email;
        let categoryName =
          category.slice(0, 1).toUpperCase() +
          category.slice(1, category.length);

        const subject = `[m1neral Contact] ${name} submitted a ${category}`;
        const html = `<div>
        <p><strong>Type: </strong>${categoryName}</p>
        <p><strong>Submitted by: </strong>${name}</p>
        <p><strong>Email: </strong>${emailAddr}</p>
        <p><strong>Message: </strong> ${comment}</p>
        </div>`;

        try {
          const result = await sendMail({ subject, html });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    },
    upsertTitleOpinion: async (_, { titleOpinion }) => {
      const result = await upsertTitleOpinion(titleOpinion);

      if (!result)
        return {
          success: false,
          message: "failed to create title opinion",
        };
      return {
        success: true,
        message: "title opinion updated",
        titleOpinion: result,
      };
    },
    v2e: async (_, { source, target, relationshipLabel }) => {
      const result = await v2e(source, target, relationshipLabel);

      if (!result.success)
        return {
          success: result.success,
          message: result.message,
          source: null,
          target: null,
          edge: null,
        };
      return {
        success: result.success,
        message: result.message,
        source: result.source,
        target: result.target,
        edge: result.edge,
      };
    },
    dropVertex: async (_, { vertex }) => {
      const result = await dropVertex(vertex);
      return result;
    },
    dropEdge: async (_, { source, target, relationshipLabel }) => {
      const result = await dropEdge(source, target, relationshipLabel);
      return result;
    },
    ...MutationResolvers,
  },
  Query: {
    basinShapes: (_, { names }) => sqlQueryBasinShapes(names),
    basinNames: () => sqlQueryBasinNames(),
    permits: (_, { offset, amount }) => sqlQueryPermits(offset, amount),
    rigs: (_, { offset, amount }) => sqlQueryRigs(offset, amount),
    abstractGeo: (_, { polygon }) => sqlQueryAbstractGeo(polygon),
    abstractGeoContains: (_, { polygon }) =>
      sqlQueryAbstractGeoContains(polygon),
    vertexEdges: (_, { source, edgeLabel, targetLabel }) =>
      getVertexEdges(source, edgeLabel, targetLabel),
    WellGrId12345: (_, { gridNumber, whereFields }) =>
      sqlQueryWellGrId12345(gridNumber, whereFields),
    getGrId12345ForTXFromAbstract: (
      _,
      { fieldToSelect, county, whereFields }
    ) =>
      sqlQueryGetGrId12345ForTXFromAbstract(fieldToSelect, county, whereFields),
    wellsMinMaxLatLong: (_, { whereFields }) =>
      sqlQueryWellsMinMaxLatLong(whereFields),
    wellsMinMaxLatLongFromIdsArray: (_, { idsArray }) =>
      sqlQueryWellsMinMaxLatLongFromIdsArray(idsArray),
    ownerLatsLonsArray: (_, { ownerId }) => sqlQueryOwnerLatsLonsArray(ownerId),
    operatorLatsLonsArray: (_, { operatorName }) =>
      sqlQueryOperatorLatsLonsArray(operatorName),
    leaseLatsLonsArray: (_, { fieldName, value }) =>
      sqlQueryLeaseLatsLonsArray(fieldName, value),
    ownersWells: (_, { ownersIds }) =>
      sqlQueryBasic(
        `SELECT LOWER(LodId) AS ownerId,
        (SELECT LOWER(WellId) AS wellId
        FROM api.WellLodYearMatch B
        WHERE A.LodId = B.LodId
        AND B.Year = 2019
        AND B.CalendarYear = 2019
        FOR JSON AUTO) AS wells
        FROM api.WellLodYearMatch A
        WHERE LodId  IN ('${ownersIds.join("','")}')
        GROUP BY LodId   FOR JSON AUTO`
      ),
    ownerWells: (_, { ownerId }) => sqlQueryOwnerWells(ownerId),
    counties: (_, { state }) =>
      sqlQueryBasic(
        `SELECT county,state FROM api.Counties WHERE county <> '' and county <> '(N/A)' and county <> 'N/A' and state = '${state}' ORDER BY county ASC FOR JSON AUTO`
      ),
    surveys: (_, { county }) =>
      sqlQueryBasic(
        `SELECT SurveyName as survey,county FROM api.Surveys WHERE county = '${county}' ORDER BY survey ASC FOR JSON AUTO`
      ),
    abstracts: (_, { survey }) =>
      sqlQueryBasic(
        `SELECT Abstract as abstract,SurveyName as survey FROM api.Abstracts WHERE SurveyName = '${survey}' ORDER BY abstract ASC  FOR JSON AUTO`
      ),
    // users: (_, { ids }) => getUsers(ids),
    titleOpinions: () => getTitleOpinions(),
    wells: (_, { wellIdArray, authToken }) =>
      fetchWells(wellIdArray, authToken),
    notifications: (_, { trackedWellID }) => fetchNotifications(trackedWellID),
    well: (_, { wellId }) => fetchWell(wellId),
    wellSummaryDetail: (_, { wellId }) => getWellSummaryDetail(wellId),
    wellOwners: (_, { wellId }) => fetchWellOwners(wellId),
    wellsOwners: (_, { wellIdArray }) =>
      sqlQueryBasic(
        `SELECT LOWER(WellId) AS wellId,
        (SELECT LOWER(LodId) AS ownerId
        FROM api.WellLodYearMatch B
        WHERE A.WellId = B.WellId
        AND B.Year = 2019
        AND B.CalendarYear = 2019
        FOR JSON AUTO) AS owners
        FROM api.WellLodYearMatch A
        WHERE WellId  IN ('${wellIdArray.join("','")}')
        GROUP BY WellId   FOR JSON AUTO`
      ),
    wellsRanges: (_, { authToken }) => fetchWellsRanges(authToken),
    owners: (_, { ownerIdArray, authToken }) =>
      fetchOwners(ownerIdArray, authToken),
    //wellOwnersByIds: (_, { WellIds}) => sqlQueryWellOwnersByIds(`SELECT ${selectColumnsOwner} FROM api.Owners WHERE Id IN(${WellIds}) FOR JSON AUTO`),
    wellProdHistory: (_, { wellId }) => fetchWellProdHistory(wellId),
    quadChart: (_, { wellId }) => fetchQuadChart(wellId),
    // login: (_, { userName, password, tenant }) =>
    //   login(userName, password, tenant),
    operators: () => sqlQueryOperators(),
    ...QueryResolvers,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const httpTrigger = util.promisify(server.createHandler());

// Default export wrapped with Application Insights FaaS context propagation
module.exports = async function contextPropagatingHttpTrigger(context, req) {
  // Start an AI Correlation Context using the provided Function context
  const correlationContext = appInsights.startOperation(context, req);

  // Wrap the Function runtime with correlationContext
  return appInsights.wrapWithCorrelationContext(async () => {
    const startTime = Date.now(); // Start trackRequest timer

    // Run the Function
    await httpTrigger(context, req);

    // Track Request on completion
    appInsights.defaultClient.trackRequest({
      name: context.req.method + " " + context.req.url,
      resultCode: context.res.status,
      success: true,
      url: req.url,
      duration: Date.now() - startTime,
      id: correlationContext.operation.parentId,
    });
    appInsights.defaultClient.flush();
  }, correlationContext)();
};
