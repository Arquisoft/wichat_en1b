Feature: Login into the app

  Scenario: Login with valid credentials
    Given Registered user with valid credentials
    When Logging in using the correct credentials
    Then Should show the home view

  Scenario: Login with empty username
    Given User without username
    When Trying to log in
    Then Should show an error message

  Scenario: Login with empty password
    Given User without password
    When Trying to log in
    Then Should show an error message

  Scenario: Login with incorrect password
    Given Registered user with incorrect password
    When Trying to log in
    Then Should show an error message

  Scenario: Login with non-existing user
    Given Not existent username
    When Trying to log in
    Then Should show an error message