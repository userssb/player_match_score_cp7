const express = require("express");
const app = express();
app.use(express.json());

const sqlite3 = require("sqlite3");
path = require("path");
const { open } = require("sqlite");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;
const initializeDBAndServer = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => {
    console.log("Server is running at http://localhost:3000");
  });
};

initializeDBAndServer();

const convertPlayersDBObjToResponseObj = (player) => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
  };
};

const convertMatchDBObjToResponseObj = (dbObj) => {
  return {
    matchId: dbObj.match_id,
    match: dbObj.match,
    year: dbObj.year,
  };
};

//API-1 Path: /players/
//Method: GET---------->Returns a list of all the players in the player table
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    select * from player_details order by player_id;
    `;
  const playersResult = await db.all(getPlayersQuery);
  //response.send(playersResult);
  response.send(
    playersResult.map((eachPlayer) =>
      convertPlayersDBObjToResponseObj(eachPlayer)
    )
  );
});

//API 2 *** Path: /players/:playerId/
//Method: GET
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select * from player_details where player_id=${playerId};
    `;
  const playerResult = await db.get(getPlayerQuery);
  //response.send(playersResult);
  response.send({
    playerId: playerResult.player_id,
    playerName: playerResult.player_name,
  });
});

//API-3 *** Path: /players/:playerId/
//Method: PUT
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  //console.log(playerName);
  const putPlayerQuery = `
    update player_details
    set
    player_name = "${playerName}"
     where player_id = ${playerId};
    `;
  const playerResult = await db.run(putPlayerQuery);
  //response.send(playersResult);
  response.send("Player Details Updated");
});

//API 4 *** Path: /matches/:matchId/
//Method: GET
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
    select * from match_details where match_id=${matchId};
    `;
  const matchResult = await db.get(getMatchQuery);
  //response.send(playersResult);
  response.send({
    matchId: matchResult.match_id,
    match: matchResult.match,
    year: matchResult.year,
  });
});

//API 5 *** Path: /players/:playerId/matches
//Method: GET
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    select * from player_match_score
    natural join match_details
    where player_id=${playerId};
    `;
  const playersMatchResult = await db.all(getPlayerMatchesQuery);
  //response.send(playersResult);
  response.send(
    playersMatchResult.map((eachMatch) =>
      convertMatchDBObjToResponseObj(eachMatch)
    )
  );
});

//API 6 *** Path: /matches/:matchId/players
//Method: GET
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerMatchesQuery = `
    select * from player_match_score
    natural join player_details
    where match_id=${matchId};
    `;
  const playersMatchResult = await db.all(getPlayerMatchesQuery);
  //response.send(playersResult);
  response.send(
    playersMatchResult.map((eachMatch) =>
      convertPlayersDBObjToResponseObj(eachMatch)
    )
  );
});

//API 7 *** Path: /players/:playerId/playerScores
//Method: GET

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchesQuery = `
    select 
    player_id as playerId,
    player_name as playerName,
    SUM(score) as totalScore,
    SUM(fours) as totalFours,
    SUM(sixes) as totalSixes
    from player_match_score
    natural join player_details
    where player_id=${playerId};
    `;
  const playersMatchResult = await db.get(getPlayerMatchesQuery);
  //response.send(playersResult);
  response.send(playersMatchResult);
});

module.exports = app;
