import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { matchResultDto } from './dto/match-result.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import mime from 'mime-types';
import { bucket, gcsBucketName } from '../firebase/gcs.config';
import { CreatePlayersDto } from './dto/create-players.dto';
import { IsimpleTournaments } from './interface/simpleTournaments.interface';
import { Tournament } from './entities/tournament.model';
import { Players } from './entities/players.model';

@Injectable()
export class TournamentsService {
  private readonly firestore = admin.firestore();

  /**
   * Create a new tournament
   *
   * @param {CreateTournamentDto} createTournamentDto - Object of the tournament information.
   * @param {Express.Multer.File} file - Image file of the tournament.
   * @returns {Tournament} - Object of the tournament information.
   *
   */
  async create(
    createTournamentDto: CreateTournamentDto,
    file: Express.Multer.File,
  ): Promise<Tournament> {
    const imageUrl = await uploadImage(file);
    const tournamentId = crypto.randomUUID();
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const newTournament = {
      ...createTournamentDto,
      id: tournamentId,
      rounds: {},
      players: [],
      playersInactive: [],
      image: imageUrl,
    };
    await tournamentRef.set(newTournament);
    return newTournament;
  }

  /**
   * Update a tournament
   *
   * @param {string} id - Id of the tournament.
   * @param {UpdateTournamentDto} updateTournamentDto - Object of the tournament information.
   * @returns {string} - Json string of the result.
   *
   */
  async updateTournament(
    id: string,
    updateTournamentDto: UpdateTournamentDto,
  ): Promise<string> {
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
      startingTime: '',
    };
    simpleTournament.id = tournamentDoc.id;
    simpleTournament.name = tournamentData.name;
    simpleTournament.location = tournamentData.location;
    simpleTournament.date = tournamentData.date;
    simpleTournament.owner = tournamentData.owner;
    simpleTournament.image = tournamentData.image;
    simpleTournament.startingTime = tournamentData.startingTime;

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

    if (tournamentDate.getTime() < today.getTime()) {
      return 'finished';
    } else if (tournamentDate.getTime() > today.getTime()) {
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
    today.setDate(today.getDate() - 1); // to Update it with the frontend !

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

    if (Object.keys(round).length < 1) {
      throw new HttpException(
        'Not enough players',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    }

    const updateObject = {};
    updateObject[`rounds.${roundsPlayed}`] = round;
    await tournamentRef.update(updateObject);
    return JSON.stringify(round);
  }

  /**
   * Add new score to a match
   *
   * @param {string} tournamentId - Id of the tournament.
   * @param {matchResultDto} matchResultDto - Object of the match result.
   * @returns {void} - Void.
   *
   */
  async addScore(
    tournamentId: string,
    matchResultDto: matchResultDto,
  ): Promise<string> {
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

    const res = await tournamentRef.update(updateObject);
    return JSON.stringify(res);
  }

  /**
   * Create a new player
   *
   * @param {string} tournamentId - Id of the tournament.
   * @param {CreatePlayersDto} player - Object of the player information.
   * @returns {Players} - Object of the player information.
   *
   */
  async createPlayer(
    tournamentId: string,
    player: CreatePlayersDto,
  ): Promise<Players> {
    const playerId = crypto.randomUUID();
    const newPlayer = {
      name: player.name,
      id: playerId,
      sex: player.sex,
      stats: {},
    };
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const userId = tournamentSnapshot.data().owner;
    const userRef = this.firestore.collection('users').doc(userId);

    const updateObject = {};
    updateObject[`players.${playerId}`] = newPlayer;

    const promiseData = [];
    promiseData.push(userRef.update(updateObject));

    promiseData.push(
      tournamentRef.update({
        players: FieldValue.arrayUnion(playerId),
      }),
    );
    await Promise.all(promiseData);

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
      playersInactive: FieldValue.arrayRemove(playerId),
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

    const playersIn = tournamentData.players
      .map((playerId: string) => {
        if (!tournamentData.playersInactive.includes(playerId)) {
          const player = userData.players[playerId];
          return { id: playerId, name: player.name };
        }
      })
      .filter(Boolean);

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
      .filter(
        (playerId) =>
          !tournamentData.players.includes(playerId) ||
          tournamentData.playersInactive.includes(playerId),
      )
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

    const res = await tournamentRef.update({
      playersInactive: FieldValue.arrayUnion(playerId),
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

  /**
   * Update all players stats at the end of a tournament
   *
   * @param {string} tournamentId - Id of the tournament.
   * @returns {string} - Json string of the result.
   *
   */
  async endOfTournament(tournamentId: string): Promise<string> {
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    // Create an object to store temporary stats updates for each player
    const playerUpdates: { [userId: string]: any } = {};

    for (const key in tournamentData.rounds) {
      for (const matchId in tournamentData.rounds[key]) {
        const match = tournamentData.rounds[key][matchId];
        const pointsDiff = match.team1.points - match.team2.points;
        processPlayersTemp(
          match.team1,
          tournamentData.owner,
          tournamentId,
          pointsDiff * 1,
          playerUpdates,
        );
        processPlayersTemp(
          match.team2,
          tournamentData.owner,
          tournamentId,
          pointsDiff * -1,
          playerUpdates,
        );
      }
    }

    for (const userId in playerUpdates) {
      const userUpdate = playerUpdates[userId];
      await this.firestore.collection('users').doc(userId).update(userUpdate);
    }

    return JSON.stringify('Players stats update');
  }
}

/**
 * Generate a new round for a tournament
 *
 * @param {admin.firestore.DocumentData} tournamentData - Firebase document data of the tournament.
 * @param {Players} userPlayers - Firebase document data of the user.
 *
 */
const generateRound = (
  tournamentData: admin.firestore.DocumentData,
  userPlayers: Players,
) => {
  const settings = tournamentData.settings;
  const playersInactiveArray = tournamentData.playersInactive;
  const playersInactiveLength = playersInactiveArray.length;
  const playersArray = tournamentData.players;
  const playersLength = playersArray.length;

  let numberOfWomen = 0;
  let numberOfMen = 0;

  for (const key in userPlayers) {
    const person = userPlayers[key];
    if (person.sex === 'woman') {
      numberOfWomen++;
    } else if (person.sex === 'man') {
      numberOfMen++;
    }
  }

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

  const maxSimultaneousGames = Number(settings.maxSimultaneousGames);

  maximumNumberOfGames = Math.min(maximumNumberOfGames, maxSimultaneousGames);

  const maximumNumberOfPlayers = maximumNumberOfGames * 4;

  const indexOfInactivePlayers = playersInactiveArray.map((item) =>
    playersArray.indexOf(item),
  );

  const sortedPlayerIndexesWithoutInactive = sortedPlayerIndexes.filter(
    (index) => !indexOfInactivePlayers.includes(index),
  );

  let numberOfWomenResting = 0;
  let numberOfMensResting = 0;

  if (settings.prioGender == 1) {
    let numberOfMenPlayingThisRound = 0;
    let numberOfWomenPlayingThisRound = 0;
    const wantedNumberOfEachGender = maximumNumberOfPlayers / 2;
    if (settings.prioType == 0) {
      if (numberOfWomen < wantedNumberOfEachGender) {
        const numberOfWomenGames = Math.floor(numberOfWomen / 4);

        const maxNumberOfMensGames = maximumNumberOfGames - numberOfWomenGames;
        const numberOfMensGames = Math.min(
          maxNumberOfMensGames,
          Math.floor(numberOfMen / 4),
        );
        numberOfMenPlayingThisRound = numberOfMensGames * 4;
        numberOfWomenPlayingThisRound = numberOfWomenGames * 4;
      } else if (numberOfMen < wantedNumberOfEachGender) {
        const numberOfMensGames = Math.floor(numberOfMen / 4);

        const maxNumberOfWomensGames = maximumNumberOfGames - numberOfMensGames;
        const numberOfWomensGames = Math.min(
          maxNumberOfWomensGames,
          Math.floor(numberOfWomen / 4),
        );
        numberOfMenPlayingThisRound = numberOfMensGames * 4;
        numberOfWomenPlayingThisRound = numberOfWomensGames * 4;
      } else {
        numberOfMenPlayingThisRound = wantedNumberOfEachGender;
        numberOfWomenPlayingThisRound = wantedNumberOfEachGender;
      }
    } else if (settings.prioType == 1) {
      if (numberOfWomen < wantedNumberOfEachGender) {
        const numberOfMixGames = Math.floor(numberOfWomen / 2);
        numberOfMenPlayingThisRound = numberOfMixGames * 2;
        numberOfWomenPlayingThisRound = numberOfMixGames * 2;
      } else if (numberOfMen < wantedNumberOfEachGender) {
        const numberOfMixGames = Math.floor(numberOfMen / 2);
        numberOfMenPlayingThisRound = numberOfMixGames * 4;
        numberOfWomenPlayingThisRound = numberOfMixGames * 4;
      } else {
        numberOfMenPlayingThisRound = wantedNumberOfEachGender;
        numberOfWomenPlayingThisRound = wantedNumberOfEachGender;
      }
    }
  } else {
    const indexOfPlayersPlayingThisRound =
      sortedPlayerIndexesWithoutInactive.slice(0, maximumNumberOfPlayers);
  }

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

/**
 * Shuffle players in an array
 *
 * @param {string[]} array - Array of strings.
 * @returns {string[]} - Array of strings.
 *
 */
const shuffle = (array: number[]): number[] => {
  const copyOfArray = [...array];
  for (let i = copyOfArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copyOfArray[i], copyOfArray[j]] = [copyOfArray[j], copyOfArray[i]];
  }
  return copyOfArray;
};

function getOrderOfSums(matrix: any[]) {
  const sumsWithIndex = matrix.map((row, index) => ({
    index,
    sum: row.reduce((acc: any, curr: any) => acc + curr, 0),
  }));

  sumsWithIndex.sort((a, b) => a.sum - b.sum);

  return sumsWithIndex.map((item) => item.index);
}

/**
 * Upload image to Google Cloud Storage
 *
 * @param {Express.Multer.File} file - Image file of the tournament.
 * @returns {string} - Url of the image.
 * @throws {Error} - Error.
 *
 */
async function uploadImage(file: Express.Multer.File): Promise<string> {
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

/**
 * Process players stats updates
 *
 * @param {Object} team - Team object.
 * @param {string} owner - Owner of the tournament.
 * @param {string} tournamentId - Id of the tournament.
 * @param {number} pointsDiff - Difference of points between the two teams.
 * @param {Object} playerUpdates - Object to store temporary stats updates for each player.
 * @returns {void} - Void.
 *
 * */
function processPlayersTemp(
  team: { players: string[] },
  owner: string,
  tournamentId: string,
  pointsDiff: number,
  playerUpdates: { [userId: string]: any },
): void {
  for (const playerId of team.players) {
    const fieldPath = `players.${playerId}.stats.${tournamentId}`;

    if (!playerUpdates[owner]) {
      playerUpdates[owner] = {};
    }

    if (
      !playerUpdates[owner][fieldPath] ||
      !playerUpdates[owner][fieldPath].games
    ) {
      playerUpdates[owner][fieldPath] = {
        games: 0,
        won: 0,
        points: 0,
      };
    }

    playerUpdates[owner][fieldPath].games += 1;
    playerUpdates[owner][fieldPath].points += pointsDiff;

    if (pointsDiff > 0) {
      playerUpdates[owner][fieldPath].won += 1;
    }
  }
}
