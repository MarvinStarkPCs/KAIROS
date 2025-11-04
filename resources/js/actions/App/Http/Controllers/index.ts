import Auth from './Auth'
import RoleController from './RoleController'
import UserController from './UserController'
import AuditController from './AuditController'
import program_academy from './program_academy'
import StudyPlanController from './StudyPlanController'
import EnrollmentController from './EnrollmentController'
import ScheduleController from './ScheduleController'
import AttendanceController from './AttendanceController'
import PaymentController from './PaymentController'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
RoleController: Object.assign(RoleController, RoleController),
UserController: Object.assign(UserController, UserController),
AuditController: Object.assign(AuditController, AuditController),
program_academy: Object.assign(program_academy, program_academy),
StudyPlanController: Object.assign(StudyPlanController, StudyPlanController),
EnrollmentController: Object.assign(EnrollmentController, EnrollmentController),
ScheduleController: Object.assign(ScheduleController, ScheduleController),
AttendanceController: Object.assign(AttendanceController, AttendanceController),
PaymentController: Object.assign(PaymentController, PaymentController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers