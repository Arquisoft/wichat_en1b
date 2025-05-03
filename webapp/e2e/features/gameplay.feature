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

  Scenario: Seeing game modes
    Given User in the home window
    When Entering the game mode panel
    Then Retrieve all the game modes

  Scenario: Interacting with IA
    Given User in the home window
    When Entering a new game
    Then Should interact with the IA
    
    