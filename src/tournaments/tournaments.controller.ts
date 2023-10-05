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
import { FileInterceptor } from '@nestjs/platform-express';
import { IsNotEmpty, IsString, validate } from 'class-validator';

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

    return this.tournamentsService.create(createTournamentDto, file);
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
