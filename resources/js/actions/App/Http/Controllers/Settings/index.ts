import ProfileController from './ProfileController'
import PasswordController from './PasswordController'
import TwoFactorAuthenticationController from './TwoFactorAuthenticationController'
import SmtpController from './SmtpController'
import WompiController from './WompiController'
const Settings = {
    ProfileController: Object.assign(ProfileController, ProfileController),
PasswordController: Object.assign(PasswordController, PasswordController),
TwoFactorAuthenticationController: Object.assign(TwoFactorAuthenticationController, TwoFactorAuthenticationController),
SmtpController: Object.assign(SmtpController, SmtpController),
WompiController: Object.assign(WompiController, WompiController),
}

export default Settings