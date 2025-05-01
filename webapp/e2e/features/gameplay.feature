Feature: Playing the game

  Scenario: Log and see the Game pannel
    Given Existing user
    When Logged in
    Then Should be seen the home window
    And Should be seen the profile pannel
    And Should be seen the new game pannel
    And Should be seen the statistics pannel
    And Should be seen the game modes pannel

  Scenario: Clicking the Game pannel
    Given User in the home window
    When Trying to click the game pannel
    Then A game should be started

  Scenario: Answering a question
    Given User in the home window
    When Entering a new game
    Then The round must be shown
    And The time must be shown
    And Should answer a question
    And The round should change
    And The time should reset

  Scenario: Finnish game
    Given User in the home window
    When Entering a new game
    Then Answer the questions of the game
    And Should be redirected to the statistics view
