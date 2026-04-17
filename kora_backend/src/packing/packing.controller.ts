import { Body, Controller, Delete, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { CreatePackingItemDto } from './dtos/create-packing-item.dto';
import { PackingService } from './packing.service';
import type { PackingCategory } from './packing.types';

@Controller('packing')
export class PackingController {
  constructor(private readonly packingService: PackingService) {}

  @Get()
  getOverview(
    @Query('category') category?: PackingCategory,
    @Query('tripId') tripId?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.packingService.getOverview(category, tripId, requestUserId);
  }

  @Patch('items')
  addItem(
    @Body() dto: CreatePackingItemDto,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.packingService.addItem(dto, requestUserId);
  }

  @Patch('items/:id/toggle')
  toggleItem(
    @Param('id') id: string,
    @Query('tripId') tripId?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.packingService.toggleItem(id, tripId, requestUserId);
  }

  @Delete('items/:id')
  deleteItem(
    @Param('id') id: string,
    @Query('tripId') tripId?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.packingService.deleteItem(id, tripId, requestUserId);
  }
}
