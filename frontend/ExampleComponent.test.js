// ExampleComponent.test.js
import { render, screen } from '@testing-library/react';
import ExampleComponent from './ExampleComponent';

test('renders a message', () => {
  render(<ExampleComponent />);
  expect(screen.getByText(/hello world/i)).toBeInTheDocument();
});
