import { render, screen } from '@testing-library/react';
import AccountSettingsDialog from './AccountSettingsDialog';
import axios from "axios";

const NUM_IMAGES = 16;
const defaultImages = Array.from({ length: NUM_IMAGES }, (_, i) =>
      `mockURL/default-images/image_${i + 1}.png`
);

describe("Account Settings Dialog Tests", () => {
    it("renders the full dialog", () => {
        render(<AccountSettingsDialog open={true} defaultImages={defaultImages} />);
        
        expect(screen.getByText("Update Your Profile")).toBeInTheDocument();
        expect(screen.getByText("Manage your account settings below.")).toBeInTheDocument();

        expect(screen.getByText("Account Information")).toBeInTheDocument();
        expect(screen.getByText("Select what you want to update and provide the new values below.")).toBeInTheDocument();
        expect(screen.getByText("New username", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText("New password", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText("Repeat password", { selector: "span" })).toBeInTheDocument();
        expect(screen.getByText("Save changes")).toBeInTheDocument();
        
        expect(screen.getByText("Profile Picture")).toBeInTheDocument();
        expect(screen.getByText("Upload an image or select a default option.")).toBeInTheDocument();
        expect(screen.getByText("Upload picture")).toBeInTheDocument();

        expect(screen.getAllByRole("img")).toHaveLength(NUM_IMAGES);

        expect(screen.getByText("Close")).toBeInTheDocument();
    });

    it("manages correctly the default image change", () => {
        // TODO
    });
});