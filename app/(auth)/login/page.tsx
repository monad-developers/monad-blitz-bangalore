'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

import { AuthForm } from '@/src/components/auth/auth-form';
import { SubmitButton } from '@/src/components/auth/submit-button';

import { login, LoginActionState } from '@/app/(auth)/actions';
import { Button } from '@/src/components/ui/button';
import { Hexagon } from '@/src/components/globals/hexagon';

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    {
      status: 'idle',
    },
  );

  useEffect(() => {
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      router.refresh();
    }
  }, [state.status, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    formAction(formData);
  };

  return (
    <section className="overflow-clip">
      <section className="relative min-h-screen w-full">
        <div className="absolute inset-0 z-0">
          <div className="absolute">
            <Hexagon size={1200} />
          </div>
        </div>
        {/* Foreground content (sign-up box) */}
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-12">
          <div className="w-full max-w-md rounded-2xl bg-black/30 p-6 shadow-lg backdrop-blur-lg sm:p-8">
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              <h3 className="text-xl font-semibold dark:text-zinc-50">Login</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                Login into CryptAI
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => signIn('google')}
                variant="fushia"
                className="border-2 border-fuchsia-500/30 hover:border-fuchsia-500 hover:bg-fuchsia-500/30"
              >
                Login with Google
              </Button>
              <Button
                onClick={() => signIn('github')}
                variant="fushia"
                className="border-2 border-fuchsia-500/30 hover:border-fuchsia-500 hover:bg-fuchsia-500/30"
              >
                Login with GitHub
              </Button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-white/20" />
              <span className="text-sm text-white/80">OR</span>
              <div className="h-px flex-1 bg-white/20" />
            </div>

            {/* Auth form */}
            <AuthForm action={handleSubmit} defaultEmail={email}>
              <SubmitButton>Login</SubmitButton>
              <p className="mt-4 text-center text-sm text-white dark:text-zinc-400">
                {'Already have an account? '}
                <Link
                  href="/register"
                  className="font-semibold text-fuchsia-500 hover:underline dark:text-zinc-200"
                >
                  Sign up
                </Link>{' '}
                instead.
              </p>
            </AuthForm>
          </div>
        </div>
      </section>
    </section>
  );
}
