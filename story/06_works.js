CANDLE.script(String.raw`
== wo_enter
@bg works
@music wind
@title THE COLD WORKS — AUBADE COLD & LIGHT CO.
@if seen("wo_enter") > 1
@time 25
=> wo_return
@endif
@time 40
> It is a long walk. The lanterns of the Glass fall behind you and the ice becomes a grey field under a grey sky, and your boots are the only sound — your boots, and Ilse's, a half-step behind.
> Then the shore, and on the shore a brick box three storeys high with a chimney like a raised finger, every window lit a flat white-green. It hums. You feel the hum in your teeth before you hear it.
BAROMETER: And there — look at the ice. A dark stripe runs out from the foot of the building across the Basin, straight as a ruled line, toward the lights of the Glass. The snow on it has melted. The ice on it is grey and pocked and weeping.
SCRUTINY: At the building's foot, a pipe as thick as a bench runs out under the ice. Around its mouth there is no ice at all: a black lead of open water, steaming in the cold like a horse's flank.
@set knows_seam
@clue seam A dark stripe of melted, weeping ice runs straight from the Cold Works' outfall pipe toward the Glass. At the pipe's mouth there is open water, steaming.
@xp 10
* [Go down to the open water at the outfall.] -> wo_outfall
* [Go in. Find whoever's on duty.] -> wo_in

== wo_outfall
@insert v_pipe
> You walk down to the edge of the lead. The ice at its margin is soft as wet biscuit; Ilse stops a pace behind you and says nothing, which is how you know she wants to say *don't*.
> You take off a glove and put your hand in the water.
BAROMETER: Warm. Not cool-for-winter. *Warm*. Warm like a bath someone left running and forgot. Warm like the inside of a mouth.
HACKLES: Hand out. Hand *out*. The water was warm on the Narrows too, you remember, just before—
> You pull your hand back. It is red and steaming. In the cold air it begins to ache almost at once.
LEDGER: Item: the Basin in Thawmonth should be one degree above freezing, at most. Item: this is twenty degrees warmer than that, at a guess. Item: it runs, as the stripe runs, toward eleven hundred people.
@set felt_warm
@clue warm_water The water at the Works' outfall is warm to the touch — twenty degrees too warm for the Basin in winter.
@xp 10
=> wo_in

== wo_in
> Inside, the hum becomes a roar: a long hall of iron and brass, two great compressors thudding like the hearts of animals too large to see all at once, pipes sweating frost, a smell of ammonia that goes up your nose like a thumb.
@sfx pencil
> In a glass booth at the end of the hall, a thin man in shirtsleeves and a cardigan is writing in a ledger by the light of a green lamp. As you come in he is saying, to the nearest compressor, in a gentle voice: "Easy, Hilda. Easy, old girl. Nearly there."
> He sees you. The pen stops.
QUELL: "I'm — we're not — visitors aren't permitted after ten, the director's very clear—" He sees the silver pin on your coat, and the rest of the sentence folds itself up and puts itself away. "Oh," he says. "Oh. You're from the Inquest."
=> wo_talk

== wo_return
> The hum. The ammonia. Hilda thudding in the dark. Quell is in his booth; he looks up when you come in as if he had been expecting you all along.
QUELL: "Examiner."
=> wo_talk

== wo_talk
+ {!seen("wo_q_who")} "Who are you?" -> wo_q_who
+ {!seen("wo_q_sarre")} "The Warden of the Glass came to see you." -> wo_q_sarre
+ {!seen("wo_q_log")} "Show me the discharge log." -> wo_q_log
+ {seen("wo_q_log") && !has_logbook} "The real temperatures, Mr. Quell." -> wo_q_real
+ {!seen("wo_q_drawing")} [There are children's drawings pinned inside the booth. Look at them.] -> wo_q_drawing
+ {has_logbook && !quell_diverted && !seen("wo_q_divert_no")} "Can you turn the heat away from the Basin?" -> wo_q_divert
+ {(has_logbook || felt_warm || has_log) && !f_quell} "If the Glass has to come off the ice tonight — where do eleven hundred people go?" -> wo_q_shelter
+ {!seen("wo_q_hilda")} "Why do you talk to the compressor?" -> wo_q_hilda
+ [Leave the Works.] -> wo_leave

== wo_q_who
QUELL: "Quell. Tobias Quell. Night engineer, first class." He says *first class* as though it were a diagnosis. "I keep the compressors running. Hilda and Brunhild. Hilda's the old one. She knocks when she's cold, like an old man's knee."
QUELL: "We make ice. Clean ice, all year round — for the breweries, the fishmongers, the hospital. No more men freezing their hands off on the Basin for it." He looks almost proud, then remembers who is probably listening from the Glass. "It's progress. I believe in it. Mostly."
=> wo_talk

== wo_q_sarre
QUELL: He puts the pen down very carefully, as if it might go off. "Five days ago. At night. He came in without knocking. He wanted to see the discharge temperatures."
QUELL: "I told him they were within the permit." A pause. "They are within the permit. On paper."
OBJECTION: *On paper.* He heard himself say it. He's waiting to see if you did.
@set quell_sarre
=> wo_talk

== wo_q_log
@sfx paper
> He takes down a clean green ledger from a shelf — too clean, the spine uncracked — and opens it to this week. Columns: date, hour, compressor load, discharge temperature. The last column reads 14 degrees. Every hour. Every day. Fourteen, fourteen, fourteen, down the page like a fence.
QUELL: "Fourteen degrees. The permit is sixteen. We're well inside."
* [SCRUTINY 10] [Look at the ink.] -> wo_ink | wo_ink_f
* [LEDGER 11] [Look at the compressor load column.] -> wo_load | wo_load_f
* "I see." -> wo_talk

== wo_ink
SCRUTINY: Same ink. Same nib. Same pressure on every stroke, the same slight hook on every *4*. A week of hourly readings, taken in the middle of the night by a tired man — and not one blot, not one change of pen. This page was written in a single sitting.
> You put a finger on the column. You don't have to say anything. Quell looks at your finger for a long time.
@add quell 1
@set caught_ink
@xp 10
=> wo_talk

== wo_ink_f
SCRUTINY: Neat. Very neat. A careful man's hand. That is all you can see, and it tells you nothing except that he is careful.
=> wo_talk

== wo_load
LEDGER: Compressor load: doubled on the third of Deepwinter. The new brewery contract. Double the ice means double the heat pumped out of the brine. Same condenser. Same pipe. Same flow of cooling water.
LEDGER: Item: the discharge temperature cannot stay at fourteen if the heat going into it doubles. It is not a matter of opinion. It is not even a matter of engineering. It is *arithmetic*, and arithmetic does not take bribes.
> You say so. Quell closes his eyes.
@add quell 1
@set caught_load
@xp 10
=> wo_talk

== wo_load_f
LEDGER: Numbers. A great many of them. You can feel that something in them is wrong the way you can feel a draught in a room — but you can't find the window.
=> wo_talk

== wo_q_real
@if quell >= 2
=> wo_real_yes
@endif
QUELL: "Those *are* the—" He stops. He can't finish it.
* {seen("wo_q_drawing")} [TENDERNESS 10] "Lotte's going to the Ball tonight, isn't she." -> wo_real_yes | wo_real_no
* [OBJECTION {12 - (caught_ink ? 2 : 0) - (caught_load ? 2 : 0)}] "You kept a second log. A man like you would. For his own conscience." -> wo_real_yes | wo_real_no
* [GRAVITAS 12] "The Crown will take your logs, Mr. Quell, and you with them." -> wo_real_grav | wo_real_no
* "Think about it." -> wo_talk

== wo_real_no
QUELL: "I — I can't, Examiner. I'm sorry. I have a daughter." He puts the green ledger back on its shelf and stands in front of it, the way you would stand in front of a child. "Come back later. Please. Come back when I'm braver."
=> wo_talk

== wo_real_grav
QUELL: He goes the colour of the pipe frost. "Yes. Yes, all right." His hands shake as he unlocks the drawer. "You didn't have to — I was going to — all right."
@add quell -1
=> wo_real_give

== wo_real_yes
QUELL: He sits very still. Behind him, Hilda knocks twice, like an old man's knee.
QUELL: "The director told me to write fourteen." It comes out quietly. "The contract doubled in Deepwinter. I asked for a second condenser. They said it would be in the spring budget. They said, *write fourteen, Tobias.* So I wrote fourteen."
QUELL: "And then I went home and couldn't sleep, so I started writing the real numbers too. In here." He unlocks a drawer and takes out a cheap school exercise book with a sailing ship on the cover. "For my — for my own conscience. It's stupid. A conscience doesn't need a *book*."
@add quell 1
=> wo_real_give

== wo_real_give
> The exercise book. Columns in pencil, cramped, honest, full of crossings-out. Discharge temperature: 27. 29. 31. 30. 33. At three o'clock this morning: 34.
LEDGER: Thirty-four degrees. Into a basin that should be at one. Twenty-odd degrees of heat, day and night, poured along a single seam under the Glass — under the Warden's hut, under the Chandelier. For six weeks.
BAROMETER: Not ice rotting. Ice being *cooked*.
@set has_logbook
@done seam
@clue logbook Quell's private log: the Works has been discharging water at 27–34 degrees into the Basin since Deepwinter. The official log says 14. The director ordered it falsified.
@xp 30
QUELL: "I'll lose my place." He isn't asking you not to take it. He is simply saying it aloud, to hear how it sounds. "And when I lose my place, my valuation drops. And Lotte's drops with it. Children are valued on their father's line, did you know that? Until they're twenty-one."
* "I'll enter you as a witness, not a party. It matters." -> wo_give_witness
* "Your daughter's valuation is not your conscience's problem." -> wo_give_cold
* "Did you know that's monstrous?" -> wo_give_monster

== wo_give_witness
ARCHIVE: Section thirty of the Inquest Act. A witness who gives material evidence against his employer is protected from dismissal until the Last Line is entered. It is not much. It is something. You've never once seen it used.
QUELL: "A witness." He tries the word. "...Thank you."
@set quell_witness
@add quell 1
=> wo_talk

== wo_give_cold
QUELL: He flinches as if you'd struck Hilda. "No. No, I suppose it isn't."
@add quell -1
=> wo_talk

== wo_give_monster
QUELL: "Yes." He looks almost relieved that someone has said it. "Yes, I did know. Everybody knows. We just don't say it, because then we'd have to do something, and nobody knows what."
@align unpriced 1
@add quell 1
=> wo_talk

== wo_q_drawing
> Pinned inside the booth, curling at the corners in the damp: children's drawings in wax crayon. A house with a smoking chimney. A horse, or a dog. And one, newer than the rest: a big yellow tent with a star inside it, and a crowd of stick figures with their arms up, and underneath, in careful capitals, *THE THAW BALL — LOTTE AND AUNT MINA*.
QUELL: He sees where you are looking. "My daughter. Lotte. She's nine." His face does something complicated. "My sister's taking her to the Ball tonight. It's her first. She's been practising the waltz on the kitchen table for a week."
HACKLES: Tonight. On the seam. Under the chandelier. Nine years old.
TENDERNESS: He knows. He has known since the Warden walked in five days ago. He is sitting here writing *fourteen* and thinking about his daughter's feet on that floor.
@set knows_lotte
=> wo_talk

== wo_q_divert
QUELL: "Divert—" He looks at the compressors. "There's the old cooling pond, behind the building. From before the pipe. I could open the bypass and shut the outfall. It'd take an hour. The pond would boil over by morning. And the director would have my job by noon."
QUELL: "It won't fix the ice. Six weeks of heat doesn't go away in a night. It might — it might slow it. Buy them a little time."
* "Do it." -> wo_divert_yes
* "Not yet. I may need you to keep your place." -> wo_divert_no

== wo_divert_yes
QUELL: He stands. He is not a brave-looking man; he looks, if anything, like a man who has been waiting a long time for someone to tell him to be brave. "Hilda. I'm sorry, old girl. We're going to run hot."
> He goes out into the roaring hall. After a while you hear a great iron wheel turning, and somewhere far off a new sound, a long groan of water finding a different way to go.
@set quell_diverted
@add quell 1
@clue divert Quell has shut the outfall and diverted the heat to the old cooling pond. It will not save the ice, but it may buy time.
@xp 20
=> wo_talk

== wo_divert_no
QUELL: "Yes. Yes, all right." He looks at the wheel as if it had spoken to him. "It's there. If you want it."
=> wo_talk

== wo_q_shelter
QUELL: "Where do they—?" He looks out of the booth at the long roaring hall, at the warmth coming off the compressors in waves. And you watch him see it.
QUELL: "Here. The engine hall. It's the warmest room in Aubade — we throw heat away all night, that's the whole *problem*. There's room for a thousand if nobody minds the noise." He is already reaching for a key ring. "The director will—" He stops. "The director is in the capital. I'm the night engineer, first class. I can open a door."
@set f_quell
@add quell 1
@clue shelter Quell will open the Cold Works' engine hall — the warmest room in Aubade — to anyone who comes off the ice tonight.
@xp 20
=> wo_talk

== wo_leave
@if knows_lotte && !f_quell
QUELL: As you turn to go: "Examiner." He is holding the drawing. "If you — if it goes tonight. Lotte. She'll be wearing a yellow ribbon."
@endif
-> hub2
`);
