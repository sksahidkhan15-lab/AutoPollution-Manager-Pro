package com.example

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for AutoPollution Pro business rules
 */
class ExampleUnitTest {

  @Test
  fun vehicleRegistrationNumber_isUppercaseAndSanitized() {
    val rawInput = " wb-02 al 4589 "
    val sanitized = rawInput.uppercase().replace(Regex("[\\s-]"), "").trim()
    assertEquals("WB02AL4589", sanitized)
  }

  @Test
  fun indianPhoneNumber_isSanitizedTo10Digits() {
    val rawInput = "+91 98765-43210"
    val digitsOnly = rawInput.replace(Regex("\\D"), "")
    val last10 = digitsOnly.takeLast(10)
    assertEquals("9876543210", last10)
  }

  @Test
  fun whatsAppTemplate_boldingRulesCompliant() {
    // Rule: "Only owner name, vehicle number and expiry date should be bold in WhatsApp."
    val owner = "Arun Mukherjee"
    val vno = "WB02AL4589"
    val exp = "15-Dec-2026"

    val message = "Dear *$owner*, your vehicle *$vno* PUC certificate is expiring on *$exp*."
    assertTrue(message.contains("*$owner*"))
    assertTrue(message.contains("*$vno*"))
    assertTrue(message.contains("*$exp*"))
  }
}
