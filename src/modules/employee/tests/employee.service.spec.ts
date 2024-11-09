// File: employee/tests/unit/employee.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from '../services/employee.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggerService } from '../../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock the PrismaService methods
const mockPrismaService = {
  employee: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};

jest.mock('../../logger/logger.service');

describe('EmployeeService', () => {
  let employeeService: EmployeeService;
  let prismaService: PrismaService;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        LoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_value'), // Mock any required properties here
          },
        },
      ],
    }).compile();

    employeeService = module.get<EmployeeService>(EmployeeService);
    prismaService = module.get<PrismaService>(PrismaService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an employee successfully', async () => {
    const createEmployeeDto = {
      name: 'John Doe',
      positionId: 1,
      positionName: 'Manager',
    };

    (prismaService.employee.create as jest.Mock).mockResolvedValue({ id: 1, ...createEmployeeDto });

    const result = await employeeService.createEmployee(createEmployeeDto);

    expect(result.success).toBe(true);
    expect(result.data.user.id).toBe(1);
    expect(result.data.user.name).toBe(createEmployeeDto.name);
    expect(prismaService.employee.create).toHaveBeenCalledTimes(1);
    expect(loggerService.info).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee created successfully with ID 1' }));
  });

  it('should throw BadRequestException if parent employee does not exist', async () => {
    const createEmployeeDto = {
      name: 'Jane Doe',
      positionId: 1,
      positionName: 'Manager',
      parentId: 999,
    };

    (prismaService.employee.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(employeeService.createEmployee(createEmployeeDto)).rejects.toThrow(BadRequestException);
    expect(prismaService.employee.findUnique).toHaveBeenCalledWith({ where: { id: 999 } });
  });

  it('should fetch employee hierarchy successfully', async () => {
    const positionId = 1;
    const employee = {
      id: 1,
      name: 'John Doe',
      positionId,
      positionName: 'Manager',
      children: [],
    };

    (prismaService.employee.findMany as jest.Mock).mockResolvedValue([employee]);

    const result = await employeeService.getEmployeeHierarchyByPositionId(positionId);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].id).toBe(employee.id);
    expect(result[0].name).toBe(employee.name);
    expect(prismaService.employee.findMany).toHaveBeenCalledWith({ where: { positionId }, include: expect.any(Object) });
  });

  it('should throw NotFoundException if no employees found for position ID', async () => {
    const positionId = 999;
    (prismaService.employee.findMany as jest.Mock).mockResolvedValue([]);

    await expect(employeeService.getEmployeeHierarchyByPositionId(positionId)).rejects.toThrow(NotFoundException);
    expect(prismaService.employee.findMany).toHaveBeenCalledWith({ where: { positionId }, include: expect.any(Object) });
  });
});
