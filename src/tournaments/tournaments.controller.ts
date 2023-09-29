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
import { bucket, gcsBucketName } from '../firebase/gcs.config';
// import { bucket, gcsBucketName } from 'src/firebase/gcs.config';
import mime from 'mime-types';
import crypto from 'crypto';

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

  //This is just a test request to upload files. Will be added to create tournament
  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file && file.buffer instanceof Buffer) {
      try {
        const fileType = mime.extension(file.mimetype);
        const fileId = crypto.randomUUID();
        const fileName = `${fileId}.${fileType}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          resumable: false,
          gzip: true,
        });

        blobStream.on('error', (err) => {
          throw err;
        });

        blobStream.on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${gcsBucketName}/${fileName}`;
          console.log('File uploaded to:', publicUrl);
        });

        blobStream.end(file.buffer);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      console.error('Invalid file format or buffer missing.');
    }
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
