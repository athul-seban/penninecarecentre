import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Role } from '../roles/role.entity';
import { PermissionsGuard } from './permissions.guard';

// Global so every feature module can reference PermissionsGuard in @UseGuards(...)
// without each one importing it individually.
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Role])],
  providers: [PermissionsGuard],
  exports: [PermissionsGuard],
})
export class PermissionsModule {}
