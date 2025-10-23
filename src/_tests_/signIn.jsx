import React from 'react';
import { test } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import SignIn from '../pages/SignIn';

test('sign-in shows validation when submitted empty', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <SignIn />
    </MemoryRouter>
  );

  await user.click(screen.getByRole('button', { name: /sign in/i }));

  expect(screen.getByText('Username is required.')).toBeTruthy();
});
