import { Body, Controller, Delete, Get, Headers, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateDocumentDto } from './dtos/create-document.dto';
import { UpdateDocumentDto } from './dtos/update-document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  listDocuments(
    @Query('filter') filter: 'all' | 'verified' | 'pending' | 'expired' = 'all',
    @Query('tripId') tripId?: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.documentsService.listDocuments(filter, tripId, requestUserId);
  }

  @Post()
  createDocument(
    @Body() createDto: CreateDocumentDto,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.documentsService.createDocument(createDto, requestUserId);
  }

  @Patch(':id')
  updateDocument(
    @Param('id') id: string,
    @Body() updateDto: UpdateDocumentDto,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.documentsService.updateDocument(id, updateDto, requestUserId);
  }

  @Delete(':id')
  deleteDocument(
    @Param('id') id: string,
    @Headers('x-kora-user-id') requestUserId?: string,
  ) {
    return this.documentsService.deleteDocument(id, requestUserId);
  }
}
