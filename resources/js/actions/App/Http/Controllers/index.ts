import Auth from './Auth'
import RoleController from './RoleController'
import UserController from './UserController'
import AuditController from './AuditController'
import program_academy from './program_academy'
import schedules from './schedules'
import Assists from './Assists'
import Pay from './Pay'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
RoleController: Object.assign(RoleController, RoleController),
UserController: Object.assign(UserController, UserController),
AuditController: Object.assign(AuditController, AuditController),
program_academy: Object.assign(program_academy, program_academy),
schedules: Object.assign(schedules, schedules),
Assists: Object.assign(Assists, Assists),
Pay: Object.assign(Pay, Pay),
Settings: Object.assign(Settings, Settings),
}

export default Controllers