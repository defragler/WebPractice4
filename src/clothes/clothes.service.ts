import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateClothesDto } from './dto/create-clothes.dto';
import { UpdateClothesDto } from './dto/update-clothes.dto';

export interface ClothingItem {
  id: string;
  title: string;
  price: number;
  size: string;
  material: string;
  color: string;
}

@Injectable()
export class ClothesService {
  private readonly items: ClothingItem[] = [
    {
      id: '1',
      title: 'Футболка Basic',
      price: 799,
      size: 'M',
      material: 'Бавовна',
      color: 'Чорний',
    },
    {
      id: '2',
      title: 'Джинси Classic',
      price: 2199,
      size: '32',
      material: 'Денім',
      color: 'Синій',
    },
    {
      id: '3',
      title: 'Худі Oversize',
      price: 1899,
      size: 'L',
      material: 'Бавовна',
      color: 'Сірий',
    },
  ];

  findAll(search?: string, limit?: string): ClothingItem[] {
    let result = [...this.items];

    if (search?.trim()) {
      const normalizedSearch = search.trim().toLowerCase();
      result = result.filter((item) =>
        item.title.toLowerCase().includes(normalizedSearch),
      );
    }

    if (limit !== undefined) {
      const parsedLimit = Number.parseInt(limit, 10);
      if (Number.isInteger(parsedLimit) && parsedLimit >= 0) {
        result = result.slice(0, parsedLimit);
      }
    }

    return result;
  }

  findOne(id: string): ClothingItem {
    const item = this.items.find((clothing) => clothing.id === id);

    if (!item) {
      throw new NotFoundException(
        `Сутність з ID ${id} не знайдена`,
      );
    }

    return item;
  }

  create(dto: CreateClothesDto): ClothingItem {
    const item: ClothingItem = {
      id: randomUUID(),
      ...dto,
    };

    this.items.push(item);
    return item;
  }

  update(id: string, dto: UpdateClothesDto): ClothingItem {
    const item = this.findOne(id);
    Object.assign(item, dto);
    return item;
  }

  remove(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(
        `Сутність з ID ${id} не знайдена`,
      );
    }

    this.items.splice(index, 1);
  }
}
