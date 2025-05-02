Feature: Entering in the profile

  Scenario: Log and see the profile pannel
    Given Existing user
    When Logging in
    Then Should be seen the home window
    And Should be seen the profile pannel

  Scenario: Clicking the profile pannel
    Given User in the home window
    When Trying to click the profile pannel
    Then The users profile should be shown

  Scenario: Changing the profile information
    Given User in the profile pannel
    When Trying to change the profile information
    Then The new information should be displayed

  Scenario: Seeing the profile statistics
    Given User in the profile pannel
    When Watching the profile statistics
    Then Everything should be correctly displayed

  Scenario: Show other players profile
    Given User in the home pannel
    When Entering the statistics pannel
    Then Click on other players name
    And Show the profile
    And Account details button doesnt exist

  Scenario: The profile visits are visible but not for other users
    Given Two registered users
    When Enter in the statistics pannel
    Then Visits another profile and cant see the profile visits
    And Sign out and login as the other user
    And Show the profile
    And List of users that view your profile is visible
