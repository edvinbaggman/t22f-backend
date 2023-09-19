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
    const owner = 'GET FROM JWT'; //TODO
    const newTournament = { ...createTournamentDto, rounds: [], owner: owner };
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

    const updateObject = {};
    updateObject[
      `rounds.${matchResultDto.round}.${matchResultDto.match}.${matchResultDto.team}.points`
    ] = matchResultDto.points;

    tournamentRef.update(updateObject);
  }

  async addPlayer(id: string, player: addPlayerDto) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);

    const res = tournamentRef.update({
      players: FieldValue.arrayUnion(player.name),
    });
    return JSON.stringify(res);
  }

  async removePlayer(id: string, player: addPlayerDto) {
    const tournamentRef = this.firestore.collection('tournaments').doc(id);
    const tournamentSnapshot = await tournamentRef.get();
    const tournamentData = tournamentSnapshot.data();

    const players = tournamentData.players;
    const playersWithoutplayer = players.filter((p) => p !== player.name);

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
