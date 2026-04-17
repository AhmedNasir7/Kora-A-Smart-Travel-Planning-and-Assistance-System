import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateTripDto } from './dtos/create-trip.dto';
import { UpdateTripStatusDto } from './dtos/update-trip-status.dto';
import { TripsService } from './trips.service';

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  listTrips(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.listTrips(status, search, requestUserId);
  }

  @Get(':id')
  getTrip(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.getTrip(id, requestUserId);
  }

  @Get(':id/timeline')
  getTimeline(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.getTimeline(id, requestUserId);
  }

  @Get(':id/packing')
  getPacking(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.getPacking(id, requestUserId);
  }

  @Get(':id/documents')
  getDocuments(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.getDocuments(id, requestUserId);
  }

  @Post()
  createTrip(
    @Body() createTripDto: CreateTripDto,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.createTrip(createTripDto, requestUserId);
  }

  @Patch(':id/status')
  updateTripStatus(
    @Param('id') id: string,
    @Body() updateTripStatusDto: UpdateTripStatusDto,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.updateTripStatus(id, updateTripStatusDto, requestUserId);
  }

  @Delete(':id')
  deleteTrip(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.tripsService.deleteTrip(id, requestUserId);
  }
}
