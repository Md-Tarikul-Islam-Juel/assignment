
import { IsString, IsInt, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({ description: 'Name of the employee', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Position ID of the employee', example: 1 })
  @IsInt()
  positionId: number;

  @ApiProperty({ description: 'Position name of the employee', example: 'Junior Engineer' })
  @IsString()
  positionName: string;

  @ApiProperty({ description: 'Parent employee ID (null if top-level employee)', example: null, required: false })
  @IsInt()
  @IsOptional()
  parentId?: number | null;
}

export class GetEmployeeHierarchyDto {
  @ApiProperty({ description: 'The ID of the employee to fetch hierarchy for', example: 1 })
  @IsInt()
  id: number;
}



