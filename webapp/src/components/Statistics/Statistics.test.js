import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import { Statistics } from "./Statistics";
import axios from "axios";
import Cookies from "js-cookie";
import userEvent from "@testing-library/user-event";

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Setup mocks
jest.mock("axios");

jest.mock("js-cookie", () => ({
  get: jest.fn(),
  remove: jest.fn(),
  set: jest.fn()
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// TODO implement tests

describe("Statistics Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    Cookies.get.mockReturnValue(
      JSON.stringify({ username: "TestUser", token: "12345" })
    );
  });

  it("works", () => {
    expect(true).toBe(true);
  });
});
