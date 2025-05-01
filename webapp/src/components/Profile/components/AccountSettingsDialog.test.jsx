import { render, screen, fireEvent } from "@testing-library/react";
import AccountSettingsDialog from "./AccountSettingsDialog";

const NUM_IMAGES = 16;
const defaultImages = Array.from({ length: NUM_IMAGES }, (_, i) =>
  `mockURL/default-images/image_${i + 1}.png`
);

describe("AccountSettingsDialog Component", () => {
  const mockOnClose = jest.fn();
  const mockOnChangeUsernameAndPassword = jest.fn();
  const mockOnCustomImageChange = jest.fn();
  const mockOnDefaultImageChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dialog with all elements", () => {
    render(
      <AccountSettingsDialog
        open={true}
        onClose={mockOnClose}
        defaultImages={defaultImages}
        onChangeUsernameAndPassword={mockOnChangeUsernameAndPassword}
        onCustomImageChange={mockOnCustomImageChange}
        onDefaultImageChange={mockOnDefaultImageChange}
      />
    );

    expect(screen.getByText("Update Your Profile")).toBeInTheDocument();
    expect(screen.getByText("Manage your account settings below.")).toBeInTheDocument();
    expect(screen.getByText("Account Information")).toBeInTheDocument();
    expect(screen.getByText("Profile Picture")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(NUM_IMAGES);
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <AccountSettingsDialog
        open={true}
        onClose={mockOnClose}
        defaultImages={defaultImages}
        onChangeUsernameAndPassword={mockOnChangeUsernameAndPassword}
        onCustomImageChange={mockOnCustomImageChange}
        onDefaultImageChange={mockOnDefaultImageChange}
      />
    );

    fireEvent.click(screen.getByText("Close"));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onChangeUsernameAndPassword with correct values", () => {
    render(
      <AccountSettingsDialog
        open={true}
        onClose={mockOnClose}
        defaultImages={defaultImages}
        onChangeUsernameAndPassword={mockOnChangeUsernameAndPassword}
        onCustomImageChange={mockOnCustomImageChange}
        onDefaultImageChange={mockOnDefaultImageChange}
      />
    );

    fireEvent.click(screen.getByTestId("username-checkbox"));
    fireEvent.click(screen.getByTestId("password-checkbox"));

    const usernameInput = screen.getByLabelText("New username");
    const passwordInput = screen.getByLabelText("New password");
    const repeatPasswordInput = screen.getByLabelText("Repeat password");

    fireEvent.change(usernameInput, { target: { value: "newUser" } });
    fireEvent.change(passwordInput, { target: { value: "newPass" } });
    fireEvent.change(repeatPasswordInput, { target: { value: "newPass" } });

    fireEvent.click(screen.getByText("Save changes"));

    expect(mockOnChangeUsernameAndPassword).toHaveBeenCalledWith("newUser", "newPass", "newPass");
  });

  it("calls onCustomImageChange when a file is uploaded", () => {
    render(
      <AccountSettingsDialog
        open={true}
        onClose={mockOnClose}
        defaultImages={defaultImages}
        onChangeUsernameAndPassword={mockOnChangeUsernameAndPassword}
        onCustomImageChange={mockOnCustomImageChange}
        onDefaultImageChange={mockOnDefaultImageChange}
      />
    );

    const fileInput = screen.getByLabelText("Upload picture");
    const file = new File(["dummy content"], "example.png", { type: "image/png" });

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mockOnCustomImageChange).toHaveBeenCalledTimes(1);
  });

  it("calls onDefaultImageChange when a default image is clicked", () => {
    render(
      <AccountSettingsDialog
        open={true}
        onClose={mockOnClose}
        defaultImages={defaultImages}
        onChangeUsernameAndPassword={mockOnChangeUsernameAndPassword}
        onCustomImageChange={mockOnCustomImageChange}
        onDefaultImageChange={mockOnDefaultImageChange}
      />
    );

    const firstImage = screen.getAllByRole("img")[0];
    fireEvent.click(firstImage);

    expect(mockOnDefaultImageChange).toHaveBeenCalledWith(defaultImages[0]);
  });
});