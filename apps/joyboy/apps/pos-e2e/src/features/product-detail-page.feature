Feature: Sales Representative can see the Variant leadtime  on the PDP

  Background:
    Given the sales representative on the PDP

  Scenario Outline: Product Availability after <command>
    Given the sales representative <command> on the PDP
    When the system triggers 'getleadtimeshippingfee'
    Then display the Estimated Delivery information and ensure the Add to Cart button is clickable

    Examples:
      | command                 |
      | change-variant          |
      | change-stock-location   |
      | change-variant-quantity |

  Scenario Outline: Product Unavailability after <command>
    Given the sales representative <command> on the PDP
    When the system triggers 'getleadtimeshippingfee'
    Then display the Out of Stock information and ensure the Add to Cart button is disabled

    Examples:
      | command                 |
      | change-variant          |
      | change-stock-location   |
      | change-variant-quantity |
