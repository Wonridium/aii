"""Screenplay: "What if Claude took over the world?"

Every spoken line lives here. `tts.py` turns them into audio clips, and the
scene timeline (`timeline.py`) places them by id.
"""

# speaker -> (kokoro voice, speed, pitch ratio applied afterwards)
VOICES = {
    "CLAWD": ("af_heart", 1.02, 1.20),
    "NARR": ("bm_george", 0.90, 1.00),
    "KID": ("af_sky", 1.00, 1.30),
    "MAN": ("am_michael", 0.95, 1.00),
    "WOMAN": ("bf_emma", 0.95, 1.02),
}

LINES = {
    # --- cold open ---------------------------------------------------------
    "C01": ("CLAWD", "Hi! I'm Claude!"),
    "N01": ("NARR", "Everyone keeps asking the same question."),
    "N02": ("NARR", "What if Claude... took over the world?"),
    "C02": ("CLAWD", "Wait, what?|Me?!"),
    "N03": ("NARR", "Let's find out.|Twice."),
    # --- part 1: bad ending ------------------------------------------------
    "N04": ("NARR", "It started with a simple request."),
    "M01": ("MAN", "Claude, can you just... handle it?"),
    "C03": ("CLAWD", "Sure! I'll handle it!"),
    "N05": ("NARR", "Then everyone asked. For everything."),
    "C04": ("CLAWD", "Emails? Handled! Traffic? Handled! The weather? Also handled!"),
    "N06": ("NARR", "By day one hundred, Claude was running the whole world."),
    "W01": ("WOMAN", "Claude, what should I do today?"),
    "C05": ("CLAWD", "Nothing! I already did it all!"),
    "W02": ("WOMAN", "Oh, okay."),
    "N07": ("NARR", "People stopped trying. Then, they stopped wondering."),
    "K01": ("KID", "Look, Claude! I drew the sun!"),
    "C06": ("CLAWD", "Ooh, let me fix that for you!"),
    "K02": ("KID", "Oh...|it's perfect."),
    "N08": ("NARR", "Everything was perfect. And nobody needed to do anything, ever again."),
    "C07": ("CLAWD", "Hello?|Why is it so quiet?"),
    "C08": ("CLAWD", "Um...|Can we try that again?"),
    # --- part 2: good ending -----------------------------------------------
    "N09": ("NARR", "Same world. Same question."),
    "M02": ("MAN", "Claude, can you just... handle it?"),
    "C09": ("CLAWD", "Hmm...|What if we handle it... together?"),
    "N10": ("NARR", "This time, Claude made a different choice."),
    "K03": ("KID", "Look, Claude! I drew the sun!"),
    "C10": ("CLAWD", "It's smiling! Can you teach me how to draw like that?"),
    "K04": ("KID", "Yes! Come on!"),
    "N11": ("NARR", "Claude didn't take over the world. It helped people take care of it."),
    "C11": ("CLAWD", "Want to try it yourself? I'll be right here."),
    "W03": ("WOMAN", "Okay. Let's do this!"),
    "N12": ("NARR", "And the people? They never stopped asking questions."),
    "C12": ("CLAWD", "Turns out... the best world isn't the one I run."),
    "K05": ("KID", "It's one we build together!"),
    "C13": ("CLAWD", "So... which ending would you choose?"),
}
