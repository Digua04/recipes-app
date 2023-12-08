import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Recipes from "../components/Recipes";
import { useAuthToken } from "../AuthTokenContext";

jest.mock("../AuthTokenContext");
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

describe("Recipes Component Tests", () => {
    const mockAccessToken = "12345";
    const recipeItem = {
        id: 100,
        title: "Test Recipe",
        cook_time_minutes: 30,
        video_url: "https://www.youtube.com/watch?v=12345",
    };
    const recipesItems = [ {
        id: 1,
        title: "chicken soup",
        cook_time_minutes: 20,
        video_url: "https://www.youtube.com/watch?v=12345" },
        { 
        id: 2,
        title: "apple pie",
        cook_time_minutes: 40,
        video_url: "https://www.youtube.com/watch?v=12345" },
    ];

    beforeEach(() => {
        useAuthToken.mockReturnValue({
            accessToken: mockAccessToken,
        });
        global.fetch = jest.fn((url, options) => {
            if (
                url === `${process.env.REACT_APP_API_URL}/app/recipes` &&
                options.method !== "POST"
            ) { 
              return Promise.resolve({ 
                ok: true, 
                json: () => 
                Promise.resolve(recipesItems) 
            })};
            if (
                url === `${process.env.REACT_APP_API_URL}/app/recipes` &&
                options.method === "POST"
            ) { 
              return Promise.resolve({ 
                ok: true, 
                json: () => 
                Promise.resolve(recipeItem) 
            })};
        })
    });

    test("renders without crashing", () => {
        render(<Recipes />);
        expect(screen.getByText("My Existing Recipes")).toBeInTheDocument();
    });

    test("displays inputs correctly", () => {
        render(<Recipes />);

        expect(screen.getByLabelText("Title:")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("text")).toBeInTheDocument();
        expect(screen.getByLabelText("Cook Time (minutes):")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("ex: 30")).toBeInTheDocument();
        expect(screen.getByLabelText("Video URL:")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("optional")).toBeInTheDocument();
    });

    test("displays submit button correctly", () => {
        render(<Recipes />);

        expect(screen.getByRole("button", { 
            name: "+ Create New Recipe" })).toBeInTheDocument();
    });

    test("displays hr correctly", () => {
        render(<Recipes />);

        expect(screen.getByRole("separator")).toBeInTheDocument();
    });

    test("renders and interacts correctly", async () => {
        render(<Recipes />);

        await waitFor(() => {
            expect(screen.getByText("chicken soup")).toBeInTheDocument();
        });
        expect(screen.getByText("apple pie")).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText("Title:"), {
            target: { value: "Test Recipe" },
        });
        fireEvent.change(screen.getByLabelText("Cook Time (minutes):"), {
            target: { value: "30" },
        });
        fireEvent.change(screen.getByLabelText("Video URL:"), {
            target: { value: "https://www.youtube.com/watch?v=12345" },
        });
        fireEvent.click(screen.getByRole("button", { 
            name: "+ Create New Recipe" }));

        await waitFor(() => {
            expect(screen.getByText("Test Recipe")).toBeInTheDocument();
        });
    });
})