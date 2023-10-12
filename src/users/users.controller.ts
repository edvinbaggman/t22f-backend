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

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all the users' })
  @ApiResponse({ status: 200, description: 'Récupère la liste des users.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get one user' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 200, description: 'Get a user.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiResponse({ status: 404, description: 'User non trouvé.' })
  findOne(@Param('userId') userId: string) {
    return this.userService.findOne(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'Crée un nouvel utilisateur.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  createUser(@Body() createUsersDto: CreateUsersDto) {
    return this.userService.createUser(createUsersDto);
  }

  @Get(':userId/playersNames')
  @ApiOperation({ summary: 'Get names of all players of a user' })
  @ApiBearerAuth()
  // @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
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
    @Body() renamePlayerDto: RenamePlayersDto,
  ) {
    return this.userService.renamePlayer(userId, playerId, renamePlayerDto);
  }

  @Get(':userId/players/:playerId/getTotalStats')
  getTotalStats(
    @Param('userId') userId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.userService.getTotalStats(userId, playerId);
  }

  @Get(':userId/getLeaderboard')
  getLeaderboard(@Param('userId') userId: string) {
    return this.userService.getLeaderboard(userId);
  }

  @Patch(':userId/rename')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully renamed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async renameUser(
    @Param('userId') userId: string,
    @Body() renameUserDto: RenameUserDto,
  ) {
    return this.userService.renameUser(userId, renameUserDto);
  }
}
