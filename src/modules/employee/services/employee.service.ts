// import {CreateEmployeeDto} from './dtos/employee.dto';
// import {PrismaService} from '../prisma/prisma.service';
// import {Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
// import {employeeCreatedMessage} from './utils/string';
// import {LoggerService} from '../logger/logger.service';
//
// @Injectable()
// export class EmployeeService {
//   constructor(
//     private readonly prisma: PrismaService,
//     private readonly logger: LoggerService
//   ) {}
//
//   async createEmployee(createEmployeeDto: CreateEmployeeDto) {
//     const {name, positionId, positionName, parentId} = createEmployeeDto;
//
//     let validParentId = null;
//     if (parentId && parentId > 0) {
//       this.logger.info({message: `Checking if parent employee with id ${parentId} exists.`});
//
//       const parentEmployee = await this.prisma.employee.findUnique({
//         where: {id: parentId}
//       });
//
//       if (!parentEmployee) {
//         this.logger.error({message: `Parent employee with id ${parentId} does not exist.`});
//         throw new BadRequestException('Parent employee does not exist');
//       }
//
//       validParentId = parentId;
//     }
//
//     const newEmployee = await this.prisma.employee.create({
//       data: {
//         name,
//         positionId,
//         positionName,
//         parentId: validParentId
//       }
//     });
//
//     this.logger.info({message: `Employee created successfully with ID ${newEmployee.id}`});
//
//     return {
//       success: true,
//       message: employeeCreatedMessage,
//       data: {
//         user: newEmployee
//       }
//     };
//   }
//
//   async getEmployeeHierarchyByPositionId(positionId: number) {
//     const employees = await this.prisma.employee.findMany({
//       where: {positionId},
//       include: this.buildIncludeHierarchy()
//     });
//
//     if (!employees || employees.length === 0) {
//       throw new NotFoundException(`No employees found for position ID ${positionId}`);
//     }
//
//     return employees.map(employee => this.formatHierarchy(employee));
//   }
//
//   // Helper function to dynamically build the include structure
//   private buildIncludeHierarchy(depth = 30): any {
//     const includeObj: any = {children: true};
//     let currentLevel = includeObj;
//
//     // Dynamically add children inclusion for the desired depth
//     for (let i = 1; i < depth; i++) {
//       currentLevel.children = {include: {children: true}};
//       currentLevel = currentLevel.children.include;
//     }
//
//     return {children: includeObj.children};
//   }
//
//   private formatHierarchy(employee: any) {
//     return {
//       id: employee.id,
//       name: employee.name,
//       positionId: employee.positionId,
//       positionName: employee.positionName,
//       child: employee.children && employee.children.length ? employee.children.map((child: any) => this.formatHierarchy(child)) : null
//     };
//   }
// }


import {CreateEmployeeDto} from '../dtos/employee.dto';
import {PrismaService} from '../../prisma/prisma.service';
import {Injectable, BadRequestException, NotFoundException} from '@nestjs/common';
import {employeeCreatedMessage} from '../utils/string';
import {LoggerService} from '../../logger/logger.service';

@Injectable()
export class EmployeeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService
  ) {}

  async createEmployee(createEmployeeDto: CreateEmployeeDto) {
    const {name, positionId, positionName, parentId} = createEmployeeDto;

    this.logger.info({message: `Starting createEmployee with data: ${JSON.stringify(createEmployeeDto)}`});

    let validParentId = null;
    if (parentId && parentId > 0) {
      this.logger.info({message: `Checking if parent employee with id ${parentId} exists.`});

      const parentEmployee = await this.prisma.employee.findUnique({
        where: {id: parentId}
      });

      if (!parentEmployee) {
        this.logger.error({message: `Parent employee with id ${parentId} does not exist.`});
        throw new BadRequestException('Parent employee does not exist');
      }

      this.logger.info({message: `Parent employee with id ${parentId} verified.`});
      validParentId = parentId;
    }

    try {
      this.logger.info({message: `Creating new employee with name: ${name}`});
      const newEmployee = await this.prisma.employee.create({
        data: {
          name,
          positionId,
          positionName,
          parentId: validParentId
        }
      });

      this.logger.info({message: `Employee created successfully with ID ${newEmployee.id}`});

      return {
        success: true,
        message: employeeCreatedMessage,
        data: {
          user: newEmployee
        }
      };
    } catch (error) {
      this.logger.error({message: `Failed to create employee. Error: ${error}`, details: error});
      throw new BadRequestException('Failed to create employee');
    }
  }

  async getEmployeeHierarchyByPositionId(positionId: number) {
    this.logger.info({message: `Fetching employee hierarchy for position ID ${positionId}`});

    try {
      const employees = await this.prisma.employee.findMany({
        where: {positionId},
        include: this.buildIncludeHierarchy()
      });

      if (!employees || employees.length === 0) {
        this.logger.warn({message: `No employees found for position ID ${positionId}`});
        throw new NotFoundException(`No employees found for position ID ${positionId}`);
      }

      this.logger.info({message: `Employee hierarchy fetched successfully for position ID ${positionId}`});
      return employees.map(employee => this.formatHierarchy(employee));
    } catch (error) {
      this.logger.error({message: `Error while fetching employee hierarchy. Error: ${error}`, details: error});
      throw new NotFoundException('Error while fetching employee hierarchy');
    }
  }

  // Helper function to dynamically build the include structure
  private buildIncludeHierarchy(depth = 30): any {
    this.logger.info({message: `Building include hierarchy with depth: ${depth}`});
    const includeObj: any = {children: true};
    let currentLevel = includeObj;

    for (let i = 1; i < depth; i++) {
      currentLevel.children = {include: {children: true}};
      currentLevel = currentLevel.children.include;
    }

    return {children: includeObj.children};
  }

  private formatHierarchy(employee: any) {
    this.logger.info({message: `Formatting hierarchy for employee ID: ${employee.id}`});
    return {
      id: employee.id,
      name: employee.name,
      positionId: employee.positionId,
      positionName: employee.positionName,
      child: employee.children && employee.children.length ? employee.children.map((child: any) => this.formatHierarchy(child)) : null
    };
  }
}
