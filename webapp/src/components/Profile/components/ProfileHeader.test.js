import { render, screen } from '@testing-library/react';
import ProfileHeader from './ProfileHeader';

describe('ProfileHeader', () => {
  it('renders correctly', () => {
    const mockProps = {
      username: 'John Doe',
      profileImage: 'https://example.com/profile.jpg',
      registrationDate: new Date('2020-01-01'),
      getMembershipDuration: jest.fn(() => 123),
      onOpenSettings: jest.fn(),
      isOwnProfile: true,
    };

    render(
      <ProfileHeader {...mockProps} />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Member since January 1, 2020')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
  });
});