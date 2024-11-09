import {Module} from '@nestjs/common';
import {EmployeeService} from './services/employee.service';
import {EmployeeController} from './controller/employee.controller';
import {LoggerService} from '../logger/logger.service';
import {JweJwtAccessTokenStrategy} from '../token/strategy/jwe-jwt-access-token.strategy';
import {JwtConfigModule} from '../token/jwe-jwt.module';
import {PrismaModule} from 'src/modules/prisma/prisma.module';
import {ConfigModule} from '@nestjs/config';

@Module({
  imports: [
    JwtConfigModule,
    PrismaModule,
    ConfigModule.forRoot(),
  ],
  providers: [EmployeeService, LoggerService, JweJwtAccessTokenStrategy],
  controllers: [EmployeeController]
})
export class EmployeeModule {}
