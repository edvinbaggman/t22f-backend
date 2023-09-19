import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { matchResultDto } from './dto/match-result.dto';
import { addPlayerDto } from './dto/add-player.dto';

@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  create(@Body() createTournamentDto: CreateTournamentDto) {
    return this.tournamentsService.create(createTournamentDto);
  }

  @Get()
  findAll() {
    return this.tournamentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Post(':id')
  generateNewRound(@Param('id') id: string) {
    return this.tournamentsService.generateNewRound(id);
  }

  @Patch(':id')
  addScore(@Param('id') id: string, @Body() matchResult: matchResultDto) {
    return this.tournamentsService.addScore(id, matchResult);
  }

  @Patch(':id/addPlayer')
  addPlayer(@Param('id') id: string, @Body() player: addPlayerDto) {
    return this.tournamentsService.addPlayer(id, player);
  }

  @Patch(':id/removePlayer')
  removePlayer(@Param('id') id: string, @Body() player: addPlayerDto) {
    return this.tournamentsService.removePlayer(id, player);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tournamentsService.remove(id);
  }
}
