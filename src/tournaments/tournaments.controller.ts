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
} from '@nestjs/common';
import {
  // ApiBearerAuth,
  ApiTags,
  // ApiResponse,
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

  @Post()
  @ApiOperation({ summary: 'Create Tournament' })
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body('form') body: any, //Body gets validated manually instead
    @UploadedFile() file: Express.Multer.File,
  ) {
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

  @Get()
  @ApiOperation({ summary: 'Get all Tournaments' })
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get('simple')
  @ApiOperation({ summary: 'Get all TournamentsSimple' })
  getTournamentSimple() {
    return this.tournamentsService.getTournamentSimple();
  }

  @Get('simple/:userId')
  @ApiOperation({ summary: 'Get all TournamentsSimple' })
  getUserTournamentSimple(@Param('userId') userId: string) {
    return this.tournamentsService.getUserTournamentSimple(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one Tournament' })
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Post(':id/generateNewRound')
  @ApiOperation({ summary: 'Generate New Round' })
  generateNewRound(@Param('id') id: string) {
    return this.tournamentsService.generateNewRound(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edit tournament' })
  editTournament(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.updateTournament(id, updateTournamentDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Add  Game Results' })
  addScore(@Param('id') id: string, @Body() matchResult: matchResultDto) {
    return this.tournamentsService.addScore(id, matchResult);
  }

  @Patch(':tournamentId/createPlayer')
  @ApiOperation({ summary: 'Create a player' })
  @ApiBearerAuth()
  // @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
  @ApiResponse({
    status: 200,
    description:
      'The player has been successfully created and added to the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  createPlayer(
    @Param('tournamentId') tournamentId: string,
    @Body() createPlayerDto: CreatePlayersDto,
  ) {
    return this.tournamentsService.createPlayer(tournamentId, createPlayerDto);
  }

  @Patch(':id/addPlayer/:playerId')
  @ApiOperation({ summary: 'Add Player to Tournament' })
  @ApiOperation({ summary: 'add player' })
  addPlayer(@Param('id') id: string, @Param('playerId') playerId: string) {
    return this.tournamentsService.addPlayer(id, playerId);
  }

  @Get(':tournamentId/getTournamentPlayers')
  @ApiOperation({ summary: 'Get names of all players of a user' })
  @ApiBearerAuth()
  // @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
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

  @Get(':tournamentId/getPlayersNotInTournamment')
  @ApiOperation({ summary: 'Get names of all players of a user' })
  @ApiBearerAuth()
  // @UseGuards(FirebaseAuthGuard) // To add later when we will use authentication
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

  // to change
  @Patch(':tournamentId/removePlayer/:playerId')
  @ApiOperation({ summary: 'Remove Player from Tournament' })
  removePlayer(
    @Param('tournamentId') tournamentId: string,
    @Param('playerId') playerId: string,
  ) {
    return this.tournamentsService.removePlayer(tournamentId, playerId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Tournament' })
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(id);
  }
}
