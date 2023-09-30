import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

test('renders dashboard', async () => {
  axios.get.mockResolvedValue({ data: { neurons: [] } });

  render(<App />);

  expect(screen.getByText(/bittensor dashboard/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /load/i })).toBeInTheDocument();
  expect(await screen.findByText(/^price: 0$/i)).toBeInTheDocument();
});
