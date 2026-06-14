Feature: Sales Representative Login to a Market's POS System
  In order to access the POS system for a specific market
  As a sales representative
  I want to be able to log into the POS system by selecting my branch and entering my credentials

  Background:
    Given Sales Representative is on the login page of a market
    And the sales representative has chosen a branch

  Scenario Outline: Validate Login Inputs
    When they enter <email> and <password>
    Then they should see <message> in real time
    And they should not be able to click on the login button

    Examples:
      | email           | password | message                  |
      | valid@email.com | password | ""                       |
      | invalidemail    | password | "Incorrect email format" |
      | valid@email.com | short    | "Password is too short"  |
      | valid@email.com |          | "Password required"      |
      |                 | password | "Email required"         |
      | invalidemail    | invalid  | "Email required"         |

  Scenario: Successful login with valid credentials
    Given they enter a valid email and password
    When they submit
    Then they should be logged in and directed to the POS Discovery Page

  Scenario: Unsuccessful login with invalid credentials
    Given they enter an email or password that pass format validation
    And they submit
    Then they should see an error popup and remain on the login page

  Scenario: Navigation back to market selection
    When they click the 'Back' button
    Then they should be taken back to the market selection page
