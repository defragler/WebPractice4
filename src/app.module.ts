import { Module } from '@nestjs/common';
import { ClothesController } from './clothes/clothes.controller';
import { ClothesService } from './clothes/clothes.service';

@Module({
  controllers: [ClothesController],
  providers: [ClothesService],
})
export class AppModule {}
