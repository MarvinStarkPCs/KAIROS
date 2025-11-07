import Auth from './Auth'
import PaymentController from './PaymentController'
import UserController from './UserController'
import program_academy from './program_academy'
import RoleController from './RoleController'
import EnrollmentController from './EnrollmentController'
import ScheduleController from './ScheduleController'
import AuditController from './AuditController'
import StudyPlanController from './StudyPlanController'
import AttendanceController from './AttendanceController'
import TeacherController from './TeacherController'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
PaymentController: Object.assign(PaymentController, PaymentController),
UserController: Object.assign(UserController, UserController),
program_academy: Object.assign(program_academy, program_academy),
RoleController: Object.assign(RoleController, RoleController),
EnrollmentController: Object.assign(EnrollmentController, EnrollmentController),
ScheduleController: Object.assign(ScheduleController, ScheduleController),
AuditController: Object.assign(AuditController, AuditController),
StudyPlanController: Object.assign(StudyPlanController, StudyPlanController),
AttendanceController: Object.assign(AttendanceController, AttendanceController),
TeacherController: Object.assign(TeacherController, TeacherController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers