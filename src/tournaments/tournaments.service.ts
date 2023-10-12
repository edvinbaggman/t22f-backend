import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { matchResultDto } from './dto/match-result.dto';
import { Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import mime from 'mime-types';
import { bucket, gcsBucketName } from '../firebase/gcs.config';
import { CreatePlayersDto } from '../users/dto/create-players.dto';
import { IsimpleTournaments } from './interface/simpleTournaments.interface';

@Injectable()
export class TournamentsService {
  private readonly firestore = admin.firestore();

  async create(
    createTournamentDto: CreateTournamentDto,
    file: Express.Multer.File,
  ) {
    const imageUrl = await uploadImage(file);
    const tournamentId = crypto.randomUUID();
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const newTournament = {
      ...createTournamentDto,
      id: tournamentId,
      rounds: [],
      players: [],
      playersInactive: [],
      image: imageUrl,
    };
    const res = await tournamentRef.set(newTournament);
    return JSON.stringify(res);
  }

  async updateTournament(id: string, updateTournamentDto: UpdateTournamentDto) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const res = await tournamentRef.update({ ...updateTournamentDto });
    return JSON.stringify(res);
  }

  /**
   * return an object of all tournaments.
   *
   * @returns {string} - Json string of all tournaments.
   *
   */
  async findAll(): Promise<string> {
    const tournamentRef = this.firestore.collection('tournaments');
    const tournamentsSnapshot = await tournamentRef.get();
    const allTournamentsData = tournamentsSnapshot.docs.map((tournamentDoc) =>
      tournamentDoc.data(),
    );
    return JSON.stringify(allTournamentsData);
  }

  /**
   * return an array of players (Id and Name) in the tournament
   *
   * @param {admin.firestore.DocumentData} tournamentData - Firebase document data of the tournament.
   * @returns {{ id: string; name: string }[]} - Array of players (Id and Name) in the tournament.
   *
   */
  async getPlayers(
    tournamentData: admin.firestore.DocumentData,
  ): Promise<{ id: string; name: string }[]> {
    const userRef = this.firestore
      .collection('users')
      .doc(tournamentData.owner);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    return tournamentData.players.map((playerId: string) => {
      const player = userData.players[playerId];
      return { id: playerId, name: player.name };
    });
  }

  /**
   * return an array of players (Id and Name) in the tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @returns {string} - Json string of the tournament.
   *
   */
  async findOne(tournamentId: string): Promise<string> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    tournamentData.players = await this.getPlayers(tournamentData);

    tournamentData.leaderboard = createLeaderboard(tournamentData);

    return JSON.stringify(tournamentData);
  }

  /**
   * Get simplified tournament information (id, name, location, date, owner, image)
   *
   * @param {admin.firestore.DocumentSnapshot} tournamentDoc - Firebase document snapshot of the tournament.
   * @returns {IsimpleTournaments} - Object of simplified tournament information (id, name, location, date, owner, image).
   *
   */
  private getSimplifiedTournament(
    tournamentDoc: admin.firestore.DocumentSnapshot,
  ): IsimpleTournaments {
    const tournamentData = tournamentDoc.data();
    const simpleTournament: IsimpleTournaments = {
      id: '',
      owner: '',
      players: [],
      date: '',
      name: '',
      image: '',
      location: '',
    };
    simpleTournament.id = tournamentDoc.id;
    simpleTournament.name = tournamentData.name;
    simpleTournament.location = tournamentData.location;
    simpleTournament.date = tournamentData.date;
    simpleTournament.owner = tournamentData.owner;
    simpleTournament.image = tournamentData.image;

    return { ...simpleTournament };
  }

  /**
   * Function to classify tournaments in finished, upcoming and todays
   *
   * @param tournament
   * @param {date} today - Date of today.
   * @returns {string} - String of the status of the tournament.
   */
  private classifyTournament(
    tournament: IsimpleTournaments,
    today: Date,
  ): string {
    const tournamentDate = new Date(tournament.date);
    tournamentDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (tournamentDate < today) {
      return 'finished';
    } else if (tournamentDate > today) {
      return 'upcoming';
    } else {
      return 'todays';
    }
  }

  /**
   * Filter simple tournament information (id, name, location, date, owner, image) with status (finished, upcoming, todays)
   *
   * @param {string} userId - Id of the user (optional).
   * @returns {string} - Json string of tournaments information.
   *
   */
  async getTournamentsSimple(userId?: string): Promise<string> {
    const tournamentRef = this.firestore.collection('tournaments');
    const tournamentsSnapshot = await tournamentRef.get();
    const finished = [];
    const upcoming = [];
    const todays = [];
    const today = new Date();

    tournamentsSnapshot.docs.forEach((tournamentDoc) => {
      const tournament: IsimpleTournaments =
        this.getSimplifiedTournament(tournamentDoc);

      if (!userId || (userId && tournament.owner === userId)) {
        const status = this.classifyTournament(tournament, today);

        switch (status) {
          case 'finished':
            finished.push(tournament);
            break;
          case 'upcoming':
            upcoming.push(tournament);
            break;
          case 'todays':
            todays.push(tournament);
            break;
        }
      }
    });

    return JSON.stringify({ finished, upcoming, todays });
  }

  /**
   * return information about tournaments (id, name, location, date, owner, image) with status (finished, upcoming, todays)
   *
   * @returns {string} - Json string of tournaments information.
   *
   */
  async getTournamentSimple(): Promise<string> {
    return this.getTournamentsSimple();
  }

  /**
   * return information about tournaments (id, name, location, date, owner, image) with status (finished, upcoming, todays) of a specific user
   *
   * @param {string} userId - Id of the user.
   * @returns {string} - Json string of tournaments information.
   *
   */
  async getUserTournamentSimple(userId: string): Promise<string> {
    return this.getTournamentsSimple(userId);
  }

  /**
   * Generate a new round for a tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @returns {string} - Json string of update tournament with new round.
   *
   */
  async generateNewRound(tournamentId: string): Promise<string> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();
    const userRef = this.firestore
      .collection('users')
      .doc(tournamentData.owner);
    const userSnapshot = await userRef.get();
    const userData = userSnapshot.data();
    const userPlayers = userData.players;

    const roundsPlayed = Object.keys(tournamentData.rounds).length;

    const round = generateRound(tournamentData, userPlayers);

    const updateObject = {};
    updateObject[`rounds.${roundsPlayed}`] = round;
    const res = tournamentRef.update(updateObject);
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
      userData.players[playerId].stats[tournamentId] = {
        games: 0,
        won: 0,
        points: 0,
      };
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
    console.log(currentGames, currentWon, currentPoints);
    await userRef.update({
      [fieldPath]: {
        games: currentGames,
        won: currentWon,
        points: currentPoints,
      },
    });
    return { currentGames, currentWon, currentPoints };
  }

  async processPlayers(
    team: { players: string[] },
    owner: string,
    tournamentId: string,
    pointsDiff: number,
  ) {
    for (const playerId of team.players) {
      this.addStatsPlayer(owner, playerId, tournamentId, pointsDiff);
    }
  }

  /**
   * Add new score to a match
   *
   * @param {string} tournamentId - Id of the tournament.
   * @param {matchResultDto} matchResultDto - Object of the match result.
   * @returns {string} - Json string of update tournament with new score.
   *
   */
  async addScore(
    tournamentId: string,
    matchResultDto: matchResultDto,
  ): Promise<void> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);

    const updateObject = {};
    updateObject[
      `rounds.${matchResultDto.round}.${matchResultDto.match}.team1.points`
    ] = matchResultDto.team1Points;
    updateObject[
      `rounds.${matchResultDto.round}.${matchResultDto.match}.team2.points`
    ] = matchResultDto.team2Points;

    await tournamentRef.update(updateObject);
    console.log(matchResultDto);
    const tournementDoc = await tournamentRef.get();
    const tournementData = tournementDoc.data();

    const pointsDiff = matchResultDto.team1Points - matchResultDto.team2Points;
    const match = tournementData.rounds[matchResultDto.round];
    console.log(match);

    this.processPlayers(
      match[matchResultDto.match].team1,
      tournementData.owner,
      tournamentId,
      pointsDiff * 1,
    );
    this.processPlayers(
      match[matchResultDto.match].team2,
      tournementData.owner,
      tournamentId,
      pointsDiff * -1,
    );
  }

  async createPlayer(
    tournamentId: string,
    player: CreatePlayersDto,
  ): Promise<any> {
    // TODO: change any to Players
    const playerId = crypto.randomUUID();
    const newPlayer = {
      name: player.name,
      id: playerId,
      stats: {},
    };
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const userId = tournamentSnapshot.data().owner;
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const updateObject = {};
    updateObject[`players.${playerId}`] = newPlayer;
    //promise all
    await userRef.update(updateObject);

    await tournamentRef.update({
      players: FieldValue.arrayUnion(playerId),
    });

    return newPlayer;
  }

  /**
   * Add a user player to a tournament
   *
   * @param {string} tournamentid - Id of the tournament.
   * @param {string} playerId - Id of the player.
   * @returns {string} - Json string of the player id.
   *
   */
  async addPlayer(tournamentid: string, playerId: string): Promise<string> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentid);

    await tournamentRef.update({
      players: FieldValue.arrayUnion(playerId),
    });

    return JSON.stringify(playerId);
  }

  /**
   * Get Players (Id and Name) in a tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @returns {{ string; string }[]} - Array of players (Id and Name) in the tournament.
   *
   */
  async getTournamentPlayers(
    tournamentId: string,
  ): Promise<{ id: string; name: string }[]> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentDoc = await tournamentRef.get();

    if (!tournamentDoc.exists) {
      throw new Error('Tournament not found');
    }

    const tournamentData = tournamentDoc.data();
    const userRef = this.firestore
      .collection('users')
      .doc(tournamentData.owner);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const playersIn = tournamentData.players.map((playerId: string) => {
      const player = userData.players[playerId];
      return { id: playerId, name: player.name };
    });

    return playersIn;
  }

  /**
   * Get Players (Id and Name) not in a tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @returns {{ string; string }[]} - Array of players (Id and Name) not in the tournament.
   *
   */
  async getPlayersNotInTournament(
    tournamentId: string,
  ): Promise<{ id: string; name: string }[]> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentDoc = await tournamentRef.get();

    if (!tournamentDoc.exists) {
      throw new Error('Tournament not found');
    }

    const tournamentData = tournamentDoc.data();

    const userRef = this.firestore
      .collection('users')
      .doc(tournamentData.owner);
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    const playersNotInTournament = Object.keys(userData.players)
      .filter((playerId) => !tournamentData.players.includes(playerId))
      .map((playerId) => {
        const player = userData.players[playerId];
        return { id: playerId, name: player.name };
      });

    return playersNotInTournament;
  }

  /**
   * Remouve a player from a tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @param {string} playerId - Id of the player.
   * @returns {string} - Json string of the player id.
   *
   * */
  async removePlayer(tournamentId: string, playerId: string): Promise<string> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    const players = tournamentData.players;
    const playersWithoutplayer = players.filter((p: string) => p !== playerId);

    const res = tournamentRef.update({
      players: playersWithoutplayer,
    });
    return JSON.stringify(res);
  }

  /**
   * Delete a tournament
   *
   * @param {string} id - Id of the tournament.
   * @returns {string} - Json string of the result.
   *
   * */
  async remove(id: string): Promise<string> {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const res = await tournamentRef.delete();

    return JSON.stringify(res);
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

//A randomized algorithm to generate a round that is as good as possible
//TODO take gender into account

const generateRound = (tournamentData, userPlayers) => {
  const playersInactiveArray = tournamentData.playersInactive;
  const playersInactiveLength = playersInactiveArray.length;

  const playersArray = tournamentData.players;
  const playersLength = playersArray.length;

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

      const indexPlayer1Team1 = playersArray.indexOf(team1[0]);
      const indexPlayer2Team1 = playersArray.indexOf(team1[1]);
      const indexPlayer1Team2 = playersArray.indexOf(team2[0]);
      const indexPlayer2Team2 = playersArray.indexOf(team2[1]);

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
  const sortedPlayerIndexes = getOrderOfSums(playedMatrix);

  let maximumNumberOfGames = Math.floor(
    (playersLength - playersInactiveLength) / 4,
  );

  const maxSimultaneousGames = Number(
    tournamentData.settings.maxSimultaneousGames,
  );

  maximumNumberOfGames = Math.min(maximumNumberOfGames, maxSimultaneousGames);

  const maximumNumberOfPlayers = maximumNumberOfGames * 4;

  const indexOfInactivePlayers = playersInactiveArray.map((item) =>
    playersArray.indexOf(item),
  );

  const sortedPlayerIndexesWithoutInactive = sortedPlayerIndexes.filter(
    (index) => !indexOfInactivePlayers.includes(index),
  );
  const indexOfPlayersPlayingThisRound =
    sortedPlayerIndexesWithoutInactive.slice(0, maximumNumberOfPlayers);

  const indexOfPlayersNotPlayingThisRound = sortedPlayerIndexesWithoutInactive
    .slice(maximumNumberOfPlayers)
    .concat(indexOfInactivePlayers);

  //Set very high values on players not playing so these players wont be picked
  for (const index1 of indexOfPlayersNotPlayingThisRound) {
    for (let index2 = 0; index2 < playersLength; index2++) {
      playedMatrix[index1][index2] = 9999;
      playedMatrix[index2][index1] = 9999;
    }
  }

  let bestRound;
  let bestRoundGri = 99999;

  //Here you can set how many times the algorithm will try to find the best solution.
  for (let x = 0; x < 100; x++) {
    // gri = Good Round Index. Meassures how good a round is. The lower the better.
    let gri = 0;
    const round = {};

    //Shuffle to create different starting points in the algorithm = different results
    const shuffledIndexOfPlayersPlayingThisRound = shuffle(
      indexOfPlayersPlayingThisRound,
    );
    const playersIndexToGiveMatchTo = shuffledIndexOfPlayersPlayingThisRound;

    //Create matches that gives the least amount of points
    for (let index = 0; index < maximumNumberOfGames; index++) {
      const team1Player1Index = playersIndexToGiveMatchTo.shift();
      let minVal = 9999;
      let minVal2 = 9999;
      let minVal3 = 9999;
      let team1Player2Index;
      let team2Player1Index;
      let team2Player2Index;

      //Find teammate and one opponent
      for (const playerIndex of playersIndexToGiveMatchTo) {
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

      playersIndexToGiveMatchTo.splice(
        playersIndexToGiveMatchTo.indexOf(team1Player2Index),
        1,
      );
      playersIndexToGiveMatchTo.splice(
        playersIndexToGiveMatchTo.indexOf(team2Player1Index),
        1,
      );

      const team1Players = [
        playersArray[team1Player1Index],
        playersArray[team1Player2Index],
      ];

      //Find teammate for other team
      for (const playerIndex of playersIndexToGiveMatchTo) {
        if (playedMatrix[team2Player1Index][playerIndex] < minVal3) {
          minVal3 = playedMatrix[team2Player1Index][playerIndex];
          team2Player2Index = playerIndex;
        }
      }

      playersIndexToGiveMatchTo.splice(
        playersIndexToGiveMatchTo.indexOf(team2Player2Index),
        1,
      );

      // Add teams to match
      const team2Players = [
        playersArray[team2Player1Index],
        playersArray[team2Player2Index],
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

    if (gri < bestRoundGri) {
      bestRound = round;
      bestRoundGri = gri;
    }
  }

  return bestRound;
};

const shuffle = (array: string[]) => {
  const copyOfArray = [...array];
  for (let i = copyOfArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copyOfArray[i], copyOfArray[j]] = [copyOfArray[j], copyOfArray[i]];
  }
  return copyOfArray;
};

function getOrderOfSums(matrix) {
  const sumsWithIndex = matrix.map((row, index) => ({
    index,
    sum: row.reduce((acc, curr) => acc + curr, 0),
  }));

  sumsWithIndex.sort((a, b) => a.sum - b.sum);

  return sumsWithIndex.map((item) => item.index);
}

async function uploadImage(file: Express.Multer.File) {
  let publicUrl = '';
  if (file && file.buffer instanceof Buffer) {
    try {
      const fileType = mime.extension(file.mimetype);
      const fileId = crypto.randomUUID();
      const fileName = `${fileId}.${fileType}`;
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        gzip: true,
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          reject(err);
        });

        blobStream.on('finish', () => {
          publicUrl = `https://storage.googleapis.com/${gcsBucketName}/${fileName}`;
          resolve('File uploaded');
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  }
  return publicUrl;
}

function sortLeaderboard(playerA, playerB) {
  if (playerA.won !== playerB.won) {
    return playerB.won - playerA.won;
  }

  if (playerA.pointDiff !== playerB.pointDiff) {
    return playerB.pointDiff - playerA.pointDiff;
  }

  return playerA.matches - playerB.matches;
}

const createLeaderboard = (tournamentData) => {
  const leaderboard = {};

  for (const player of tournamentData.players) {
    const playerId = player.id;
    const playerName = player.name;
    leaderboard[playerId] = {
      player: playerId,
      playerName: playerName,
      matches: 0,
      won: 0,
      pointDiff: 0,
      lastMatches: [],
    };
  }

  for (const roundId of Object.keys(tournamentData.rounds)) {
    for (const matchId of Object.keys(tournamentData.rounds[roundId])) {
      const match = tournamentData.rounds[roundId][matchId];
      const team1player1 = match.team1.players[0];
      const team1player2 = match.team1.players[1];
      const team2player1 = match.team2.players[0];
      const team2player2 = match.team2.players[1];
      const pointsTeam1 = match.team1.points ? Number(match.team1.points) : 0;
      const pointsTeam2 = match.team2.points ? Number(match.team2.points) : 0;
      const pointDiffTeam1 = pointsTeam1 - pointsTeam2;
      const pointDiffTeam2 = pointsTeam2 - pointsTeam1;
      if (pointDiffTeam1 > 0) {
        leaderboard[team1player1].won += 1;
        leaderboard[team1player2].won += 1;
        leaderboard[team1player1].lastMatches.push('won');
        leaderboard[team1player2].lastMatches.push('won');
        leaderboard[team2player1].lastMatches.push('loss');
        leaderboard[team2player2].lastMatches.push('loss');
      } else if (pointDiffTeam2 > 0) {
        leaderboard[team2player1].won += 1;
        leaderboard[team2player2].won += 1;
        leaderboard[team2player1].lastMatches.push('won');
        leaderboard[team2player2].lastMatches.push('won');
        leaderboard[team1player1].lastMatches.push('loss');
        leaderboard[team1player2].lastMatches.push('loss');
      } else {
        leaderboard[team1player1].lastMatches.push('draw');
        leaderboard[team1player2].lastMatches.push('draw');
        leaderboard[team2player1].lastMatches.push('draw');
        leaderboard[team2player2].lastMatches.push('draw');
      }
      leaderboard[team1player1].matches += 1;
      leaderboard[team1player2].matches += 1;
      leaderboard[team2player1].matches += 1;
      leaderboard[team2player2].matches += 1;
      leaderboard[team1player1].pointDiff += pointDiffTeam1;
      leaderboard[team1player2].pointDiff += pointDiffTeam1;
      leaderboard[team2player1].pointDiff += pointDiffTeam2;
      leaderboard[team2player2].pointDiff += pointDiffTeam2;
    }
  }
  const leaderboardArray = Object.values(leaderboard);
  leaderboardArray.sort(sortLeaderboard);
  return leaderboardArray;
};
