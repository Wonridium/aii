CANDLE.script(String.raw`
== hut_enter
@bg hut
@music interior
@title THE WARDEN'S HUT
@if seen("hut_enter") > 1
@time 15
=> hut_return
@endif
@time 25
> The Warden's hut stands at the very edge of the Glass, where the lanterns give out and the Basin goes on into the dark without them. It is on runners, like every house here: a box of tarred planks with a stovepipe, and a rack of flags outside — blue, red, blue, red — furled like umbrellas in a hall.
> There is smoke coming from the stovepipe.
HACKLES: Someone is inside. Someone has been inside all day, with the door shut, while a whole town stood and looked at the Warden's face.
BAROMETER: This is where the dark begins. Past the hut the ice is the other kind — grey, porous, sighing very faintly, as if breathing through its teeth.
* [Knock.] -> hut_knock
* [Open the door.] -> hut_open
* [GRAVITAS 9] "Inquest Office. Open this door." -> hut_grav | hut_grav_f

== hut_knock
@sfx knock
> You knock. Three times, softly. You do not decide how many; your hand simply does it.
UNDERTOW: Three.
UNDERTOW: You knocked three times.
> Silence. Then, from the other side of the door, a girl's voice, rough with not sleeping:
AINO: "Who's there?"
HACKLES: Oh no. Oh, no. That's *your* line.
* "The Examiner. From the Inquest Office." -> hut_knock_2
* "Aurel Marrow." -> hut_knock_name
* "...A friend of your grandfather's." -> hut_knock_friend

== hut_knock_2
AINO: A long pause. "The Marrow?"
* "Yes." -> hut_knock_name
* "The Examiner Marrow, yes." -> hut_knock_name

== hut_knock_name
@add aino 1
> The bolt draws back.
=> hut_inside

== hut_knock_friend
AINO: "He didn't have friends. He had Odile, and the bottle, and me." The bolt draws back anyway, slowly. "And you, I suppose. He said you'd come."
@add aino 1
=> hut_inside

== hut_open
@insert v_chisel
@sfx door
> You open the door. The end of a long-handled ice chisel arrives at the hollow of your throat, cold as a fact.
HACKLES: *Don't move.* Chisel. Sharp end. Throat. Our throat. Don't move a single hair.
=> hut_inside

== hut_grav
@sfx door
> The authority of the Crown goes in through the planks like cold. After a moment, the bolt draws back, and the door opens exactly the width of a face.
AINO: "You're him. The Marrow." It is not a compliment. "Come in, then. Everybody else has shouted through the door today. You might as well do it from inside."
@add aino -1
=> hut_inside

== hut_grav_f
AINO: From inside, flat and final: "Go away."
GRAVITAS: She — she said *go away*. To the Crown.
* [Knock.] -> hut_knock
* [Open the door.] -> hut_open

== hut_inside
> A girl of sixteen or so, Rime-folk, in a man's quilted coat with the sleeves rolled back four times. Her face is swollen with a day of crying and a night of not. She holds a long ice chisel the way a person holds a spear when they have only seen it done in pictures and have decided to do it anyway.
> Behind her, the hut: a pot-bellied stove going red, a lantern on a hook, flags rolled in a rack, a table with a heavy ledger on it. In the middle of the floor, a square trapdoor stands open over a square of ice. By the stove a rope lies coiled, very neatly, in perfect flat rings.
AINO: "He said you'd be tall and sad." She looks you up and down. "You're tall."
* [Sit down on the floor, below the chisel.] -> hut_sit
* [DECORUM 9] "Miss Sarre. May I come in?" -> hut_miss | hut_miss_f
* [APPETITE 8] "Have you eaten anything today?" -> hut_eat | hut_eat_f
* [SLEIGHT 12] [Take the chisel out of her hands.] -> hut_grab | hut_grab_f
* "I've come about your grandfather." -> hut_plain

== hut_sit
> You fold yourself down onto the plank floor, coat and all, knees up, until your head is lower than the chisel's point. It takes some time. Your body has opinions about floors.
SINEW: Fifty-six years old. Sitting on a floor. It's good for you. It's terrible for you. It's good for you.
AINO: She looks down at you for a long moment. The chisel's point drifts, uncertain, toward the ceiling. "Big men don't sit on floors."
* "This one does." -> hut_sit_2
* "I'm not a big man. I'm just tall." -> hut_sit_2

== hut_sit_2
> She props the chisel against the wall. She does not sit down — not yet — but she stops holding herself like a door with a bar across it.
@add aino 2
=> hut_talk

== hut_miss
AINO: She blinks. "Nobody calls me that." A pause. "*Miss Sarre.*" As though tasting it for poison. "...You can come in. Shut the door, the heat's going."
@add aino 1
=> hut_talk

== hut_miss_f
AINO: "Don't do that." Sharp. "Don't do the voice. Everyone does a voice at me today. The priest does a voice. Bran does a voice. You're the Examiner, do the Examiner voice or don't do one."
DECORUM: Too much bow. You bowed at her. She is sixteen and her grandfather is under a sheet, or a carpet, and you *bowed*.
=> hut_talk

== hut_eat
@if sig == "APPETITE"
@insert v_cake
@sfx paper
> Your hand is already in your coat pocket. Greaseproof paper. A honey cake from the vendor at the ferry, only a little squashed. You hold it out.
@else
> In your coat pocket, under the Office seal, there is a twist of paper with three sugared almonds in it, left over from a christening in Harrowgate in autumn. You hold them out.
@endif
APPETITE: Sugar. For grief. It's the oldest medicine. It's older than the Lantern.
AINO: She takes it without thanks and eats it in two bites, standing up, the way people eat when their body has been left behind by the rest of them. "...Thanks."
@add aino 1
=> hut_talk

== hut_eat_f
AINO: "Odile sent a ham." She jerks her head at the table, where a whole glazed ham sits on a plate, untouched, with a card propped against it. "I'm not eating her ham."
=> hut_talk

== hut_grab
> Your hand moves before the decision does. A turn of the wrist, a step inside the point, and the chisel is in your grip and she is holding nothing.
AINO: She stares at her empty hands. Then at you. Something in her face goes from fierce to very, very tired. "...He could do that. Used to take the gaff off drunks at the Ball."
@add aino -1
=> hut_talk

== hut_grab_f
> You reach for it. She is quicker. The blade slides along the back of your glove and opens it, and the back of your hand, in a single line.
@health -1
AINO: "Don't." Her voice is shaking. "Don't *touch* things. Everyone's been touching things all day."
@add aino -1
=> hut_talk

== hut_plain
AINO: "I know what you've come about." She does not lower the chisel. "Ask your questions. Then go."
=> hut_talk

// ---------------------------------------------------------------- conversation
== hut_talk
+ {!seen("hut_sorry")} "I'm sorry about your grandfather." -> hut_sorry
+ {!seen("hut_trap")} [Look at the trapdoor in the floor.] -> hut_trap
+ {!seen("hut_coil")} [Look at the rope coiled by the stove.] -> hut_coil
+ {!seen("hut_log")} [Look at the ledger on the table.] -> hut_log
+ {seen("hut_log") && !seen("hut_candle")} "The log says the ice is 'candled'. What does that mean?" -> hut_candle
+ {!seen("hut_asked")} "He asked the Office for me by name. Do you know why?" -> hut_asked
+ {seen("hut_coil") && !knows_rope} "The other end of the rope is here. Who was holding it, Aino?" -> hut_rope_ask
+ {knows_rope && !seen("hut_warden")} "You're the Warden now." -> hut_warden
+ {sarre_towel && !gave_towel} [Give her the Warden's towel.] -> hut_towel
+ {!seen("hut_teach")} "Teach me to listen to the ice." -> hut_teach
+ {aino >= 2 && !seen("hut_mother")} "Where are your parents, Aino?" -> hut_mother
+ [Leave her be, for now.] -> hut_leave

== hut_sorry
AINO: "Everyone's sorry." She says it without venom, as a statement of inventory. "Odile sent a ham. The priest sent a candle. The Mutual man sent a *form*." She gestures at a pink sheet pinned to the door with a fish-hook. "Bran sent six cutters to stand outside and look at the door."
* "What would you want someone to send?" -> hut_sorry_want
* "The form can wait." -> hut_sorry_form

== hut_sorry_want
AINO: She opens her mouth. Closes it. When she speaks it is to the stove. "Him."
TENDERNESS: That is the whole of the answer. Don't add anything to it.
@add aino 1
=> hut_talk

== hut_sorry_form
> You cross to the door, unhook the pink form from its fish-hook, fold it in four, and put it in your coat.
AINO: She watches you do it. Some small, clenched thing in her shoulders lets go by a fraction of an inch.
@add aino 1
=> hut_talk

== hut_trap
@insert v_trapdoor
> The trapdoor opens onto a square of ice set into the hut's floor, like a window into a cellar. It is the Warden's measuring hole — the place he would drill each morning, read the ice, and write it down.
SCRUTINY: The ice in the square is new: clearer and darker than the rest, a skin only a finger or two thick. The edges of the square are chiselled fresh — pale shavings still frozen to the lip. Someone cut this hole open last night, big enough for a man, and it has healed over since.
BAROMETER: And it has not healed well. The new ice is weeping at the edges. There is warmth coming up from underneath it — a faint, sick warmth, like the breath of a sleeping animal.
@clue hole_hut The Warden went into the water through the measuring hole in his own hut. It was cut open last night and has refrozen thinly — the water beneath is oddly warm.
@done hole
@xp 10
AINO: She has gone very still, watching you look at it.
=> hut_talk

== hut_coil
> A coil of oiled hemp, twenty or thirty fathoms, laid down in flat perfect rings as if for a ship's inspection. You lift the top ring. The end of it is cut clean, one stroke, the fibres flush.
SCRUTINY: It matches. The same line, the same oil, the same clean cut. This is the other end of the rope at the dead man's waist.
UNDERTOW: Somebody coiled this afterward. Neatly. The way you would fold the clothes of someone who is coming back for them.
@clue rope_other The other end of the Warden's rope is in his hut, coiled neatly. Somebody pulled it in after it was cut.
@done rope
@xp 10
AINO: "Don't touch that." Very quietly.
=> hut_talk

== hut_log
@insert v_ledger
@sfx paper
> The ledger is enormous, bound in oilcloth, its pages swollen with forty-one winters of damp. The Warden's hand is large and careful, the letters built one at a time like cairns. Most of it is numbers: holes, depths, the colour of the ice. The last pages are something else.
DOC: *3 Deepwinter.* Hole 1 (gate): 61 cm, black. Hole 7 (Chandelier steps): 58 cm, black. Good ice. Sang low all night. Declared the season open. O.C. paid 40. Told her it was 40 last year also. She said inflation.
DOC: *19 Deepwinter.* Hole 7: 57 cm. Took a core. Bottom of the core rotten — candled. In Deepwinter. Never in my life seen it in Deepwinter.
DOC: *24 Deepwinter.* Walked the line at night with the lantern. There is a seam. It runs from the Works' pipe on the shore, under my hut, under the Chandelier, and on toward the Narrows. Snow melts on it first. The ice sings wrong on it. High. Like it is laughing.
DOC: *2 Thawmonth.* Told O.C. the seam will go. She gave me 40 and a bottle and said go and sleep it off. Did not drink the bottle. Put it on her doorstep.
DOC: *5 Thawmonth.* Went to the Works. The night man, Quell, would not show me the pipe temperatures. Said they were within the permit. His hands shook. A good man, frightened.
DOC: *7 Thawmonth.* Told the Mutual man. He asked for figures. I gave him figures. He asked for better figures. The ice does not do better figures.
DOC: *9 Thawmonth.* Told the boy constable to ring the bell. He said he needs a reason. I said I would give him a reason.
DOC: *11 Thawmonth.* Told the Deaconess a thing I should not have. She told me a thing she should not have. We are even.
DOC: *12 Thawmonth.* Wrote to the Office. Asked for the Marrow boy.
DOC: *16 Thawmonth.* The Mild is coming early. I can smell it. Nobody else can. The Ball is Thursday.
DOC: *17 Thawmonth.* Tomorrow I will show them. Aino will hold the rope. She is stronger than me now. I will not tell her so.
ARCHIVE: Today is the eighteenth of Thawmonth. Thursday.
@set has_log
@clue log The Warden's log: the ice is candled — rotten from below — along a seam running from the Cold Works' pipe, under his hut, under the Chandelier. He warned Odile, Quell, the Mutual, the constable and the Deaconess. "Tomorrow I will show them."
@task seam Find out what is rotting the ice along the seam.
@xp 20
> Inside the back cover, something has been glued in: a sheet of yellowed newsprint, and beneath it another, and another, overlapping in neat rows like roof slates.
* [Read the clippings.] -> hut_clip
* [Close the ledger.] -> hut_log_close

== hut_log_close
KEEL: Wise. Or cowardly. From the outside they look exactly the same, which is why you have been able to do so much of the second for so long under the name of the first.
UNDERTOW: They'll still be there. That's the thing about paper. It waits.
@add thaw -1
=> hut_talk

== hut_clip
DOC: THE AUBADE EVENING LAMP — *BOY PULLED FROM BASIN; BROTHER LOST.* — "...at dusk on the Narrows, where the ice had been posted as unsafe. A young ice-man of the Rime-folk, Ailo Sarre, eighteen, ran out with a boat-hook and drew the younger boy, Aurel Marrow, twelve, from the water. Of the elder brother, Feliks, fourteen, who had gone in after him, nothing was found..."
> Beneath it, a column of others, each cut out with care. EXAMINER MARROW RULES ON TALLOW STREET DEATHS. THE *BRISK* WIDOWS: EXAMINER SITS THROUGH THE NIGHT. STURMHAVEN — EXAMINER IN THE RUBBLE. THE BELL-TOWER INQUEST: "BEFORE OR AFTER?" Dozens of them. Twenty-nine years of them, yellowed to different shades, like a wall of weather.
> The last is from this autumn: EXAMINER TAKES LEAVE AFTER FENNIMORE INQUEST. In the margin, in the same large careful hand as the log, in pencil: *Poor boy.*
@set knows_rescue
@done narrows
@thought closer
@done why
@xp 30
=> hut_chorus

== hut_chorus
UNDERTOW: It was him. The boat-hook. The collar. The young man running across the ice with his mouth open. It was *him*.
HACKLES: He knew where you lived. He knew for forty-four years where you were. He was *watching*—
TENDERNESS: No. Not watching. Keeping. There's a difference, and you know it, because you know what it is to keep things.
LEDGER: Item: he never came to you. Item: not once, in twenty-nine years of Last Lines he could have walked into any courtroom and heard read aloud. Item: this does not balance.
STARCH: Your face. Sir. Your face is doing something. There are people present.
KEEL: Let it. Just this once. There's only a girl here, and she has seen worse today.
?{pass("BAROMETER", 10)} BAROMETER(10): Outside, the ice makes a long low sound, the sound it made on the Narrows forty-four winters ago just before it opened. You have not heard that sound since. You have heard it every night.
AINO: She has been watching you read. "He read them to me," she says. "Your rulings. At night, when I was small. Like stories. He'd say, 'The Marrow boy got another one right.'"
* [Close the ledger, very gently.] -> hut_clip_close
* "He kept them. All of them." -> hut_clip_kept
* [Sit down on the Warden's bench before your legs do it for you.] -> hut_clip_sit
* "Why didn't he ever come to me?" -> hut_clip_why

== hut_clip_close
> You close the ledger the way you would close the eyes of someone at a scene: with two fingers, and without hurry.
AINO: "You can take it. For the inquest." A pause. "Bring it back."
@add aino 1
=> hut_talk

== hut_clip_kept
@add thaw 1
@add aino 1
AINO: "He kept everything." She almost smiles. "He kept the string off every parcel for forty years. There's a drawer. You don't want to open the drawer."
=> hut_talk

== hut_clip_sit
> The bench is warm from the stove. You do not remember sitting down, exactly. One moment you were standing over the ledger and the next you are looking at your own hands on your knees, and they are shaking, very slightly, in a way you have never permitted them to shake in front of anyone.
@morale -1
@add thaw 2
AINO: She sits down beside you on the bench. Not close. Just there. After a while she says, to the stove: "He used to do that too. Sit down in the middle of things."
@add aino 2
=> hut_talk

== hut_clip_why
AINO: "I asked him that." She picks at the rolled sleeve of her coat. "He said you'd look at him and see the water."
AINO: "He said the only good thing he ever did in his life was pull you out, and the only thing he ever did wrong in his life was not pull out your brother, and he couldn't stand in front of you with both of those on his face at once."
TENDERNESS: She has been carrying that sentence for years, waiting to hand it to someone. Now it's yours.
@add thaw 1
@add aino 1
=> hut_talk

== hut_candle
AINO: This she can answer. Her whole body changes; she becomes, for a moment, a Warden's apprentice explaining her trade to a fool.
AINO: "In spring the ice goes rotten from the inside. It doesn't get thinner — that's what people think. It stays thick. But inside it turns to candles: long needles, all standing up on end, each one separate from the next. Like a rack of church candles."
AINO: "You drill it, it's sixty centimeters. You kick it, it's sixty centimeters. You put four hundred people and a band on it and it's *nothing*. It's sugar. It goes all at once. There's no crack first. It just — stops being there."
AINO: "It happens in Thawmonth, after the Mild. It doesn't happen in *Deepwinter*." Her voice cracks on the word. "He said it was the Works. He said they were cooking the Basin."
ARCHIVE: Candle ice. Columnar decay. Yes — there are Rime words for it, seven of them, one for each stage. The last one translates roughly as *the ice has forgotten it is holding anything*.
@set knows_candle
@thought candle
@clue candle Candle ice: thick from above, rotten from within. It gives no warning; it simply gives way. Aino says it should not happen until after the Mild — not in Deepwinter.
@xp 15
=> hut_talk

== hut_asked
@if knows_rescue
AINO: "Because you're the boy." She says it as if it were obvious, which, now, it is. "And because you're the Examiner. He asked a lawyer once, drunk, what it takes to close the ice. The lawyer said: a dead man on it, and an Examiner. He laughed for an hour."
@else
AINO: She looks at you strangely. "You don't know?" She glances at the ledger on the table, then away. "It's in there. At the back. I'm not going to say it for him."
@endif
@set hut_asked_done
=> hut_talk

== hut_rope_ask
AINO: She doesn't answer. She looks at the coil of rope for a long time.
@if aino >= 3
=> hut_confess
@endif
* [TENDERNESS 11] "You held it, didn't you. You held it as long as you could." -> hut_confess | hut_rope_f
* [GRAVITAS 12 red] "Aino. I need the truth, for the record." -> hut_confess | hut_rope_f2
* [Let it be, for now.] -> hut_talk

== hut_rope_f
AINO: "I don't want to talk about the rope." She picks up the chisel again, not to threaten — just to have something in her hands. "Ask me later. Ask me when it's over."
@add aino 0
=> hut_talk

== hut_rope_f2
AINO: "For the *record*." She laughs, once, horribly. "Put this in your record: get out."
@add aino -2
=> hut_leave

== hut_confess
> When she speaks it's in a rush, as if she's been holding her breath since three o'clock this morning.
AINO: "He said he'd go down and cut a piece of the rot from underneath. From where you can see it. And bring it up, and put it on Odile's bar in front of everybody, and let them *watch* it fall apart. He said you can argue with a man but you can't argue with sugar."
AINO: "Three tugs means pull. I had the rope round my back like he taught me and my heels against the foot of the stove. I'm strong. He was heavy, but I'm strong."
AINO: "It was fine. It was fine for a minute. And then it went *sideways*." She shows you with her arm. "Not down. Sideways. Like something under there had him by the coat and was walking off with him. I couldn't hold. I was sliding. My boots were at the edge of the hole, and the water was—" She stops. "It was *warm*, Examiner. It was steaming."
AINO: "Then three tugs. Hard. That's *pull me up*. And I couldn't. I tried. I tried, I tried, I—"
AINO: "And then it went slack."
> She is not crying. She is past the part where crying is possible, into the flat bright country on the other side of it.
AINO: "I pulled it in. All of it. And it was just the end. Cut." She looks at the neat, flat coil by the stove. "He cut it. He cut it because I wouldn't let go."
@set knows_rope
@set knows_warm
@clue rope_held Aino held the rope. A warm current dragged the Warden sideways under the ice; she was being pulled toward the hole. He cut the rope himself — so that she would not follow him in.
@xp 30
UNDERTOW: He chose her. Under the ice, with the knife in his hand, with an arm's length of choice left to him. He chose the one who was closer.
* "It wasn't your fault." -> hut_c_fault
* {knows_rescue} "He chose you. The way he once chose me." -> hut_c_chose
* "You held on. That's what he taught you. Then he did what he'd taught himself." -> hut_c_taught
* [Say nothing. Stay.] -> hut_c_stay

== hut_c_fault
AINO: "Everyone's going to say that." Flat. "It's what you say. It doesn't mean anything. It's like 'Lantern keep you.'"
KEEL: She is right, and it was still worth saying. Some sentences are not for the person who hears them. They are for later, for three in the morning, for a year from now.
@add aino 1
=> hut_c_after

== hut_c_chose
AINO: She looks up. Really looks at you, for the first time since you came in.
AINO: "...He always said you were closer. When he told it. 'The Marrow boy was closer.'" A breath. "I was closer."
TENDERNESS: There it is. Not comfort — something better than comfort. A place to stand.
@add aino 3
@add thaw 1
=> hut_c_after

== hut_c_taught
AINO: "He taught me to hold." Her mouth twists. "He never said anything about letting go. That was the only thing he never taught me."
@add aino 2
=> hut_c_after

== hut_c_stay
> You say nothing. You stay where you are. The stove ticks. Outside, the ice laughs its thin high laugh, and inside neither of you laughs back.
> After a while she leans, very slightly, so that her shoulder is touching your arm. You do not move.
@add aino 2
@add thaw 1
=> hut_c_after

== hut_c_after
AINO: "Why didn't I tell anyone? That's what you want to ask." She wipes her face with the rolled sleeve. "Because he told me. 'If it goes wrong, say nothing until the Marrow comes. Tell only him.'"
AINO: "And because they'll *use* it. The Mutual man will say he killed himself, and I'll get nothing, and the priest won't bury him in the Lantern-ground. And Bran will say the Works killed him, and make him into a flag, and wave him."
AINO: She reaches inside her coat and touches something there — a folded paper, by the crackle. She does not take it out. "He left something for you. Not yet. He said *after*. He said you'd read it wrong if you read it before."
@set letter_promised
@clue letter The Warden left a letter for you with Aino. She will give it to you "after". He said you would read it wrong before.
=> hut_talk

== hut_warden
AINO: "I'm sixteen." She says it as though it were a disease. "Nobody listens to sixteen. They didn't listen to *sixty-two*."
* "They'll listen to the Warden's bell." -> hut_w_bell
* "Then we'll make them listen." -> hut_w_make
* "You don't have to be anything tonight." -> hut_w_nothing

== hut_w_bell
AINO: She goes very still. "The Thaw Bell." She looks at the ceiling, where a rope goes up through a hole in the planks to the little iron bell on the roof. "Only the Warden rings it. When it rings, everyone on the Glass packs and goes to shore by dawn. It's older than the Mutual. It's older than the *Lantern*. Nobody's ever not gone."
AINO: "He was going to ring it today. After he showed them." Her hands close. "I could ring it. I know how. It's just a rope." She laughs, not really. "It's always just a rope."
@set bell_idea
@add aino 1
=> hut_talk

== hut_w_make
AINO: "*We.*" She tries the word out and seems to find it unfamiliar but not unpleasant. "He said that. 'We'll make them.' He was always saying *we*, and then going and doing it alone."
@add aino 1
=> hut_talk

== hut_w_nothing
AINO: "Yes I do." Immediately, fiercely. "Somebody has to know the ice tonight. There's no one else."
@add aino 1
=> hut_talk

== hut_leave
AINO: As you reach the door: "Examiner." You turn. She's standing over the square of new ice in the floor, looking down at it. "The seam's widening. I can hear it. Whatever you're going to do, don't do it slow."
-> hub2

== hut_return
> The stove is still going. The girl is still here — sitting on the Warden's bench now, the chisel across her knees, listening to the floor.
AINO: {?aino >= 3|"You came back." Something that is almost relief.|"You again."}
=> hut_talk
`);
