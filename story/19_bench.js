CANDLE.script(String.raw`
// The Bench: a place to sit and talk to yourself. Each voice has one long
// conversation, sometimes with a second part once the night has changed you.

== bench_enter
@bg bench
@title A BENCH ON THE ICE
@sfx footsteps
@time 5
@if seen("bench_enter") == 1
> Someone has set a bench out on the ice at the edge of the lanterns: an old church pew, varnish long gone, its feet frozen into the Glass. From it you can see the whole town — the huts, the smoke, the great glowing shell of the Chandelier — and behind it all, the dark.
ILSE: "I'll be close by." She says it without being asked. "You look like a man who needs to sit down and argue with himself." A pause. "The Office recommends it, in moderation."
@else
> The pew. The varnish. The view. Ilse drifts a little way off, notebook closed, pretending to study the stars.
@endif
UNDERTOW: We're all here. We're always all here. Pick one.
=> bench_hub

== bench_hub
+ {!seen("bv_ledger")} [LEDGER — the accounts.] -> bv_ledger
+ {!seen("bv_archive")} [ARCHIVE — the lamplighter's son.] -> bv_archive
+ {!seen("bv_objection")} [OBJECTION — a hearing.] -> bv_objection
+ {!seen("bv_conjecture")} [CONJECTURE — another life.] -> bv_conjecture
+ {!seen("bv_undertow")} [UNDERTOW — what are you?] -> bv_undertow
+ {seen("bv_undertow") && knows_rescue && !seen("bv_undertow2")} [UNDERTOW — you sound like a boy.] -> bv_undertow2
+ {!seen("bv_tenderness")} [TENDERNESS — Clara.] -> bv_tenderness
+ {!seen("bv_keel")} [KEEL — what keeps you up.] -> bv_keel
+ {!seen("bv_gravitas")} [GRAVITAS — the first Line.] -> bv_gravitas
+ {!seen("bv_appetite")} [APPETITE — when did you last taste anything?] -> bv_appetite
+ {!seen("bv_hackles")} [HACKLES — the inventory of fear.] -> bv_hackles
+ {!seen("bv_barometer")} [BAROMETER — the city.] -> bv_barometer
+ {!seen("bv_sinew")} [SINEW — the rowing club.] -> bv_sinew
+ {!seen("bv_scrutiny")} [SCRUTINY — look at yourself.] -> bv_scrutiny
+ {!seen("bv_starch")} [STARCH — the day your face moved.] -> bv_starch
+ {!seen("bv_decorum")} [DECORUM — the Lamplighters' Ball.] -> bv_decorum
+ {!seen("bv_sleight")} [SLEIGHT — the apron strings.] -> bv_sleight
+ {!act3} [Get up. There's work.] -> hub2
+ {act3} [Get up. There's work.] -> hub3

// ---------------------------------------------------------------- LEDGER
== bv_ledger
@time 10
LEDGER: Shall we do the accounts? We haven't done the accounts in some time. You used to do them every Sunday, at the kitchen table, with the good pen.
* "Go on." -> bv_ledger_2
* "I know the accounts." -> bv_ledger_2

== bv_ledger_2
LEDGER: Item: fifty-six years of age. Item: twenty-nine years in service. Item: four thousand one hundred and six Last Lines, every one of them balanced — the dead on one side, the payer on the other, and a line ruled neatly under both.
LEDGER: Item: one marriage, dissolved. Item: no children. Item: three rooms in the upper town, a geranium, one boiled egg every morning for four minutes precisely, the six-forty tram.
LEDGER: Item: one brother.
LEDGER: ...
LEDGER: That one has never been entered. It sits at the bottom of the page in pencil, and every Sunday for forty-four years we have looked at it and not known which column it goes in.
* "It goes in the debit column. I owe him." -> bv_ledger_debit
* "Maybe it isn't a sum." -> bv_ledger_notsum
* "Close the book, Ledger." -> bv_ledger_close

== bv_ledger_debit
LEDGER: Then the account can never balance, because the creditor is dead and cannot be paid, and so you make payments to *everyone else* instead — four thousand one hundred and six of them — and none of them are credited, because they were never owed. It's the worst bookkeeping I've ever seen. And I've seen the Office's.
@add thaw 1
=> bv_ledger_end

== bv_ledger_notsum
LEDGER: Not a sum?
LEDGER: ...Everything is a sum.
LEDGER: (Isn't it?)
@add thaw 1
=> bv_ledger_end

== bv_ledger_close
LEDGER: Closed. Unbalanced, but closed. The pencil entry stays at the bottom of the page. It always does.
@add thaw -1
=> bv_ledger_end

== bv_ledger_end
?{brother_entered} LEDGER: Although — as of tonight — it *has* been entered. In a clerk's best hand. I don't know what to do with that. I'm going to need a new column.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- ARCHIVE
== bv_archive
@time 10
ARCHIVE: Anselm Marrow. Lamplighter, harbor front, thirty-one lamps from the Customs House to the Narrows. Your father. He carried a ladder and a long brass pole with a hook at one end and a wick at the other, and he lit the Narrows every dusk for eleven years.
ARCHIVE: You were five when he fell. An ice storm. The ladder went one way and he went the other. The *Evening Lamp* gave him four lines — you have them by heart, though you have never once looked them up.
* "Recite them." -> bv_archive_recite
* "I don't remember him." -> bv_archive_forget

== bv_archive_recite
ARCHIVE: *"Lamplighter A. Marrow, of the Lamp Stairs, killed by a fall on the Narrows in the storm of Tuesday. He leaves a widow and two sons. The Guild will attend. The lamps of the Narrows were lit that evening by his elder boy."*
ARCHIVE: By his elder boy. Feliks was seven. He took the pole and the ladder and went down the Narrows in the storm and lit all thirty-one, because somebody had to, and came home soaked to the skin, and your mother slapped him and then held him for an hour.
TENDERNESS: He lit the Narrows. The same Narrows. Of course he did.
@add thaw 1
=> bv_archive_end

== bv_archive_forget
ARCHIVE: You remember the pole. The brass hook, polished where his hand went. You remember that the house smelled of lamp oil on his side of the bed until your mother finally washed the pillow, a year later, and cried at the washtub.
ARCHIVE: That's not nothing. For a man of five that's an entire archive.
=> bv_archive_end

== bv_archive_end
ARCHIVE: You and Feliks used to watch the Glass from the window on the Lamp Stairs. The lights on the ice. You wanted to go and see them close. You always wanted to go and see them close.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- OBJECTION
== bv_objection
@time 10
OBJECTION: The court will come to order. The court is — hm — a pew on some ice. It will do.
OBJECTION: The witness will state his name.
* "Aurel Anselm Marrow." -> bv_obj_2
* "I'm not playing this." -> bv_obj_refuse

== bv_obj_refuse
OBJECTION: The witness declines to answer. Noted. The witness has been declining to answer this particular question for forty-four years; the court is not surprised. The court is merely *tired*.
=> bv_obj_2

== bv_obj_2
OBJECTION: Where were you at dusk, on the fourteenth of Thawmonth, forty-four winters ago?
* "On the Narrows. On the ice." -> bv_obj_3
* "At home." -> bv_obj_lie

== bv_obj_lie
OBJECTION: *Objection.* The witness is lying, and — worse — lying *badly*, which from a man of your training is almost an insult to the court.
=> bv_obj_3

== bv_obj_3
OBJECTION: And who proposed the expedition onto the Narrows? Please be precise. The court has all night. Well — until midnight.
* "I did. I dared him." -> bv_obj_dare
* "We both wanted to go." -> bv_obj_both

== bv_obj_both
OBJECTION: *Both.* How convenient. How very — *Mutual*. The court notes the witness has spent forty-four years in an institution designed to spread liability across as many parties as possible, and has apparently taken the lesson home.
OBJECTION: I'll allow it. For now.
=> bv_obj_4

== bv_obj_dare
OBJECTION: Thank you. That was not so hard.
OBJECTION: (It was very hard. I'm aware. I'm a barrister, not a monster.)
@add thaw 1
=> bv_obj_4

== bv_obj_4
OBJECTION: Final question. In your professional opinion, as an Examiner of twenty-nine years' standing: what Last Line would you enter for the death of Feliks Marrow, fourteen?
* "Misadventure." -> bv_obj_mis
* "Unlawful killing. By me." -> bv_obj_unl
* "I don't know." -> bv_obj_open

== bv_obj_mis
OBJECTION: Misadventure. Two boys, bad ice, a posted warning ignored. Every Examiner on the Bench would write the same, and so, you notice, did the Examiner who actually wrote it. You've read that Line. You've never once argued with it — except here, at night, on your own.
=> bv_obj_end

== bv_obj_unl
OBJECTION: *Objection.* Leading, speculative, and grossly unsupported by the evidence. A twelve-year-old's dare is not a weapon. If you entered that Line in any court in Aubade, *I* would have it voided, and I would enjoy it.
@add thaw 1
=> bv_obj_end

== bv_obj_open
OBJECTION: Open. The evidence does not permit a finding. Which is, I'll note for the record, the only honest answer you've given all night. The court is adjourned. The court needs a drink.
@add thaw 1
=> bv_obj_end

== bv_obj_end
@xp 5
=> bench_hub

// ---------------------------------------------------------------- CONJECTURE
== bv_conjecture
@time 10
CONJECTURE: Close your eyes. Just for a moment. Picture it.
CONJECTURE: The other version. The one where the ice by the Narrows held — or where you never dared, or where the Rime boy with the boat-hook was one arm's length to the left.
* "Show me." -> bv_conj_2
* "No. That isn't useful." -> bv_conj_no

== bv_conj_no
CONJECTURE: *Useful.* You sound like Ledger. Fine. I'll just leave it here, then. Folded. In case you change your mind.
=> bench_hub

== bv_conj_2
CONJECTURE: Feliks Marrow, fifty-eight. Master of the Customs ferry, the *Aubade Belle*, twenty-two years without a collision. A big man — bigger than you, he always was — with a laugh you can hear from the other end of the jetty. Married a cooper's daughter. Three children. Seven grandchildren, one of them named Aurel, which he'll tell you was his wife's idea.
CONJECTURE: He telephones on Sundays. You find it tiresome. He tells the same jokes. He asks whether you're eating. He asks about Clara, even nine years later, because he never learned when to stop asking about things.
CONJECTURE: And you — in this version you're a lawyer, perhaps, or a schoolmaster, or a very dull clerk in the Customs House, and you have never once in your life looked at a drowned man's face, and you sleep eight hours a night, and you don't hear anything under the floor.
* "I'd have liked him." -> bv_conj_like
* "I'd have been worse. I'd have been nobody." -> bv_conj_worse
* "Stop." -> bv_conj_stop

== bv_conj_like
CONJECTURE: You'd have *loved* him. And found him exhausting. That's what brothers are. That's the whole design.
@add thaw 1
@morale -1
=> bv_conj_end

== bv_conj_worse
CONJECTURE: Maybe. Or maybe you'd have been a man who could laugh at a funeral without it meaning anything. Who could dance. Who wasn't carrying a boy under the ice everywhere he went, like a coin sewn into a coat.
=> bv_conj_end

== bv_conj_stop
CONJECTURE: Stopping. Folding it up. Putting it away.
CONJECTURE: (You'll take it out again tonight, at three, when you can't sleep. You always do. I'll be here.)
=> bv_conj_end

== bv_conj_end
@xp 5
=> bench_hub

// ---------------------------------------------------------------- UNDERTOW
== bv_undertow
@time 10
UNDERTOW: You want to know what I am. You've never asked. Forty-four years, and you've never once turned round and looked at me.
* "What are you?" -> bv_und_2
* "You're a symptom. Dr. Hask has a word for you." -> bv_und_hask

== bv_und_hask
UNDERTOW: *Auditory ideation secondary to grief.* Yes. He wrote it on a card for you. You keep the card in your wallet behind the Office pass. You've read it more often than you've read your own name.
UNDERTOW: It's a very good card. It's even true. It just doesn't say anything.
=> bv_und_2

== bv_und_2
UNDERTOW: I came up with you. Out of the Basin, forty-four winters ago. You were in the water for a minute and forty seconds — a young man with a boat-hook counted it later, for the *Evening Lamp* — and you were very cold, and very still, and something in the water got into your ears and stayed.
UNDERTOW: That's me. I'm the part of the water that stayed. I hear things that aren't sounds. Objects that want to say something. Dead men who haven't finished a sentence. Ice.
UNDERTOW: I'm the reason you're good at this, you know. At the job. You walk into a room where somebody died and you stop exactly where it happened. The others think it's genius. It's just me, tugging your sleeve.
* "Then thank you." -> bv_und_thanks
* "Then go away." -> bv_und_away

== bv_und_thanks
UNDERTOW: ...Oh.
UNDERTOW: Nobody's ever — well. You're welcome.
@add thaw 1
@morale 1
@xp 5
=> bench_hub

== bv_und_away
UNDERTOW: I can't. You know I can't. Where would I go? Back into the water?
UNDERTOW: (Maybe. Maybe one day. Not tonight. Tonight you need me.)
@xp 5
=> bench_hub

== bv_undertow2
@time 10
UNDERTOW: You've noticed.
* "You sound like a boy. You always have." -> bv_und2_2
* "You sound like him." -> bv_und2_2

== bv_und2_2
UNDERTOW: I sound like what you kept of him. His voice at fourteen, cracking on the high notes. The way he said *Aurel* like it had three syllables. You kept it very carefully. You kept it where no one could find it — not your mother, not Clara, not Dr. Hask with his card.
UNDERTOW: I'm not him. I want to be clear about that, because tonight it's going to matter. I'm not Feliks. Feliks is somewhere under the Narrows, or nowhere, or on the Far Shore with a lamp — the Deaconess would know. I'm only the shape he left in you.
UNDERTOW: But the shape is the right size. Isn't it? After all this time, it's still exactly the right size.
@add thaw 2
@xp 10
=> bench_hub

// ---------------------------------------------------------------- TENDERNESS
== bv_tenderness
@time 10
TENDERNESS: Clara.
TENDERNESS: You don't think about her, you tell yourself. You think about her every time you iron a handkerchief, because she was the one who told you it was absurd, and you did it anyway, and she laughed, and that was the first time you understood that someone could laugh at you and love you in the same breath.
* "She left." -> bv_ten_left
* "I don't want to think about her." -> bv_ten_no

== bv_ten_no
TENDERNESS: I know. That's why I brought her up. Somebody has to.
=> bv_ten_left

== bv_ten_left
TENDERNESS: She left nine years ago, on a Tuesday, with two suitcases and the good teapot. She didn't slam the door. You'd have preferred it if she had.
TENDERNESS: Do you remember what she said? At the door. You've repeated it to yourself so often it's worn smooth, like a step.
* "'You were never cruel, Aurel. You were never *there*.'" -> bv_ten_there
* "No." -> bv_ten_lie

== bv_ten_lie
TENDERNESS: Yes you do. *You were never cruel, Aurel. You were never there.*
=> bv_ten_there

== bv_ten_there
TENDERNESS: She was right. You were in the room — you were always in the room, you never missed a dinner, you remembered her birthday with a precision that frightened her — and you were not *there*. You were on the Narrows. You were under the ice, listening.
TENDERNESS: She wanted children. You wanted to be sure. You were never sure. You were never sure you had the right to make anything that could fall through.
* "I should write to her." -> bv_ten_write
* "It's too late." -> bv_ten_late

== bv_ten_write
TENDERNESS: Maybe. Not to ask for anything. Just to say: you were right. It's a thing people almost never hear, and it costs nothing, and it would take you — what? — three lines. You're very good at short, true sentences.
@set clara_letter
@add thaw 1
@xp 5
=> bench_hub

== bv_ten_late
TENDERNESS: For the marriage, yes. For the rest of it — for being *there*, somewhere, for someone — it isn't too late until the ice goes. And the ice hasn't gone yet.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- KEEL
== bv_keel
@time 10
KEEL: You never talk to me. That's all right. I'm not the talking kind. I'm the part under the waterline, where the weight is. Nobody looks at a keel. They look at the sails.
* "What have you been doing all these years?" -> bv_keel_2
* "I'm tired, Keel." -> bv_keel_tired

== bv_keel_tired
KEEL: I know. I'm tired too. We've been upright a long time in a lot of weather.
=> bv_keel_2

== bv_keel_2
KEEL: Keeping you up. That's the whole job. The six-forty tram. The boiled egg — four minutes. The handkerchiefs. The Sunday accounts. The walk to the Office by the long way round the bay.
KEEL: They laugh at the routine, in the Office. They call it rigid. It isn't rigid. It's *ballast*. After the Narrows you had to put something heavy in the bottom of the boat or you'd have gone over in the first wind. So I put in eggs, and trams, and four thousand one hundred and six Last Lines, and you stayed up.
KEEL: I'm not glamorous. But I'd like it noted — just once — that I did it. That you are still here.
* "Noted, Keel. Thank you." -> bv_keel_thanks
* "But I'm not *moving*. Ballast doesn't go anywhere." -> bv_keel_move

== bv_keel_thanks
KEEL: ...
KEEL: Thank you.
@morale 1
@xp 5
=> bench_hub

== bv_keel_move
KEEL: No. It doesn't. That's the trouble with ballast. It keeps you from capsizing, and it keeps you from sailing.
KEEL: Maybe it's time to shift some of it. Not all. We're still on the ice. But some.
@add thaw 1
@xp 5
=> bench_hub

// ---------------------------------------------------------------- GRAVITAS
== bv_gravitas
@time 10
GRAVITAS: Do you remember your first Line?
* "Josef Brandt. Twenty-seven. Dockhand." -> bv_grav_2
* "No." -> bv_grav_no

== bv_grav_no
GRAVITAS: Of course you do. You remember them *all*. That's the terrible thing about you, and the magnificent thing. Josef Brandt.
=> bv_grav_2

== bv_grav_2
GRAVITAS: Josef Brandt, twenty-seven, dockhand, crushed between a lighter and the Customs quay in a swell. His mother came to the inquest in a borrowed black hat. She sat in the front row and did not take her eyes off you once.
GRAVITAS: You wrote his Line forty times before you let them type it. Forty drafts. The Superintendent — the old one, before Grieve — thought you were mad. You weren't. You were learning the weight of it: that this sentence, this one, would be the last thing the city ever said about Josef Brandt, and that his mother would carry it home in her borrowed hat.
GRAVITAS: That is the dignity of the Office. Not the pin. Not the coat. The forty drafts.
* "I haven't written forty drafts in years." -> bv_grav_years
* "It's just a job, Gravitas." -> bv_grav_job

== bv_grav_years
GRAVITAS: No. You write them in one now. Clean. Correct. Four thousand of them, and every one correct — and somewhere around the two-thousandth, you stopped feeling the weight, and started only carrying it.
GRAVITAS: Tonight, perhaps, forty drafts.
@add thaw 1
@xp 5
=> bench_hub

== bv_grav_job
GRAVITAS: *Just a job.* I'll pretend you didn't say that. The dead are owed a correct form, and you are the form. Stand up straight.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- APPETITE
== bv_appetite
@time 10
APPETITE: When did you last taste anything? Not eat. You eat. One boiled egg, four minutes, and a dry roll at the Office, and whatever the Office canteen calls soup. I mean *taste*.
* "I don't remember." -> bv_app_2
* {ate_cake} "Tonight. The thaw-cake." -> bv_app_cake

== bv_app_cake
APPETITE: *Yes.* And what did it taste of?
* "Cardamom. Burnt sugar." -> bv_app_2
* "My mother's kitchen." -> bv_app_mother

== bv_app_mother
APPETITE: There. There it is. You said it out loud.
=> bv_app_2

== bv_app_2
APPETITE: Your mother made thaw-cakes for the Ball every year. She worked for Petrosyan's bakery on the Lamp Stairs, and every Thawmonth the whole flat smelled of burnt honey for a week, and you and Feliks stole the broken ones off the cooling racks and ate them on the stairs, and she pretended not to know.
APPETITE: After the Narrows, she never made them again. Not once. And you never ate one again — until tonight, if you did.
APPETITE: Forty-four years of not tasting anything, in case it tasted of *before*.
* "It's easier not to want things." -> bv_app_easier
* "What do you want, Appetite?" -> bv_app_want

== bv_app_easier
APPETITE: Easier. Sure. And colder. You're cold, Aurel. You've been cold for so long you think it's your temperature.
@xp 5
=> bench_hub

== bv_app_want
APPETITE: *Everything.* Honey. Brandy. A fire. Someone's hand. The window open in spring. A second egg. To dance badly and not care. To eat a whole thaw-cake in two bites, standing up, like the Warden's girl.
APPETITE: I'm not asking for all of it. Just — one. Tonight. Pick one thing and want it.
@add thaw 1
@morale 1
@xp 5
=> bench_hub

// ---------------------------------------------------------------- HACKLES
== bv_hackles
@time 10
HACKLES: Inventory. Shall we? It's calming. For me.
HACKLES: Open water. Ice in Thawmonth. Ice in *any* month. The sound of ice. Doors that open inward. Men with a hand in their coat. The harbor at dusk. Boats. Sleighs. Bridges. The Narrows in particular, by name. Baths deeper than a hand. Swimming, the concept of. Knocking.
* "That's a long list." -> bv_hack_2
* "Most of those are reasonable." -> bv_hack_reason

== bv_hack_reason
HACKLES: *All* of them are reasonable. That's the problem. Every single one has a perfectly good reason. It's just that together they make a man who walks the long way round the bay for forty-four years.
=> bv_hack_2

== bv_hack_2
HACKLES: I was right, you know. Three times. The man in the Harrowgate courtroom with his hand in his coat. The widower at the bell tower. The cellar at Sturmhaven, the second before the joist went. I've kept you alive three times, and all anyone remembers is that you flinch at doors.
HACKLES: And tonight you are sitting on a pew, on a *floor*, over the Basin, in Thawmonth, and the floor is laughing. I have never been so frightened in my life.
* "I know. I'm frightened too." -> bv_hack_too
* "Be quiet. I need to think." -> bv_hack_quiet

== bv_hack_too
HACKLES: ...You are?
HACKLES: That helps. That actually helps. I thought it was just me.
@add thaw 1
@morale 1
@xp 5
=> bench_hub

== bv_hack_quiet
HACKLES: Quiet. Yes. Very quiet. Listening. Always listening.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- BAROMETER
== bv_barometer
@time 10
BAROMETER: Aubade is a body. Did you know? Most people don't. They think it's a place.
BAROMETER: The hill is the spine. The Lamp Stairs are the ribs. The Customs House is the heart, pumping ships in and out on the tide. And the Basin — the Basin is the lungs. Every winter the city holds its breath, and the lungs freeze, and people build a town on them. And every spring it breathes out.
* "And tonight?" -> bv_baro_tonight
* "That's not how cities work." -> bv_baro_no

== bv_baro_no
BAROMETER: It's exactly how cities work. Ask anyone who has lived in one long enough to feel it in their knees.
=> bv_baro_tonight

== bv_baro_tonight
BAROMETER: Tonight it's breathing out early. Something has been warming its chest from inside — a fever, a pipe, a lie — and the Mild is coming up the coast like a hand on a forehead. The city doesn't know. The city is putting on its best coat for a dance.
BAROMETER: You felt it in the sleigh, before anyone told you. You always feel it first. Your knees are the best almanac in Aubade.
@if !knows_seam
BAROMETER: There's a line on the ice, somewhere east of here, where the snow is softer. Go and find it. Follow it back to where it starts.
@set baro_hint
@endif
@xp 5
=> bench_hub

// ---------------------------------------------------------------- SINEW
== bv_sinew
@time 10
SINEW: Remember the Rowing Club? You don't let yourself. But I remember. The body remembers.
SINEW: Nineteen years old. The Aubade Rowing Club, the old boathouse under the Customs quay. Single sculls. Every morning at five, out on the Basin — the open Basin, in summer — twelve miles before the Academy opened its doors. You had shoulders like a door-frame. You had hands like a stevedore's.
* "I was good." -> bv_sin_good
* "I was running from something." -> bv_sin_run

== bv_sin_good
SINEW: You were *very* good. Never capsized. Not once in four years. The coach said you rowed like a man who'd made a private arrangement with the water.
=> bv_sin_run

== bv_sin_run
SINEW: You rowed like a man trying to outrun something that was underneath the boat. Twelve miles a morning, as hard as you could, and you never looked down. Not once.
SINEW: Then the Office, and the coat, and the desk, and you stopped. You folded the shoulders up and put them away like a letter you don't intend to send.
SINEW: They're still there. I'm still here. If you need me tonight — to lift something, to hold something, to pull — I'm right here.
@add thaw 1
@xp 5
=> bench_hub

// ---------------------------------------------------------------- SCRUTINY
== bv_scrutiny
@time 10
> The lantern on the pole beside the bench throws your reflection faintly onto the black ice at your feet. You look down at it.
SCRUTINY: Look. Properly. As if you were a scene.
SCRUTINY: Male. Fifty-six. Tall — one metre ninety — and stooped two centimetres from it, from desks. Grey beard trimmed to Office regulation, trimmed *this morning*, before a crossing of the harbor at night, which tells us something about the subject's priorities.
SCRUTINY: Greatcoat of the Inquest Office, grey, twenty years old, lining loose at the hem. Silver Last Line pin at the lapel, polished. Left glove mended at the thumb in a slightly different grey thread — mended by the subject, badly, rather than taken to a mender, which tells us he has no one to take it to, or would rather not be seen needing to.
SCRUTINY: Eyes: grey. Shadows beneath: four months of them. Expression: closed, like a ledger. Hands: steady. Almost too steady — the steadiness of a man holding something very carefully so it won't spill.
* "Conclusion?" -> bv_scr_conc
* "That's enough." -> bv_scr_enough

== bv_scr_conc
SCRUTINY: Conclusion: the subject is a careful man who has been carrying something heavy for a long time, without once setting it down, in a coat that no longer quite fits.
SCRUTINY: Recommended action: take the coat to a mender.
?{met_marta} SCRUTINY: (One comes to mind.)
@xp 5
=> bench_hub

== bv_scr_enough
SCRUTINY: Enough. Of course. You never did like being the scene.
@xp 5
=> bench_hub

// ---------------------------------------------------------------- STARCH
== bv_starch
@time 10
STARCH: Sir. May I speak freely?
* "You never have." -> bv_sta_2
* "Go on." -> bv_sta_2

== bv_sta_2
STARCH: For twenty-nine years I have kept your face shut. It was my whole purpose. At the Tallow Street inquest, when the mothers screamed, I kept it shut. At Sturmhaven, in the rubble, I kept it shut. At the bell tower, with a pistol pointed at it, I kept it *very* shut, and I'd like to think it was my finest hour.
STARCH: And then Fennimore.
STARCH: The boy went into the canal after his little brother. And you began to read the Line — *misadventure, in the course of the rescue of* — and I felt it go. Like a collar-stud popping. I held on with everything I had and it went anyway, and you *laughed*, in front of the mother, for four minutes, and I could do nothing.
STARCH: I have never forgiven myself, sir.
* "It wasn't your fault. Some things don't stay shut." -> bv_sta_fault
* "Hold it tighter tonight." -> bv_sta_tighter

== bv_sta_fault
STARCH: ...Some things don't stay shut.
STARCH: That is a very disturbing thing to hear from the man whose collar I've been starching for twenty-nine years, sir. I shall have to think about it. Possibly while lying down.
@add thaw 1
@xp 5
=> bench_hub

== bv_sta_tighter
STARCH: Tighter. Yes, sir. Collar up. Chin down. Nothing will get out tonight, sir, not so much as a sniff.
STARCH: (I'm not sure I can, sir. The ice is very loud.)
@add thaw -1
@xp 5
=> bench_hub

// ---------------------------------------------------------------- DECORUM
== bv_decorum
@time 10
DECORUM: The Lamplighters' Ball. Twenty-two years ago. The Guild Hall on the Lamp Stairs, with its terrible chandelier and its excellent floor.
DECORUM: You went because your father had been a lamplighter and the Guild still sent the family a ticket every year, and you had never once used it, and that year — for no reason you could name — you put on the Office coat and went.
DECORUM: She was by the punch. She was laughing at something, not at you. You asked her to dance because it would have been impolite not to.
* "I was terrible." -> bv_dec_terrible
* "She taught me." -> bv_dec_taught

== bv_dec_terrible
DECORUM: You were *atrocious*. You held her like a file. You counted out loud. And she said — do you remember? —
=> bv_dec_said

== bv_dec_taught
DECORUM: She did. Patiently, and then impatiently, and then laughing. And in the middle of the second waltz she said —
=> bv_dec_said

== bv_dec_said
DECORUM: *"You dance like a man filing a report."*
DECORUM: And you laughed so hard you had to sit down on the stairs. You. Laughing. On the stairs. People turned to look. It was the first time in twenty-two years you had laughed like that, and it was the last time until Fennimore.
DECORUM: Manners are just kindness with the corners squared off. Dancing is manners with music. You were good at the first. You could learn the second.
?{danced} DECORUM: (You did. Tonight. Didn't you. On the empty floor, under the dripping chandelier. Badly. She was delighted.)
@add thaw 1
@xp 5
=> bench_hub

// ---------------------------------------------------------------- SLEIGHT
== bv_sleight
@time 10
SLEIGHT: Show me your hands. Go on. Take off the gloves.
> You take off your gloves. The cold gets into your fingers at once.
SLEIGHT: Now. Without thinking. A bowline.
> Your fingers do it on their own, in the air, with an invisible rope: the loop, the rabbit out of the hole, round the tree, back down the hole. Four movements. Perfect.
SLEIGHT: Who taught you that?
* "Feliks." -> bv_sle_feliks
* "The Rowing Club." -> bv_sle_club

== bv_sle_club
SLEIGHT: No. The Rowing Club taught you a clove hitch and some very bad songs. The bowline came earlier.
=> bv_sle_feliks

== bv_sle_feliks
SLEIGHT: Feliks. On the kitchen table on the Lamp Stairs, with your mother's apron strings, because there was no rope in the house. *The rabbit comes out of the hole, Aurel. Round the tree. Back down the hole.* He was going to be a ferry captain. He knew eleven knots. He taught you four of them.
SLEIGHT: The Warden tied a bowline at his waist, last night, before he went under. A Warden's bowline, with a slip-tuck, so he could get out of it.
SLEIGHT: Everyone on this ice who ever tried to get someone out of the water learned it from somebody. Round the tree. Back down the hole.
@add thaw 1
@xp 5
=> bench_hub
`);
