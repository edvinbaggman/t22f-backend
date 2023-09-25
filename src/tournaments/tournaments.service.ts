import { matchResultDto } from './dto/match-result.dto';
import { Injectable } from '@nestjs/common';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import * as admin from 'firebase-admin';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { addPlayerDto } from './dto/add-player.dto';

@Injectable()
export class TournamentsService {
  private readonly firestore = admin.firestore();

  async create(createTournamentDto: CreateTournamentDto) {
    const tournamentId = crypto.randomUUID();
    const tournamentRef = this.firestore
      .collection('tournaments')
      .doc(tournamentId);
    const newTournament = { ...createTournamentDto, rounds: [], players: [] };
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

  async generateNewRound(id: string) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    const roundsPlayed = Object.keys(tournamentData.rounds).length;

    const newRound = generateMatches(tournamentData);

    const updateObject = {};
    updateObject[`rounds.${roundsPlayed}`] = newRound;
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

//Creates matches at random. TODO algorithm
const generateMatches = (tournamentData) => {
  const round = {};
  const players = tournamentData.players;
  while (players.length >= 4) {
    const matchId = crypto.randomUUID();
    const matchPlayers = [];
    for (let index = 0; index < 4; index++) {
      const randomIndex = Math.floor(Math.random() * players.length);
      matchPlayers.push(players.splice(randomIndex, 1)[0]);
    }
    const match = {
      team1: { players: matchPlayers.slice(0, 2), points: '' },
      team2: { players: matchPlayers.slice(2), points: '' },
    };
    round[matchId] = match;
  }
  return round;
};
