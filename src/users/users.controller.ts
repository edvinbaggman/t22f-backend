import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';

import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { RenameUserDto } from './dto/rename-users.dto';
import { RenamePlayersDto } from './dto/rename-player.dto';
import { Users } from './model/users.model';
import { ITotalStats } from './interface/stats.interface';
import { ILeaderboardUser } from './interface/leaderboard.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * @description Get all the users
   * @returns {Promise<User[]>} All the users
   * @memberof UsersController
   *
   */
  @Get()
  @ApiOperation({ summary: 'Get all the users' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  findAll(): Promise<Users[]> {
    return this.userService.findAll();
  }

  /**
   * @description Get one user
   * @param {string} userId The user id
   * @returns {Promise<User>} The user
   * @memberof UsersController
   *
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get one user' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 200, description: 'The user retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  findOne(@Param('userId') userId: string): Promise<Users> {
    return this.userService.findOne(userId);
  }

  /**
   * @description Create a new user
   * @param {CreateUsersDto} createUsersDto The user to create
   * @returns {Promise<User>} The user created
   * @memberof UsersController
   *
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'New user created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  createUser(@Body() createUsersDto: CreateUsersDto): Promise<Users> {
    return this.userService.createUser(createUsersDto);
  }

  /**
   * @description Get all the players of a user
   * @param {string} userId The user id
   * @returns {Promise<string[]>} All the players of a user
   * @memberof UsersController
   *
   */
  @Get(':userId/playersNames')
  @ApiOperation({ summary: 'Get names of all players of a user' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Players names retrieved successfully.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getPlayers(@Param('userId') userId: string): Promise<string[]> {
    return this.userService.getPlayers(userId);
  }

  /**
   * @description Rename a user player
   * @param {string} userId The user id
   * @param {string} playerId The player id
   * @param {RenamePlayersDto} renamePlayerDto The new name of the player
   * @returns {Promise<RenamePlayersDto>} The user updated
   * @memberof UsersController
   *
   */
  @Patch(':userId/players/:playerId/rename')
  @ApiOperation({ summary: 'Rename a user player' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  renamePlayer(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
    @Body() renamePlayerDto: RenamePlayersDto,
  ): Promise<RenamePlayersDto> {
    return this.userService.renamePlayer(userId, playerId, renamePlayerDto);
  }

  /**
   * @description Get player total stats
   * @param {string} userId The user id
   * @param {string} playerId The player id
   * @returns {Promise<ITotalStats>} The player total stats
   * @memberof UsersController
   *
   */
  @Get(':userId/players/:playerId/getTotalStats')
  @ApiOperation({ summary: 'Get player total stats' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Player total stats retrieved successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  getTotalStats(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
  ): Promise<ITotalStats> {
    return this.userService.getTotalStats(userId, playerId);
  }

  /**
   * @description Get user Leaderboard
   * @param {string} userId The user id
   * @returns {Promise<ILeaderboardUser[]>} The user Leaderboard
   * @memberof UsersController
   *
   */
  @Get(':userId/getLeaderboard')
  @ApiOperation({ summary: 'Get user Leaderboard' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getLeaderboard(@Param('userId') userId: string): Promise<ILeaderboardUser[]> {
    return this.userService.getLeaderboard(userId);
  }

  /**
   * @description Rename a user
   * @param {string} userId The user id
   * @param {RenameUserDto} renameUserDto The new name of the user
   * @returns {Promise<RenameUserDto>} The user updated
   * @memberof UsersController
   * @throws {Error} If the user is not found
   *
   */
  @Patch(':userId/rename')
  @ApiOperation({ summary: 'Rename a user' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  renameUser(
    @Param('userId') userId: string,
    @Body() renameUserDto: RenameUserDto,
  ): Promise<RenameUserDto> {
    return this.userService.renameUser(userId, renameUserDto);
  }
}
