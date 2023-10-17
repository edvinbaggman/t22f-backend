import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { matchResultDto } from './dto/match-result.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString, validate } from 'class-validator';
import { CreatePlayersDto } from './dto/create-players.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { FirebaseAuthGuard } from '../firebase/firebase-auth.guard';
import { Players } from './entities/players.model';

export class testClass {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  age: string;
}

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  /**
   * @description Create a tournament
   * @param {string} body The tournament data
   * @param {Express.Multer.File} file The tournament image
   * @returns {Promise<string>} The tournament created
   * @memberof tournamentsService
   *
   */
  @Post()
  @ApiOperation({ summary: 'Create Tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The tournament has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body('form') body: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<string> {
    const bodyParsed = JSON.parse(body);
    const createTournamentDto = new CreateTournamentDto();

    for (const key in bodyParsed) {
      createTournamentDto[key] = bodyParsed[key];
    }
    const errors = await validate(createTournamentDto);

    if (errors.length > 0) {
      throw new BadRequestException('Invalid form');
    }
    const tournament = await this.tournamentsService.create(
      createTournamentDto,
      file,
    );

    return JSON.stringify(tournament);
  }

  /**
   * @description Get all tournaments
   * @returns {Promise<string>} The tournaments
   * @memberof tournamentsService
   *
   */
  @Get()
  @ApiOperation({ summary: 'Get all Tournaments' })
  findAll(): Promise<string> {
    return this.tournamentsService.findAll();
  }

  /**
   * @description Get all tournaments of a user
   * @param {string} userId The user id
   * @returns {Promise<string>} The tournaments of the user
   * @memberof tournamentsService
   *
   */
  @Get('simple')
  @ApiOperation({ summary: 'Get all TournamentsSimple' })
  getTournamentSimple(): Promise<string> {
    return this.tournamentsService.getTournamentSimple();
  }

  /**
   * @description Get all tournaments of a user
   * @param {string} userId The user id
   * @returns {Promise<string>} The tournaments of the user
   * @memberof tournamentsService
   *
   */
  @Get('simple/:userId')
  @ApiOperation({ summary: 'Get all users TournamentsSimple' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The tournaments has been successfully retrieved.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  getUserTournamentSimple(@Param('userId') userId: string): Promise<string> {
    return this.tournamentsService.getUserTournamentSimple(userId);
  }

  /**
   * @description Get one tournament
   * @param {string} tournamentId The tournament id
   * @returns {Promise<string>} The tournaments
   * @memberof tournamentsService
   *
   */
  @Get(':tournamentId')
  @ApiOperation({ summary: 'Get one Tournament' })
  findOne(@Param('tournamentId') tournamentId: string): Promise<string> {
    return this.tournamentsService.findOne(tournamentId);
  }

  /**
   * @description Generate a new round
   * @param {string} tournamentId The tournament id
   * @returns {Promise<string>} The new round
   * @memberof tournamentsService
   *
   */
  @Post(':tournamentId/generateNewRound')
  @ApiOperation({ summary: 'Generate New Round' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The round has been successfully generated.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  async generateNewRound(
    @Param('tournamentId') tournamentId: string,
  ): Promise<string> {
    return await this.tournamentsService.generateNewRound(tournamentId);
  }

  /**
   * @description Edit a tournament
   * @param {string} tournamentId The tournament id
   * @param {UpdateTournamentDto} updateTournamentDto The tournament data
   * @returns {Promise<string>} The tournament edited
   * @memberof tournamentsService
   *
   */
  @Put(':tournamentId')
  @ApiOperation({ summary: 'Edit tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 201,
    description: 'The tournament has been successfully edited.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  editTournament(
    @Param('tournamentId') tournamentId: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ): Promise<string> {
    return this.tournamentsService.updateTournament(
      tournamentId,
      updateTournamentDto,
    );
  }

  /**
   * @description Add game results
   * @param {string} tournamentId The tournament id
   * @param {matchResultDto} matchResult The match results
   * @returns {Promise<void>} Void
   * @memberof tournamentsService
   *
   */
  @Patch(':tournamentId')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiOperation({ summary: 'Add  Game Results' })
  @ApiResponse({
    status: 201,
    description: 'The game results has been successfully added.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  addScore(
    @Param('tournamentId') tournamentId: string,
    @Body() matchResult: matchResultDto,
  ): Promise<void> {
    return this.tournamentsService.addScore(tournamentId, matchResult);
  }

  /**
   * @description Create a player
   * @param {string} tournamentId The tournament id
   * @param {CreatePlayersDto} createPlayerDto The player data
   * @returns {Promise<Players>} The player created
   * @memberof tournamentsService
   *
   */
  @Patch(':tournamentId/createPlayer')
  @ApiOperation({ summary: 'Create a player' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description:
      'The player has been successfully created and added to the user.',
  })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createPlayer(
    @Param('tournamentId') tournamentId: string,
    @Body() createPlayerDto: CreatePlayersDto,
  ): Promise<Players> {
    return this.tournamentsService.createPlayer(tournamentId, createPlayerDto);
  }

  /**
   * @description Add a player to a tournament
   * @param {string} tournamentId The tournament id
   * @param {string} playerId The player id
   * @returns {Promise<string>} The add result
   * @memberof tournamentsService
   *
   */
  @Patch(':tournamentId/addPlayer/:playerId')
  @ApiOperation({ summary: 'Add Player to Tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Player added successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  addPlayer(
    @Param('tournamentId') tournamentId: string,
    @Param('playerId') playerId: string,
  ): Promise<string> {
    return this.tournamentsService.addPlayer(tournamentId, playerId);
  }

  /**
   * @description Get name of players in a tournament
   * @param {string} tournamentId The tournament id
   * @returns {Promise<{ id: string; name: string }[]>} The players of the tournament
   * @memberof tournamentsService
   *
   */
  @Get(':tournamentId/getTournamentPlayers')
  @ApiOperation({ summary: 'Get names of players in tournament' })
  @ApiResponse({
    status: 200,
    description: 'Players names retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getTournamentPlayers(
    @Param('tournamentId') tournamentId: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.tournamentsService.getTournamentPlayers(tournamentId);
  }

  /**
   * @description Get players not in a tournament
   * @param {string} tournamentId The tournament id
   * @returns {Promise<{ id: string; name: string }[]>} The players not in the tournament
   * @memberof tournamentsService
   *
   */
  @Get(':tournamentId/getPlayersNotInTournamment')
  @ApiOperation({ summary: 'Get names of user players not in tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Players names retrieved successfully.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  getPlayersNotInTournamment(
    @Param('tournamentId') tournamentId: string,
  ): Promise<{ id: string; name: string }[]> {
    return this.tournamentsService.getPlayersNotInTournament(tournamentId);
  }

  /**
   * @description Remove a player from a tournament
   * @param {string} tournamentId The tournament id
   * @param {string} playerId The player id
   * @returns {Promise<string>} The delete result
   * @memberof tournamentsService
   *
   */
  @Patch(':tournamentId/removePlayer/:playerId')
  @ApiOperation({ summary: 'Remove Player from Tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The player has been successfully removed.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  removePlayer(
    @Param('tournamentId') tournamentId: string,
    @Param('playerId') playerId: string,
  ): Promise<string> {
    return this.tournamentsService.removePlayer(tournamentId, playerId);
  }

  /**
   * @description Delete a tournament
   * @param {string} tournamentId The tournament id
   * @returns {Promise<string>} The delete result
   * @memberof tournamentsService
   *
   */
  @Delete(':tournamentId')
  @ApiOperation({ summary: 'Delete Tournament' })
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  remove(@Param('tournamentId') tournamentId: string): Promise<string> {
    return this.tournamentsService.remove(tournamentId);
  }

  /**
   * @description Update all players stats at the end of a tournament
   * @param {string} tournamentId The tournament id
   * @returns {Promise<string>} The update result
   * @memberof tournamentsService
   *
   */
  @Patch(':tournamentId/endOfTournament')
  @ApiBearerAuth()
  @UseGuards(FirebaseAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'The stats has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Unauthorized.' })
  endOfTournament(
    @Param('tournamentId') tournamentId: string,
  ): Promise<string> {
    return this.tournamentsService.endOfTournament(tournamentId);
  }
}
