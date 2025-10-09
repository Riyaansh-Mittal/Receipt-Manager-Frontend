import React, { useState } from 'react';
import { useMagicLink } from '../hooks/useMagicLink';
import { validateEmail } from '../../../utils/validators';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';

/**
 * Magic Link Request Form Component
 */
const MagicLinkForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { sendMagicLink, emailSent, isLoading } = useMagicLink();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setEmailError('');
    await sendMagicLink(email);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (emailSent) {
    return (
      <Card className="max-w-md w-full">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-green-500 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-4">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click the link in your email to sign in. The link will expire in 10 minutes.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            fullWidth
          >
            Send Another Link
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-md w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">
          Enter your email to receive a magic link for instant sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          error={emailError}
          required
          autoComplete="email"
          autoFocus
        />

        <Button
          type="submit"
          loading={isLoading}
          disabled={!email || isLoading}
          fullWidth
        >
          Send Magic Link
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            We'll email you a magic link for a password-free sign in.
          </p>
        </div>
      </form>
    </Card>
  );
};

export default MagicLinkForm;
