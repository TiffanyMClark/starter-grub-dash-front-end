import { render, screen } from "@testing-library/react";
import App from "./App";
import { BrowserRouter } from "react-router-dom";

test("renders GrubDash text", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  // Look for the "GrubDash" heading text
  const grubDashElement = screen.getByText(/grubdash/i);
  expect(grubDashElement).toBeInTheDocument();
});
