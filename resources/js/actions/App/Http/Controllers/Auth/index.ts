import AuthenticatedSessionController from './AuthenticatedSessionController'
import PasswordResetLinkController from './PasswordResetLinkController'
import NewPasswordController from './NewPasswordController'
import GoogleAuthController from './GoogleAuthController'
import RegisteredUserController from './RegisteredUserController'
import EmailVerificationPromptController from './EmailVerificationPromptController'
import VerifyEmailController from './VerifyEmailController'
import EmailVerificationNotificationController from './EmailVerificationNotificationController'
const Auth = {
    AuthenticatedSessionController: Object.assign(AuthenticatedSessionController, AuthenticatedSessionController),
PasswordResetLinkController: Object.assign(PasswordResetLinkController, PasswordResetLinkController),
NewPasswordController: Object.assign(NewPasswordController, NewPasswordController),
GoogleAuthController: Object.assign(GoogleAuthController, GoogleAuthController),
RegisteredUserController: Object.assign(RegisteredUserController, RegisteredUserController),
EmailVerificationPromptController: Object.assign(EmailVerificationPromptController, EmailVerificationPromptController),
VerifyEmailController: Object.assign(VerifyEmailController, VerifyEmailController),
EmailVerificationNotificationController: Object.assign(EmailVerificationNotificationController, EmailVerificationNotificationController),
}

export default Auth