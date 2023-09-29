import { matchResultDto } from './dto/match-result.dto';
import { Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { addPlayerDto } from './dto/add-player.dto';
import { TournamentStatus } from './enum/tournament-status.enum';

@Injectable()
export class TournamentsService {
  private readonly firestore = admin.firestore();

  async create(createTournamentDto: CreateTournamentDto) {
    const tournamentId = crypto.randomUUID();
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const newTournament = {
      ...createTournamentDto,
      id: tournamentId,
      rounds: [],
      players: [],
    };
    const res = await tournamentRef.set(newTournament);
    return JSON.stringify(res);
  }

  async findAll() {
    const tournamentRef = this.firestore.collection('tournaments');
    const tournamentsSnapshot = await tournamentRef.get();
    const allTournamentsData = tournamentsSnapshot.docs.map((tournamentDoc) =>
      tournamentDoc.data(),
    );
    return JSON.stringify(allTournamentsData);
  }

  async findOne(id: string) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();
    return JSON.stringify(tournamentData);
  }

  // TODO : creact a function to get the tournament simple (with the filter)
  // To avoid code duplication, I'll do it later, don't worry ;)
  async getTournamentSimple() {
    const tournamentRef = this.firestore.collection('tournaments');
    const tournamentsSnapshot = await tournamentRef.get();
    const finished = [];
    const upcoming = [];
    const todays = [];

    tournamentsSnapshot.docs.forEach((tournamentDoc) => {
      const tournamentData = tournamentDoc.data();

      const id = tournamentDoc.id;
      const name = tournamentData.name;
      const location = tournamentData.location;
      const date = tournamentData.date;
      const owner = tournamentData.owner;
      const image = tournamentData.image;

      const simplifiedTournament = { id, name, location, date, owner, image };

      switch (tournamentData.status) {
        case TournamentStatus.FINISHED:
          finished.push(simplifiedTournament);
          break;
        case TournamentStatus.UPCOMING:
          upcoming.push(simplifiedTournament);
          break;
        case TournamentStatus.ONGOING:
          todays.push(simplifiedTournament);
          break;
      }
    });
    // console.log({ finished });
    return JSON.stringify({ finished, upcoming, todays });
  }

  async getUserTournamentSimple(userId: string) {
    // [TODO] the check of user (if he exists or not befoure the forEach)
    const tournamentRef = this.firestore.collection('tournaments');
    const tournamentsSnapshot = await tournamentRef.get();
    const finished = [];
    const upcoming = [];
    const todays = [];

    tournamentsSnapshot.docs.forEach((tournamentDoc) => {
      const tournamentData = tournamentDoc.data();
      if (tournamentData.owner === userId) {
        const id = tournamentDoc.id; // Assumant que le document ID est l'ID du tournoi
        const name = tournamentData.name;
        const location = tournamentData.location;
        const date = tournamentData.date;
        const owner = tournamentData.owner;
        const image = tournamentData.image;

        const simplifiedTournament = { id, name, location, date, owner, image };

        switch (tournamentData.status) {
          case TournamentStatus.FINISHED:
            finished.push(simplifiedTournament);
            break;
          case TournamentStatus.UPCOMING:
            upcoming.push(simplifiedTournament);
            break;
          case TournamentStatus.ONGOING:
            todays.push(simplifiedTournament);
            break;
        }
      }
    });
    return JSON.stringify({ finished, upcoming, todays });
  }

  async generateNewRound(id: string) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    const roundsPlayed = Object.keys(tournamentData.rounds).length;

    const round = generateManyRoundsAndPickOne(tournamentData);

    const updateObject = {};
    updateObject[`rounds.${roundsPlayed}`] = round;
    const res = tournamentRef.update(updateObject);
    return JSON.stringify(res);
  }

  async addScore(id: string, matchResultDto: matchResultDto) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);

    const updateObject1 = {};
    updateObject1[
      `rounds.${matchResultDto.round}.${matchResultDto.match}.team1.points`
    ] = matchResultDto.team1Points;
    const updateObject2 = {};
    updateObject2[
      `rounds.${matchResultDto.round}.${matchResultDto.match}.team2.points`
    ] = matchResultDto.team2Points;

    tournamentRef.update(updateObject1);
    tournamentRef.update(updateObject2);

    const pointsDiff = matchResultDto.team1Points - matchResultDto.team2Points;

    const tournementDoc = await tournamentRef.get();
    const tournementData = tournementDoc.data();
    for (const roundKey in tournementData.rounds) {
      const round = tournementData.rounds[roundKey];
      for (const matchKey in round) {
        const match = round[matchKey];
        for (const teamKey in match) {
          let teamCoef = 1;
          if (teamKey === 'team2') {
            teamCoef = -1;
          }
          const team = match[teamKey];
          for (const playerKey in team.players) {
            const player = team.players[playerKey];
            this.addStatsPlayer(
              tournementData.owner,
              player,
              id,
              pointsDiff * teamCoef,
            );
          }
        }
      }
    }
  }

  async addPlayer(id: string, user: string, playerId: string) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const userRef = this.firestore.collection('users').doc(user);
    // console.log(id, user, playerId); // for debugg
    // console.log(tournamentRef);
    await tournamentRef.update({
      players: FieldValue.arrayUnion(playerId),
    });
    const newStat = {
      games: 0,
      id: id,
      won: 0,
    };
    const fieldPath = `players.${playerId}.stats.${id}`;
    await userRef.update({
      [fieldPath]: newStat,
    });

    return JSON.stringify(newStat);
  }

  async removePlayer(id: string, player: addPlayerDto) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    const players = tournamentData.players;
    const playersWithoutplayer = players.filter((p) => p !== player.id);

    const res = tournamentRef.update({
      players: playersWithoutplayer,
    });
    return JSON.stringify(res);
  }

  async remove(id: string) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const res = await tournamentRef.delete();

    return JSON.stringify(res);
  }

  async addStatsPlayer(
    userId: string,
    playerId: string,
    tournamentId: string,
    points: number,
  ) {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    if (!userData.players || !userData.players[playerId]) {
      throw new Error('Player not found');
    }
    const fieldPath = `players.${playerId}.stats.${tournamentId}`;

    if (
      !userData.players[playerId].stats ||
      !userData.players[playerId].stats[tournamentId]
    ) {
      throw new Error('Stat tournament not found');
    }
    let currentGames =
      userData.players[playerId].stats[tournamentId].games || 0;
    let currentWon = userData.players[playerId].stats[tournamentId].won || 0;
    let currentPoints =
      userData.players[playerId].stats[tournamentId].points || 0;
    currentGames += 1;
    currentPoints += points;
    if (points > 0) {
      currentWon += 1;
    }
    await userRef.update({
      [fieldPath]: {
        games: currentGames,
        won: currentWon,
        points: currentPoints,
      },
    });
    return { currentGames, currentWon, currentPoints };
  }
}

//Creates matches at random. Not to be used.
// const generateMatches = (tournamentData) => {
//   const round = {};
//   const players = tournamentData.players;
//   while (players.length >= 4) {
//     const matchId = crypto.randomUUID();
//     const matchPlayers = [];
//     for (let index = 0; index < 4; index++) {
//       const randomIndex = Math.floor(Math.random() * players.length);
//       matchPlayers.push(players.splice(randomIndex, 1)[0]);
//     }
//     const match = {
//       team1: { players: matchPlayers.slice(0, 2), points: '' },
//       team2: { players: matchPlayers.slice(2), points: '' },
//     };
//     round[matchId] = match;
//   }
//   return round;
// };

const generateManyRoundsAndPickOne = (tournamentData) => {
  let bestRound;
  let minVal = 99999;
  //Run x times and pick the best round.
  for (let index = 0; index < 100; index++) {
    const { round, gri } = generateRound(tournamentData);
    if (gri < minVal) {
      bestRound = round;
      minVal = gri;
    }
  }
  return bestRound;
};

//A randomized algorithm to generate a round that is as good as possible
const generateRound = (tournamentData) => {
  const round = {};

  const playersArray = tournamentData.players;
  const playersLength = playersArray.length;
  const shuffledPlayersArray = shuffle(playersArray);

  //Create matrix with zeros
  const playedMatrix = [];
  for (let i = 0; i < playersLength; i++) {
    playedMatrix[i] = new Array(playersLength).fill(0);
  }

  //Populate matrix with played matches
  for (const roundIndex in tournamentData.rounds) {
    for (const matchId in tournamentData.rounds[roundIndex]) {
      const team1 = tournamentData.rounds[roundIndex][matchId].team1.players;
      const team2 = tournamentData.rounds[roundIndex][matchId].team2.players;

      const indexPlayer1Team1 = shuffledPlayersArray.indexOf(team1[0]);
      const indexPlayer2Team1 = shuffledPlayersArray.indexOf(team1[1]);
      const indexPlayer1Team2 = shuffledPlayersArray.indexOf(team2[0]);
      const indexPlayer2Team2 = shuffledPlayersArray.indexOf(team2[1]);

      //For each game, played with (+2), played against (+1)
      playedMatrix[indexPlayer1Team1][indexPlayer2Team1] += 2;
      playedMatrix[indexPlayer2Team1][indexPlayer1Team1] += 2;

      playedMatrix[indexPlayer1Team1][indexPlayer1Team2] += 1;
      playedMatrix[indexPlayer1Team2][indexPlayer1Team1] += 1;

      playedMatrix[indexPlayer1Team1][indexPlayer2Team2] += 1;
      playedMatrix[indexPlayer2Team2][indexPlayer1Team1] += 1;

      playedMatrix[indexPlayer2Team1][indexPlayer1Team2] += 1;
      playedMatrix[indexPlayer1Team2][indexPlayer2Team1] += 1;

      playedMatrix[indexPlayer2Team1][indexPlayer2Team2] += 1;
      playedMatrix[indexPlayer2Team2][indexPlayer2Team1] += 1;

      playedMatrix[indexPlayer1Team2][indexPlayer2Team2] += 2;
      playedMatrix[indexPlayer2Team2][indexPlayer1Team2] += 2;
    }
  }

  //Get a sorted array of the players that has played the least. Give them matches first
  const orderOfSums = getOrderOfSums(playedMatrix);

  const maximumNumberOfGames = Math.floor(playersLength / 4);
  const maximumNumberOfPlayers = maximumNumberOfGames * 4;

  const orderOfSumsSliced = orderOfSums.slice(0, maximumNumberOfPlayers);

  // gri = Good Round Index. Meassures how good a round is. The lower the better.
  let gri = 0;

  //Create matches that gives the least amount of points
  for (let index = 0; index < maximumNumberOfGames; index++) {
    const team1Player1Index = orderOfSumsSliced.shift();
    let minVal = 9999;
    let minVal2 = 9999;
    let minVal3 = 9999;
    let team1Player2Index;
    let team2Player1Index;
    let team2Player2Index;

    //Find teammate and one opponent
    for (const playerIndex of orderOfSumsSliced) {
      if (playedMatrix[team1Player1Index][playerIndex] < minVal) {
        if (team1Player2Index) {
          team2Player1Index = team1Player2Index;
          minVal2 = playedMatrix[team1Player1Index][team2Player1Index];
        }
        minVal = playedMatrix[team1Player1Index][playerIndex];
        team1Player2Index = playerIndex;
      } else if (playedMatrix[team1Player1Index][playerIndex] < minVal2) {
        minVal2 = playedMatrix[team1Player1Index][playerIndex];
        team2Player1Index = playerIndex;
      }
    }

    orderOfSumsSliced.splice(orderOfSumsSliced.indexOf(team1Player2Index), 1);
    orderOfSumsSliced.splice(orderOfSumsSliced.indexOf(team2Player1Index), 1);

    const team1Players = [
      shuffledPlayersArray[team1Player1Index],
      shuffledPlayersArray[team1Player2Index],
    ];

    //Find teammate for other team
    for (const playerIndex of orderOfSumsSliced) {
      if (playedMatrix[team2Player1Index][playerIndex] < minVal3) {
        minVal3 = playedMatrix[team2Player1Index][playerIndex];
        team2Player2Index = playerIndex;
      }
    }

    orderOfSumsSliced.splice(orderOfSumsSliced.indexOf(team2Player2Index), 1);

    // Add teams to match
    const team2Players = [
      shuffledPlayersArray[team2Player1Index],
      shuffledPlayersArray[team2Player2Index],
    ];

    const match = {
      team1: { players: team1Players, points: '' },
      team2: { players: team2Players, points: '' },
    };

    //This is a value of how good the match is. The lower the better
    gri = gri + minVal + minVal2 + minVal3;

    //Add match to round
    const matchId = crypto.randomUUID();
    round[matchId] = match;
  }

  const returnObject = {
    round,
    gri,
  };

  return returnObject;
};

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

function calculateRowSum(row) {
  return row.reduce((acc, curr) => acc + curr, 0);
}

function getOrderOfSums(matrix) {
  const sumsWithIndex = matrix.map((row, index) => ({
    index,
    sum: calculateRowSum(row),
  }));

  sumsWithIndex.sort((a, b) => a.sum - b.sum);

  return sumsWithIndex.map((item) => item.index);
}
