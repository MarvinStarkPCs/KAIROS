import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import AcademySurveyController from './AcademySurveyController'
import TwoFactorAuthenticationController from './TwoFactorAuthenticationController'
import SmtpController from './SmtpController'
import WompiController from './WompiController'
import SystemAccessController from './SystemAccessController'
const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
PasswordController: Object.assign(PasswordController, PasswordController),
AcademySurveyController: Object.assign(AcademySurveyController, AcademySurveyController),
TwoFactorAuthenticationController: Object.assign(TwoFactorAuthenticationController, TwoFactorAuthenticationController),
SmtpController: Object.assign(SmtpController, SmtpController),
WompiController: Object.assign(WompiController, WompiController),
SystemAccessController: Object.assign(SystemAccessController, SystemAccessController),
}

export default Settings