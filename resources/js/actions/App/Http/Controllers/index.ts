import Auth from './Auth'
import DemoLeadController from './DemoLeadController'
import MatriculaController from './MatriculaController'
import PaymentController from './PaymentController'
import TeacherRegistrationController from './TeacherRegistrationController'
import UserController from './UserController'
import program_academy from './program_academy'
import RoleController from './RoleController'
import EnrollmentController from './EnrollmentController'
import ScheduleController from './ScheduleController'
import AuditController from './AuditController'
import Admin from './Admin'
import StudyPlanController from './StudyPlanController'
import AttendanceController from './AttendanceController'
import TeacherController from './TeacherController'
import StudentController from './StudentController'
import ParentController from './ParentController'
import DependentController from './DependentController'
import CommunicationController from './CommunicationController'
import Settings from './Settings'
const Controllers = {
    Auth: Object.assign(Auth, Auth),
DemoLeadController: Object.assign(DemoLeadController, DemoLeadController),
MatriculaController: Object.assign(MatriculaController, MatriculaController),
PaymentController: Object.assign(PaymentController, PaymentController),
TeacherRegistrationController: Object.assign(TeacherRegistrationController, TeacherRegistrationController),
UserController: Object.assign(UserController, UserController),
program_academy: Object.assign(program_academy, program_academy),
RoleController: Object.assign(RoleController, RoleController),
EnrollmentController: Object.assign(EnrollmentController, EnrollmentController),
ScheduleController: Object.assign(ScheduleController, ScheduleController),
AuditController: Object.assign(AuditController, AuditController),
Admin: Object.assign(Admin, Admin),
StudyPlanController: Object.assign(StudyPlanController, StudyPlanController),
AttendanceController: Object.assign(AttendanceController, AttendanceController),
TeacherController: Object.assign(TeacherController, TeacherController),
StudentController: Object.assign(StudentController, StudentController),
ParentController: Object.assign(ParentController, ParentController),
DependentController: Object.assign(DependentController, DependentController),
CommunicationController: Object.assign(CommunicationController, CommunicationController),
Settings: Object.assign(Settings, Settings),
}

export default Controllers