import {Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Param, Get} from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import {CreateEmployeeDto, GetEmployeeHierarchyDto} from '../dtos/employee.dto';
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import {EMPLOYEE_CREATE} from '../utils/string';
import {JweJwtAccessTokenStrategy} from '../../token/strategy/jwe-jwt-access-token.strategy';

@ApiTags('Employee')
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post(EMPLOYEE_CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({ description: 'The employee has been successfully created.' })
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @UseGuards(JweJwtAccessTokenStrategy)
  @Post('hierarchy')
  @ApiOperation({ summary: 'Get employee hierarchy by ID (POST request)' })
  @ApiCreatedResponse({ description: 'Returns the employee hierarchy.' })
  async getEmployeeHierarchyByPost(@Body() getEmployeeHierarchyDto: GetEmployeeHierarchyDto) {
    const { id } = getEmployeeHierarchyDto;
    return await this.employeeService.getEmployeeHierarchyByPositionId(id);
  }
}
