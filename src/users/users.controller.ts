import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUsersDto } from './dto/create-users.dto';
// import { UpdatePlayerDto } from './dto/update_player.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { CreatePlayersDto } from './dto/create-players.dto';
import { gameRsultDto } from './dto/gameResult.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'get all the users' })
  @ApiResponse({ status: 200, description: 'Récupère la liste des users.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  findAll() {
    return this.userService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'Crée un nouvel utilisateur.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  createUser(@Body() createUsersDto: CreateUsersDto) {
    return this.userService.createUser(createUsersDto);
  }

  @Patch(':userId/createPlayer')
  @ApiOperation({ summary: 'Create a player' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
  @ApiResponse({
    status: 200,
    description:
      'The player has been successfully created and added to the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createPlayer(
    @Param('userId') userId: string,
    @Body() createPlayerDto: CreatePlayersDto,
  ) {
    return this.userService.createPlayer(userId, createPlayerDto);
  }

  @Get(':userId/playersNames')
  @ApiBearerAuth()
  // @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
  @ApiOperation({ summary: 'Get names of all players of a user' })
  @ApiResponse({
    status: 200,
    description: 'Players names retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getPlayers(@Param('userId') userId: string): Promise<string[]> {
    return this.userService.getPlayers(userId);
  }

  @Patch(':userId/players/:playerId/rename')
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async renamePlayer(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
    @Body() renamePlayerDto: CreatePlayersDto,
  ) {
    return this.userService.renamePlayer(userId, playerId, renamePlayerDto);
  }

  @Patch(':userId/players/:playerId/newTournements')
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createTournament(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.userService.createTournament(userId, playerId);
  }

  @Patch(':userId/players/:playerId/addGameResult/:tournamentId')
  addGameResult(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
    @Param('tournamentId') tournamentId: string,
    @Body() win: gameRsultDto,
  ) {
    return this.userService.addGameResult(userId, playerId, tournamentId, win);
  }

  @Patch(':userId/players/:playerId/getTotalStats')
  getTotalStats(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.userService.getTotalStats(userId, playerId);
  }
}

// what happens if two user are creating the same player, is it relevent that we should save every
// player or we can just pretend that every user will have this own players
// [To disscuss !!!]

//

//

// @Delete(':userId/removePlayer/:playerId')
// @ApiBearerAuth()
// @UseGuards(FirebaseAuthGuard)
// @ApiOperation({ summary: 'Remove a player from a user' })
// @ApiResponse({ status: 200, description: 'Player removed successfully.' })
// @ApiResponse({ status: 401, description: 'Unauthorized.' })
// @ApiResponse({ status: 404, description: 'User not found.' })
// removePlayer(
//   @Param('userId') userId: string,
//   @Param('player') player: UpdatePlayerDto,
// ) {
//   return this.userService.removePlayer(userId, player);
// }
