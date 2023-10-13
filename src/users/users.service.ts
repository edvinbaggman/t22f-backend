import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Users } from './model/users.model';
import { CreateUsersDto } from './dto/create-users.dto';
import { ITotalStats } from './interface/stats.interface';
import { RenameUserDto } from './dto/rename-users.dto';
import { RenamePlayersDto } from './dto/rename-player.dto';

@Injectable()
export class UsersService {
  private readonly firestore = admin.firestore();

  /**
   * Get all users
   *
   * @returns {Users[]} All users
   *
   */
  async findAll(): Promise<Users[]> {
    const snapshot = await this.firestore.collection('users').get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Users[];
  }

  /**
   * Get one user
   *
   * @param {string} userId - The id of the user
   * @returns {Users} The user
   *
   * @throws {Error} If the user is not found
   *
   * @example
   * findOne('123456789')
   * // returns { id: '123456789', name: 'John Doe', email: 'john.doe@example', players: {} }
   *
   */
  async findOne(userId: string): Promise<Users> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() } as Users;
  }

  /**
   * Create a new user
   *
   * @param {CreateUsersDto} user - The user to create
   * @returns {Users} The created user
   *
   */
  async createUser(user: CreateUsersDto): Promise<Users> {
    const newUser = { ...user, players: {} };
    const docRef = this.firestore.collection('users').doc(user.email);
    await docRef.set(newUser);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Users;
  }

  /**
   * Get names of all players of a user
   *
   * @param {string} userId - The id of the user
   * @returns {string[]} The names of all players of the user
   *
   * @throws {Error} If the user is not found
   *
   * @example
   * getPlayers('123456789')
   * // returns ['John Doe', 'Jane Doe']
   *
   */
  async getPlayers(userId: string): Promise<string[]> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const playerRefs = userData.players;
    const playerNames = Object.values(playerRefs).map(
      (player: any) => player.name,
    );

    return playerNames;
  }

  /**
   * Rename a player
   *
   * @param {string} userId - The id of the user
   * @param {string} playerId - The id of the player
   * @param {RenamePlayersDto} renamePlayerDto - The new name of the player
   * @returns {RenamePlayersDto} The new name of the player
   *
   * @throws {Error} If the user is not found
   *
   */
  async renamePlayer(
    userId: string,
    playerId: string,
    renamePlayerDto: RenamePlayersDto,
  ): Promise<RenamePlayersDto> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const fieldPath = `players.${playerId}.name`;

    await userRef.update({
      [fieldPath]: renamePlayerDto.name,
    });
    return renamePlayerDto;
  }

  /**
   * Get the total stats of a player
   *
   * @param {string} userId - The id of the user
   * @param {string} playerId - The id of the player
   * @returns {ITotalStats} The total stats of the player
   *
   * @throws {Error} If the user is not found
   *
   * @example
   * getTotalStats('123456789', '123456789')
   * // returns { TotalGames: '10', TotalWon: '5', TotalPoints: '100' }
   *
   */
  async getTotalStats(userId: string, playerId: string): Promise<ITotalStats> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    if (!userData.players || !userData.players[playerId]) {
      throw new Error('Player not found');
    }

    let totalGames = 0;
    let totalWon = 0;
    let totalPoints = 0;
    for (const tournamentId in userData.players[playerId].stats) {
      if (userData.players[playerId].stats.hasOwnProperty(tournamentId)) {
        totalGames += userData.players[playerId].stats[tournamentId].games || 0;
        totalWon += userData.players[playerId].stats[tournamentId].won || 0;
        totalPoints +=
          userData.players[playerId].stats[tournamentId].points || 0;
      }
    }
    return {
      TotalGames: totalGames.toString(),
      TotalWon: totalWon.toString(),
      TotalPoints: totalPoints.toString(),
    };
  }

  async getLeaderboard(userId: string) {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    const userData = userDoc.data();

    const leaderboard = [];

    for (const playerId in userData.players) {
      const player = userData.players[playerId];
      const stats = {
        id: player.id,
        name: player.name,
        games: 0,
        won: 0,
        points: 0,
        tournaments: 0,
      };
      for (const tournamentId in player.stats) {
        stats.games += player.stats[tournamentId].games;
        stats.won += player.stats[tournamentId].won;
        stats.points += player.stats[tournamentId].points;
        stats.tournaments += 1;
      }
      leaderboard.push(stats);
    }

    leaderboard.sort((a, b) => {
      // Sort by won matches (descending order)
      if (a.won !== b.won) {
        return b.won - a.won;
      }

      // Sort by points (descending order)
      if (a.points !== b.points) {
        return b.points - a.points;
      }

      // Sort by least games played (ascending order)
      return a.matches - b.matches;
    });
    return leaderboard;
  }

  /**
   * Rename a user
   *
   * @param {string} userId - The id of the user
   * @param {RenameUserDto} user - The new name of the user
   * @returns {RenameUserDto} The new name of the user
   *
   * @throws {Error} If the user is not found
   *
   */
  async renameUser(
    userId: string,
    user: RenameUserDto,
  ): Promise<RenameUserDto> {
    const userRef = this.firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    await userRef.update({
      name: user.name,
    });
    return user;
  }
}
