import { fireEvent, screen, render, cleanup } from "@testing-library/react";
import Home from './index.tsx';

test.afterEach(cleanup);

jest.mock("next/font/local", () => function() {
  return {
        style: {
          fontFamily: 'atma'
      }
    }
  }
);
jest.mock('nanoid');

test('the page scrolls down and up', () => {
  render(<Home />);
  const topSection = screen.getByTestId('top-section');
  const bottomSection = screen.getByTestId('bottom-section');

  expect(topSection).toBeVisible();
  expect(bottomSection).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText('down')); 

  // the bottom screen should be visible
  expect(topSection).toHaveStyle('transform: translateY(-100vh);');
  expect(bottomSection).toHaveStyle('transform: translateY(-100vh);');

  fireEvent.click(screen.getByLabelText('up'));

    // the top screen should be visible
  expect(topSection).toHaveStyle('transform: translateY(0);');
  expect(bottomSection).toHaveStyle('transform: translateY(0);');
})