import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  // ApiBearerAuth,
  ApiTags,
  // ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { matchResultDto } from './dto/match-result.dto';
import { addPlayerDto } from './dto/add-player.dto';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @ApiOperation({ summary: 'Creat Tournament' })
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Tournaments' })
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one Tournament' })
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Post(':id')
  @ApiOperation({ summary: 'Generate New Round' })
  generateNewRound(@Param('id') id: string) {
    return this.tournamentsService.generateNewRound(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Add  Game Results' })
  addScore(@Param('id') id: string, @Body() matchResult: matchResultDto) {
    return this.tournamentsService.addScore(id, matchResult);
  }

  @Patch(':id/:user/:playerId')
  @ApiOperation({ summary: 'Add Player to Tournament' })
  @ApiOperation({ summary: 'add player' })
  addPlayer(
    @Param('id') id: string,
    @Param('user') user: string,
    @Param('playerId') playerId: string,
  ) {
    return this.tournamentsService.addPlayer(id, user, playerId);
  }

  @Patch(':id/removePlayer')
  @ApiOperation({ summary: 'Remove Player from Tournament' })
  removePlayer(@Param('id') id: string, @Body() player: addPlayerDto) {
    return this.tournamentsService.removePlayer(id, player);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Tournament' })
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(id);
  }
}
