import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/two-factor/login';
import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Shield, KeyRound } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
        icon: typeof Shield | typeof KeyRound;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Código de Recuperación',
                description:
                    'Por favor confirma el acceso a tu cuenta ingresando uno de tus códigos de recuperación de emergencia.',
                toggleText: 'iniciar sesión usando un código de autenticación',
                icon: KeyRound,
            };
        }

        return {
            title: 'Código de Autenticación',
            description:
                'Ingresa el código de autenticación proporcionado por tu aplicación de autenticación.',
            toggleText: 'iniciar sesión usando un código de recuperación',
            icon: Shield,
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    const Icon = authConfigContent.icon;

    return (
        <AuthLayout
            title={authConfigContent.title}
            description={authConfigContent.description}
        >
            <Head title="Autenticación de Dos Factores" />

            <div className="space-y-6">
                {/* Icon Badge */}
                <div className="flex justify-center">
                    <div className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 p-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-800 text-white shadow-lg">
                            <Icon className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {authConfigContent.title}
                    </h2>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                        {authConfigContent.description}
                    </p>
                </div>

                <Form
                    {...store.form()}
                    className="space-y-6"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className="space-y-3">
                                    <Input
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Ingresa el código de recuperación"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-center font-mono text-lg tracking-wider focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <div className="flex w-full items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-6">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                        >
                                            <InputOTPGroup className="gap-2">
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="h-14 w-12 rounded-lg border-2 border-gray-300 text-xl font-bold transition-all hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 data-[active=true]:border-amber-500 data-[active=true]:ring-2 data-[active=true]:ring-amber-200"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full rounded-lg bg-amber-800 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-amber-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={processing}
                            >
                                {processing ? 'Verificando...' : 'Continuar'}
                            </Button>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="text-center text-sm text-gray-600">
                                    <span>o puedes </span>
                                    <button
                                        type="button"
                                        className="font-semibold text-amber-800 hover:text-amber-900 underline decoration-amber-300 underline-offset-4 transition-all duration-300 hover:decoration-amber-500"
                                        onClick={() =>
                                            toggleRecoveryMode(clearErrors)
                                        }
                                    >
                                        {authConfigContent.toggleText}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </AuthLayout>
    );
}