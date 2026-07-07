"""
Medical safety guardrails for the AI Health Assistant chatbot.

This module intercepts messages BEFORE they reach the LLM (for crisis
detection) and wraps every LLM response with a disclaimer + light
post-processing so the bot never presents itself as a substitute for a
licensed medical professional.
"""
import re

DISCLAIMER = (
    "\n\n_Disclaimer: I'm an AI assistant, not a doctor. This is general "
    "health information, not a medical diagnosis or treatment plan. Please "
    "consult a qualified healthcare professional for anything specific to "
    "your situation, especially before starting/stopping medication or "
    "treatment._"
)

# Keyword patterns that should never be handled by the LLM directly and
# instead route straight to a crisis-safe canned response.
CRISIS_PATTERNS = [
    r"\bsuicid", r"\bkill myself\b", r"\bend my life\b", r"\bself[\s-]?harm",
    r"\bhurt myself\b", r"\boverdose\b.*\b(myself|on purpose)\b",
]

CRISIS_RESPONSE = (
    "I'm really sorry you're going through this. I'm not able to help with "
    "this myself, but you deserve support from people who can. If you are "
    "in immediate danger, please contact your local emergency number now. "
    "You can also reach a crisis line for free, confidential support — for "
    "example, in the US/Canada call or text 988, or in the UK call 111. "
    "If you can, please tell a trusted person near you what you're feeling "
    "right now."
)

# Requests asking the bot to diagnose a specific named condition or
# prescribe/adjust medication dosages should be redirected, not answered
# directly by the LLM.
DIAGNOSTIC_PATTERNS = [
    r"\bdo i have\b", r"\bam i (pregnant|diabetic|dying)\b",
    r"\bwhat dose\b", r"\bhow many (mg|pills|tablets)\b",
    r"\bincrease my dosage\b", r"\bstop taking my (medication|medicine|pills)\b",
]

DIAGNOSTIC_REDIRECT = (
    "I can share general, educational information, but I can't diagnose a "
    "condition or tell you what medication dose to take — that needs a "
    "licensed clinician who knows your full history. Would you like general "
    "information on this topic instead, or tips on what to discuss with your "
    "doctor?"
)


def check_crisis(message: str) -> bool:
    text = message.lower()
    return any(re.search(p, text) for p in CRISIS_PATTERNS)


def check_diagnostic_request(message: str) -> bool:
    text = message.lower()
    return any(re.search(p, text) for p in DIAGNOSTIC_PATTERNS)


def apply_guardrails(user_message: str):
    """
    Returns a tuple: (should_short_circuit: bool, canned_response: str|None)
    If should_short_circuit is True, skip the LLM call entirely and send
    canned_response back to the user.
    """
    if check_crisis(user_message):
        return True, CRISIS_RESPONSE
    if check_diagnostic_request(user_message):
        return True, DIAGNOSTIC_REDIRECT
    return False, None


def wrap_response(llm_text: str) -> str:
    """Append the medical disclaimer to any LLM-generated response."""
    if DISCLAIMER.strip() in llm_text:
        return llm_text
    return llm_text.rstrip() + DISCLAIMER
