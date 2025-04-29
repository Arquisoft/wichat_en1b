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
