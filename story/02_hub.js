CANDLE.script(String.raw`
== a2_start
@act "ACT TWO" "The Hours Before the Ball"
@clock 20:40
@checkpoint
> The Glass at night is a town holding its breath and pretending it isn't. Stovepipes smoke. Someone is frying onions. Somewhere a band is tuning up, one string at a time, as if each note had to be coaxed out onto the ice.
ILSE: "Three hours until midnight." She has her pencil out. "The Office recommends the Examiner begin with the place of death. The Office also recommends a hot meal and eight hours' sleep, so."
=> hub2

== hub2
@hub
@bg glass
@music glass
@title THE GLASS
@weather snow
@if time >= t("23:50")
> Across the Basin, the city's bells begin to count toward midnight.
=> a2_midnight
@endif
@if time < t("22:00")
BAROMETER: The pressure is holding. The wind is from the north. Somewhere beneath the Glass, something very large turns over in its sleep.
@elif time < t("23:00")
BAROMETER: The wind has dropped. That's wrong. Before a warm wind comes, the cold one stops first — like a man pausing in a doorway to let someone else through.
@else
BAROMETER: There. South, far off: a breath of air that smells of wet earth and oranges. The Mild is coming, weeks early. The snow underfoot has begun, very slightly, to squeak less.
@endif
?{seen("hut_enter") && !seen("a2_hub_seen_hut")} => a2_hub_seen_hut
+ [{?seen("hut_enter")|Go back to the Warden's hut.|The Warden's hut, at the dark edge of the Glass.}] -> hut_enter
+ [{?seen("ch_enter")|Go back to the Chandelier.|The Chandelier, where they are getting ready for the Ball.}] -> ch_enter
+ [{?seen("cu_enter")|Go back to the Cutters' Hall.|The Cutters' Hall. Somebody in there is singing.}] -> cu_enter
+ [{?seen("wo_enter")|Go back to the Cold Works.|The Cold Works, on the shore. A long walk across the ice.}] -> wo_enter
+ [{?seen("cp_enter")|Go back to the chapel tent.|The chapel tent of Saint Ondine.}] -> cp_enter
+ [{?seen("me_enter")|Go back to Needle Row.|A mending stall on Needle Row. Ilse keeps not looking at it.}] -> me_enter
+ [{?seen("bo_enter")|Go back to the Mutual's booth.|A small green booth with a brass plate: THE GREAT MUTUAL.}] -> bo_enter
+ [{?seen("wa_enter")|Go back to the watch-house.|The watch-house, with a bell on its roof.}] -> wa_enter
+ [{?seen("fi_enter")|Go back to the Magistrate's Hole.|A windbreak far out on the north side, where an old man is fishing.}] -> fi_enter
+ [{?seen("ba_enter")|Go back to the bathhouse.|A bathhouse, half sunk in snow, breathing steam.}] -> ba_enter
+ [{?seen("gu_enter")|Go back to the chestnut brazier.|A chestnut brazier on the corner of Needle Row.}] -> gu_enter
+ [Sit down on the bench at the edge of the lanterns, and listen to yourself.] -> bench_enter
+ [Talk to Ilse.] -> il_talk
+ {time >= t("23:00")} [It is nearly midnight. Go to the Chandelier for the Ball.] -> a2_midnight

== a2_hub_seen_hut
UNDERTOW: You keep looking back toward the dark edge of the town, where the hut is. As if something there might still be looking at you.
=> hub2

// ---------------------------------------------------------------- Ilse
== il_talk
@if !seen("il_talk_intro")
=> il_talk_intro
@endif
ILSE: "Examiner."
+ "What do we have so far?" -> il_summary
* {!knows_ilse_mother} "You know this place, don't you?" -> il_place
* {ilse >= 1} "The Fennimore inquest. You were the clerk." -> il_fennimore
* {seen("il_fennimore") && ilse >= 2} "You keep a second notebook." -> il_notebook
* {knows_rescue} "The Warden pulled me out of the Basin when I was twelve." -> il_rescue
* [TENDERNESS 10] "Why did you take this assignment?" -> il_why | il_why_f
* {(seen("hut_log") || knows_rope || seen("cp_body")) && !known("fifth")} "Have you ever wanted to write a line that isn't one of the four?" -> il_fifth
* "Why do you cut the fingertips off your gloves?" -> il_gloves
* "Tell me about the Superintendent." -> il_super
* {knows_ilse_past} "Your mother says your father sends cards." -> il_father
* {seen("me_ilse")} "Do you still write? Your mother said—" -> il_write
* {knows_rope || act3} "What Last Line would you write, Ilse?" -> il_verdict
* {act3} "Are you afraid?" -> il_afraid
* {seen("bv_tenderness")} "Did you ever meet Clara?" -> il_clara
* {ilse >= 1} "Why do you put up with me?" -> il_why_me
+ {!act3} [Leave it.] -> hub2
+ {act3} [Leave it.] -> hub3

== il_talk_intro
@set il_talk_intro_done
ILSE: She falls into step beside you, notebook against her chest. "I'm at the Examiner's disposal." A beat. "That's the formula. I'm also cold, and I'd like to be useful."
=> il_talk

== il_summary
ILSE: She reads from her notes in the voice she uses for evidence, which is flat and clear and carries a long way.
ILSE: "Ailo Sarre, Warden of the Glass, sixty-two. Found under the ice by the Chandelier's steps at ten past four this afternoon."
?{clue("watch")} ILSE: "His watch stopped at twelve past three. That is when he went into the water."
?{clue("rope")} ILSE: "A rope at his waist, in his own knot. The end cut clean. Someone held the other end."
?{clue("drift")} ILSE: "He drifted to the steps under the ice. In a basin that has no current."
?{clue("knuckles")} ILSE: "Split knuckles. The underside of the ice was rough."
?{clue("shouting")} ILSE: "All week he warned that the ice would go at the Ball. Nobody believed him, because he took money to say it was safe."
?{clue("moth_letters")} ILSE: "He wrote to the Mutual asking them to value the ice."
?{clue("soft_cut")} ILSE: "When the cutters sawed him out, the bottom of the ice cut like cake."
?{has_log} ILSE: "His own log says the ice is candled — rotten — along a seam from the Works' pipe to the Chandelier."
?{knows_candle} ILSE: "Candle ice: thick from above, hollow below."
?{knows_rope} ILSE: "His granddaughter held the rope. He cut it himself, so that she would not be pulled in after him."
?{knows_light} ILSE: "Two cutters saw a light moving under the ice at ten past three, toward the Chandelier."
?{proof_fist} ILSE: "In his fist, a piece of the rot. It fell apart in your hand."
?{has_logbook} ILSE: "The Works has been pumping water hot enough to scald into the Basin, and falsifying the logs."
?{knows_confession} ILSE: "A week ago he asked the Deaconess whether a man who goes into the water to save others puts out his lantern or lights it."
?{knows_rescue} ILSE: "And forty-four winters ago he pulled a boy called Aurel Marrow out of the Basin." She does not look up. "That one I didn't write down. I'm only saying it."
@if ilse >= 2
ILSE: She closes the book. "Off the record, Examiner." A pause, in which she decides something. "People who want to die don't tie a knot they can get out of."
@set ilse_offrecord
@else
ILSE: She closes the book. "That's the record. My opinion isn't part of it."
@endif
=> il_talk

== il_place
ILSE: "Everyone knows the Glass." She says it to the ice, not to you.
* [TENDERNESS 10] [Wait. Let the silence ask.] -> il_place_ok | il_place_f
* [Let it go.] -> il_talk

== il_place_ok
TENDERNESS: She wants to tell you. She has wanted to tell you since the sleigh. She is only waiting to be sure you won't make it into something.
ILSE: At last: "My mother mends coats on Needle Row. Every winter since before I was born." She tucks a loose strand of hair back under its pin, precisely. "We're not in regular correspondence."
ILSE: "If we pass the stall, I would be grateful if the Examiner walked quickly."
@set knows_ilse_mother
@add ilse 1
=> il_talk

== il_place_f
ILSE: "Everyone knows the Glass, Examiner." And that is the end of it; the notebook opens, and the door of her face closes behind it.
=> il_talk

== il_fennimore
ILSE: "I was." She keeps walking. "You don't remember it?"
* "I remember the beginning. And the snow." -> il_fen_2
* "I remember all of it. I want to know what you saw." -> il_fen_2

== il_fen_2
ILSE: "The boy was twelve. Tomas Fennimore. He went into the Harrow Canal after his little brother, and he got the little brother to the bank, and then he went under."
ILSE: "You were reading the Last Line. 'Misadventure, in the course of the rescue of—' and you stopped. And then you laughed."
ILSE: "For four minutes. I timed it. Habit."
STARCH: Four minutes. Nobody told you it was four minutes. Four minutes is a very long time to laugh in a room with a dead boy's mother in it.
ILSE: "Then you went out into the courtyard without your coat and sat down in the snow. The Superintendent found you there an hour later. You'd written something in the snow with your finger. He scuffed it out before anyone could read it."
ILSE: She is quiet for a few steps. "I read it first. Do you want to know what it said?"
* "Yes." -> il_fen_yes
* "No." -> il_fen_no

== il_fen_yes
ILSE: "One word. A name." She says it carefully, as if it might break. "*Feliks.*"
UNDERTOW: There. Somebody said it. Out loud, on the ice, at night. And you didn't wake up.
KEEL: Breathe. You are still standing. Look — your feet are still on the ice. It held.
ILSE: "I've wondered for four months who Feliks is." She does not ask. She simply leaves the wondering there, on the ice between you, where you can pick it up or not.
@set ilse_knows_name
@add thaw 1
=> il_fen_end

== il_fen_no
ILSE: "Then it stays where it is." She nods once, as if filing something in a drawer she does not intend to open again without your permission.
=> il_fen_end

== il_fen_end
ILSE: "The boy's uncle wanted the laughing entered — as evidence of disrespect to the family. I told him the stenograph had frozen."
* "Had it?" -> il_fen_frozen
* "You lied on the record. For me." -> il_fen_lied

== il_fen_frozen
ILSE: "It was October." A pause. "It's the only thing I've ever left out. In eleven years."
@add ilse 1
@set knows_omission
=> il_talk

== il_fen_lied
ILSE: "I didn't lie. I omitted. There's a difference." A few more steps. "There isn't much of one. But I have to believe there is, or I'd have to stop being a clerk."
ILSE: "It's the only thing I've ever left out. In eleven years."
@add ilse 1
@set knows_omission
=> il_talk

== il_notebook
ILSE: She doesn't pretend not to understand. Her hand goes to her coat, where the second book lives, small and black and soft at the corners from handling.
ILSE: "Things Not Entered." She says it like the title of a hymn. "What people say that isn't evidence. What a widow said about her husband's hands. What a man told his dog on the morning of his hanging. I can't put them in the record, and I can't let them go. So."
* "May I read it?" -> il_nb_read
* "Is there anything in it about me?" -> il_nb_me

== il_nb_read
ILSE: "No." Not unkindly. The way you'd say no to someone reaching for a hot pan. "Not tonight, anyway."
=> il_talk

== il_nb_me
ILSE: "Yes."
> She doesn't say anything else, and the not-saying goes on for a long time, all the way across a patch of black ice where the lanterns hang upside down beneath your feet.
TENDERNESS: Don't push. There is a whole person on the other side of that one word, and she has just let you see the door.
@set nb_me
@add thaw 1
=> il_talk

== il_rescue
ILSE: She stops walking. The pencil in her hand stops too, a little after the rest of her, as though it had to be told. "...That isn't in your file."
* "Nobody ever asked." -> il_resc_2
* "It isn't anything. It was a long time ago." -> il_resc_small

== il_resc_small
ILSE: "Forty-four years." She looks at you. "You count it in years. People who think it isn't anything don't count it."
=> il_resc_2

== il_resc_2
@if ilse_knows_name
ILSE: Very quietly: "Feliks."
> It is not a question, so you do not have to answer it. You find that you are answering it anyway.
@else
ILSE: "Was there someone else in the water?"
> It is exactly the right question, which is how you know she has been thinking about it for longer than tonight.
@endif
* "My brother. He was fourteen. It was my dare." -> il_resc_dare
* "My brother. He went in after me. The Warden reached me first." -> il_resc_brother
* "I don't want to talk about it, Clerk." -> il_resc_stop

== il_resc_dare
@add thaw 2
@set told_dare
> You tell her. You find it is quite short, when it is said out loud — shorter than it has been in your head for forty-four years.
> You wanted to see the lights of the Glass. Feliks said the ice by the Narrows was bad. You called him a coward. He came because you'd called him a coward, and because he was your brother, and the ice by the Narrows was bad.
> It opened under you first. He went in after you. You remember his hands on your back, pushing — or you remember your feet on his shoulders, climbing — you have never been sure which, and you have spent your life deciding it was the first. And then a young man with a boat-hook had you by the collar, and you were on the ice, and Feliks was a hand under it, moving away.
ILSE: She listens the way she transcribes, without interrupting, without adjusting her face. When you have finished she writes nothing at all.
=> il_resc_enter

== il_resc_brother
@add thaw 1
> You tell her the short version — the one you have been telling yourself for forty-four years. Two boys. Bad ice. A brother who pushed you up. A stranger with a boat-hook.
TENDERNESS: The short version has a hole in it the size of a dare. She can hear it. She doesn't reach into it.
=> il_resc_enter

== il_resc_enter
ILSE: At last, carefully: "Should I enter it?"
* "Enter what?" -> il_resc_what
* "Enter it." -> il_resc_yes
* "Not entered." -> il_resc_no

== il_resc_what
ILSE: "That you had a brother." She is holding the pencil above the page, not touching it. "It isn't anywhere. I've typed your file four times. There's no Feliks in it. Not in next of kin, not in history. As if he'd been—" she stops herself before the word *drowned*. "As if he'd never been."
* "Enter it." -> il_resc_yes
* "Not entered." -> il_resc_no

== il_resc_yes
@set brother_entered
@add thaw 2
@add ilse 1
> She writes. It takes a long time; she is writing slowly, in her best hand, the one she uses for the Last Line.
ILSE: She reads it back. "'The Examiner's brother, Feliks Marrow, fourteen years of age, drowned in the Basin forty-four winters ago in the course of the rescue of the Examiner. Body not recovered.'"
ILSE: She closes the book. "Now he's somewhere."
UNDERTOW: Something under the ice shifts, very slightly, like a sleeper turning toward a warmer part of the bed.
@morale 1
=> il_talk

== il_resc_no
ILSE: "Not entered." She closes the book. It doesn't sound like a refusal when she says it. It sounds like a promise to keep something safe.
=> il_talk

== il_resc_stop
ILSE: "Of course, Examiner." She begins walking again. After a few steps, without looking at you: "I'm sorry. About the water."
@add thaw -1
=> il_talk

== il_why
TENDERNESS: She answers too quickly: "I was assigned." Then, because you are still looking at her: "...I asked to be."
ILSE: "The last time you were at a scene, there was nobody in the room who—" She stops, and chooses a different sentence, as if choosing a different key from a ring. "Somebody should be there. For the record."
@add ilse 1
@add thaw 1
=> il_talk

== il_why_f
ILSE: "I was assigned, Examiner." She says it with such finality that the question seems, in retrospect, to have been a little impertinent.
=> il_talk

== il_fifth
ILSE: "Every day." She says it without hesitation, and then looks faintly surprised at herself. "Every clerk has. You type 'misadventure' under a man who went back into a burning house for a cat, and you think: *that isn't what happened. That isn't what it was.*"
ILSE: "But there are four lines, and the Mutual pays on four lines, and so we type one of the four." She adjusts her glove. "Why do you ask?"
UNDERTOW: Because a man cut his own rope tonight, and none of the four drawers has the right shape for that.
@thought fifth
=> il_talk

// ---------------------------------------------------------------- to midnight
== a2_midnight
@bg glass
> Midnight comes across the Basin from the city in a long procession of bells — cathedral first, then the Customs House, then a scatter of small parish bells arriving late and out of breath, like guests.
> On the Glass, every lantern seems to lean toward the Chandelier. The doors of the great pavilion are open. The band has stopped tuning and started playing.
=> dr_start
`);
