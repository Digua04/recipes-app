import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import Home from "../components/Home";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

describe("Home Component Tests", () => {
    const mockLoginWithRedirect = jest.fn();
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useAuth0.mockReturnValue({
            isAuthenticated: false,
            loginWithRedirect: mockLoginWithRedirect,
        });
        useNavigate.mockReturnValue(mockNavigate);
    });

    test("renders without crashing", () => {
        render(<Home />);
        expect(screen.getByText("Recipes App")).toBeInTheDocument();
    });

    test("displays Login button when user is not authenticated", () => {
        render(<Home />);
        expect(screen.getByText("Login")).toBeInTheDocument();
    });

    test("displays Enter App button when user is not authenticated", () => {
        useAuth0.mockReturnValue({
            isAuthenticated: true,
            loginWithRedirect: mockLoginWithRedirect,
        });

        render(<Home />);
        expect(screen.getByText("Enter App")).toBeInTheDocument();
    });

    test("Login button triggers loginWithRedirect", () => {
        render(<Home />);
        fireEvent.click(screen.getByText("Login"));
        expect(mockLoginWithRedirect).toHaveBeenCalled();
    });

    test("Enter App button triggers navigation", () => {
        useAuth0.mockReturnValue({
            isAuthenticated: true,
            loginWithRedirect: mockLoginWithRedirect,
        });

        render(<Home />);
        fireEvent.click(screen.getByText("Enter App"));
        expect(mockNavigate).toHaveBeenCalledWith("/app");
    });

    test("SingUp button triggers loginWithRedirect with correct parameters", () => {
        render(<Home />);
        fireEvent.click(screen.getByText("Create Account"));
        expect(mockLoginWithRedirect).toHaveBeenCalledWith({
            screen_hint: "signup",
        });
    });
});
