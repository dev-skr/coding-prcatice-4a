let express = require("express");
let sqlite = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let app = express();
app.use(express.json());
module.exports = app;
let db = null;
let { open } = sqlite;
async function serverAndDbStart() {
  try {
    db = await open({
      filename: path.join(__dirname + "/cricketTeam.db"),
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at 3000 port");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
}
serverAndDbStart();

app.get("/players/", async (request, response) => {
  const query = `select * from cricket_team`;
  let result = await db.all(query);
  let reqResult = result.map((eachObject) => {
    return {
      playerId: eachObject.player_id,
      playerName: eachObject.player_name,
      jerseyNumber: eachObject.jersey_number,
      role: eachObject.role,
    };
  });
  response.send(reqResult);
});

app.post("/players/", async (request, response) => {
  let details = request.body;
  let { player_name, jersey_number, role } = details;
  let postQuery = `insert into cricket_team (player_name,jersey_number,role)
    values("${player_name}","${jersey_number}","${role}")`;
  console.log(postQuery);
  let postResponse = await db.run(postQuery);
  response.send("Player Added to Team");
});

function outputRep(obj) {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
}

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let reqPlayer = `select * from cricket_team where player_id=${playerId}`;
  let result = await db.get(reqPlayer);
  let res = outputRep(result);
  response.send(res);
});

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { player_name, jersey_number, role } = request.body;
  let reqPlayer = `update cricket_team set
  player_name="${player_name}",
  jersey_number=${jersey_number},
  role='${role}'
  where player_id=${playerId}`;
  let result = await db.run(reqPlayer);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let delQuery = `delete from cricket_team where player_id=${playerId}`;
  await db.run(delQuery);
  response.send("Player Removed");
});
