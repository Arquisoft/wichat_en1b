Feature: Register a new user

  Scenario: Register user with valid credentials
    Given An unregistered user with valid credentials
    When Filling in the register form and submit
    Then Should be shown a success message

  Scenario: Register an existing user
    Given User that already exists
    When Trying to register with existing username
    Then Should be shown an user already existing error message

  Scenario: Register with invalid data - Short username
    Given User with a short invalid username
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - Long username
    Given User with a long invalid username
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - Non-alphanumeric username
    Given User with special characters in the username
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - Empty username
    Given User with an empty username
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - Empty password
    Given User with an empty password
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - Weak password
    Given User with a weak password
    When Trying to register
    Then Should be shown an error message

  Scenario: Register with invalid data - passwords dont match
    Given User with different passwords
    When Trying to register
    Then Should be shown an error message