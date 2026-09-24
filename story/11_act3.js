CANDLE.script(String.raw`
== a3_start
@act "ACT THREE" "The Thaw Ball"
@clock 00:00
@set act3
@set f_bran = bran_promised
@set f_pim = pim_ready
@checkpoint
@bg ballroom
@music ball
@weather mild
@title THE CHANDELIER — THE THAW BALL
> And then, a few minutes after the last bell, the Mild arrives.
> You feel it first on the back of your neck: a breath of air that is not cold. It comes up the Basin from the south like something walking barefoot over the ice, and it smells of wet earth, and tar, and — absurdly — oranges. The snow in the air turns, between one step and the next, to a fine soft rain.
BAROMETER: There. There it is. The pressure falling like a dropped plate. Everything the Mild touches forgets it was ever winter.
> And under your feet, all across the Glass, the ice begins to sing.
@sfx sing
> Not low. High — a long, falling, electric sound, *pyeww*, *pyeww-ow*, like something fired from very far away. Then another. Then a dozen, overlapping, from every direction at once, as if the whole Basin were a string pulled too tight and plucked.
PIM: Somewhere near the gate, a boy's voice, delighted: "It's *singing!*"
UNDERTOW: It isn't singing. Pim knows. Aino knows. It is laughing.
@if f_odile
> Up on the Chandelier's stage Odile Castellane stands in the full light in a gown the colour of old wine and announces, in a voice that reaches the back of the hall without effort, that the Thaw Ball is moving to the Customs warehouse on the shore — free wine for every guest who walks. Benny strikes up a march.
> About half the hall follows the music out into the rain. The other half stays where it is, laughing, glasses raised. *We paid to dance on the Glass,* someone shouts. *Not on a floor!*
@else
> Inside the Chandelier, six hundred people are dancing the Candle Waltz under a chandelier that drips like a thawing tree. The sprung floor rings under their feet. Nobody can hear the ice over the band.
@endif
@if f_moth
> At the gate, a man in a grey coat is nailing a sheet of cream notepaper to the arch of ice. People stop to read it. They take out their papers and look at the back, where their valuations are printed, and then look at each other.
@endif
ILSE: Beside you, very quietly: "Examiner." She has not opened the notebook. "Whatever you're going to do, it has to be tonight."
?{f_bell} ILSE: A pause. "My mother will want to know you meant it."
=> hub3

== hub3
@hub
@bg glass
@music glass
@weather mild
@title THE GLASS — THE MILD
@if time >= t("03:00")
> The ice is singing without pause now, a continuous high keening from every direction. You have run out of time to do anything but the one thing.
=> ad_start
@endif
@if time < t("01:00")
BAROMETER: The rain is warm. The ice is singing. Somewhere under the Chandelier the seam is opening like a mouth that has been waiting to speak.
@elif time < t("02:00")
BAROMETER: Puddles now, on top of the ice — shallow, black, reflecting the lanterns upside down. The singing has changed key. It is higher. It is faster.
@else
BAROMETER: The Glass is groaning between songs — long low sounds, like a ship's timbers. That's the mother ice, the old thick ice, bearing weight it was never meant to. It will not bear it long.
@endif
?{time >= t("02:20")} HACKLES: *Now.* Whatever you're going to say, say it now. They need time to walk.
+ {!went_under} [Go under the ice, at the Warden's hut. (It will take an hour.)] -> un_prep
+ {!f_bell && !seen("a3_aino_no")} [The Warden's hut. Aino, and the Thaw Bell.] -> a3_aino
+ {!f_odile && !odile_refused} [The Ball. Find Madame Castellane.] -> a3_odile
+ {!f_moth && !moth_refused} [The Mutual's booth.] -> a3_moth
+ {!f_bran && !bran_refused} [The Cutters' Hall.] -> a3_bran
+ {!f_pim && !pim_refused} [The watch-house.] -> a3_pim
+ {!f_quell && !quell_refused} [Across the ice to the Cold Works.] -> a3_quell
+ {knows_ilse_mother && !marta_safe && !marta_refused} [Needle Row. Ilse's mother.] -> a3_marta
+ {!ilse_stays} [Talk to Ilse.] -> il_talk
+ [Take the bandstand at the Chandelier. Close the Glass.] -> ad_start

// ---------------------------------------------------------------- Aino and the bell
== a3_aino
@bg hut
@music interior
@title THE WARDEN'S HUT
@time 40
> The ice around the hut is the grey kind now, glistening with meltwater, and it hums under your boots like the deck of a steamer. Inside, the stove has gone out. Aino is standing under the hole in the ceiling where the bell rope comes down, holding the end of it in both hands, not pulling.
AINO: "I can hear it." She doesn't turn. "The seam. It's gone from laughing to talking. He said when it talks, you've got two hours. Maybe three."
@if f_bell
=> a3_aino_rang
@endif
* {aino >= 3} "Ring it, Warden." -> a3_aino_ring
* {aino >= 2 && bell_idea} "He was going to ring it today. Ring it for him." -> a3_aino_ring
* [GRAVITAS 11] "Aino Sarre. By the authority of the Inquest Office at the scene of a death, I appoint you acting Warden of the Glass." -> a3_aino_appoint | a3_aino_appoint_f
* [TENDERNESS 12] "Nobody listened to him because he was a drunk who took money. They'll listen to you because you're not." -> a3_aino_ring | a3_aino_no
* "I'll come back." -> hub3

== a3_aino_appoint
ARCHIVE: Section eleven. At the scene, the Examiner's word is the Crown's word. The Wardenship of the Glass is a Crown appointment. It has never once been made in the middle of the night by a wet Examiner in a hut. There is nothing in the Act that says it can't be.
> You say it in the full Office voice, the one for Last Lines. It fills the little hut.
AINO: She stares at you. "You can't — you can't just make me the Warden with a *sentence*."
GRAVITAS: You can. That is exactly what the Crown is: a sentence that other people agree to stand on. Like ice.
ILSE: From the doorway, quietly, pencil moving: "Entered."
AINO: Something goes through her. She looks at the rope in her hands as though seeing it for the first time.
@set aino_appointed
@add aino 1
=> a3_aino_ring

== a3_aino_appoint_f
AINO: "No." She shakes her head. "No, you can't. You can't just make me the Warden with a sentence. It's forty years. It's *his*." She holds the rope against her chest. "Not with a sentence."
@set a3_aino_no_flag
=> a3_aino_no

== a3_aino_no
AINO: "I can't." She lets go of the rope. It swings, gently, in the dark. "If I ring it and I'm wrong, I'm the girl who rang the Warden's bell the night he died. If I ring it and I'm right—" She stops. "Go away, Examiner. Come back when it's over."
@set a3_aino_no_seen
-> hub3

== a3_aino_ring
AINO: She takes a breath. The kind you take before going under.
> She pulls.
@sfx bell
> Up on the roof, a small iron bell — no bigger than a bucket — opens its mouth, and a sound comes out of it far larger than the bell. It goes out across the Glass low and round and patient, the way the Warden's voice must have sounded when he told people where to put their houses.
> She pulls again. And again. She finds the rhythm — you can see her find it, see her remember his hands on the rope — and the bell settles into it, *dong... dong... dong...*, the old slow Thaw peal that has closed the season on the Basin for forty years.
> Through the open door you watch the Glass hear it. Lamps come on in huts. Doors open. People come out into the warm rain in their nightclothes, and stand, and listen. And then — first one, then ten, then everywhere — they go back inside and begin, without argument, to pack.
UNDERTOW: Older than the Mutual. Older than the Lantern. Older than the Crown. Nobody has ever not gone.
AINO: She is crying now, finally, silently, pulling the rope. "Good ice," she says to nobody, between strokes. "Good ice. Good ice. Good ice."
@set f_bell
@add aino 2
@xp 30
=> a3_aino_rang

== a3_aino_rang
AINO: "I'll keep ringing till they're off." She doesn't look round. "Go do whatever else you're going to do, Examiner. I've got the bell."
-> hub3

// ---------------------------------------------------------------- Odile
== a3_odile
@bg ballroom
@music ball
@title THE CHANDELIER — THE THAW BALL
@time 40
> The Ball, at its height, is a storm of colour: six hundred people in their best, red and wine and green and yellow, turning under a chandelier that is now visibly *raining*, the icicles among its crystals streaming meltwater onto the dancers, who shriek and laugh and dance through it. The floor hums under your feet — not the pleasant ringing of a sprung floor, but a deep, grinding note, felt more than heard.
?{knows_lotte} HACKLES: A little girl in a yellow ribbon, dancing with her aunt near the stage. Nine years old. On the seam.
DANCER: A young man in a borrowed tailcoat seizes your hand. "Dance, Examiner! It's the Thaw Ball! Nobody's allowed to be sad!" And he's gone again into the crowd before you can answer.
> Up in the gallery, behind the gauze, a figure in wine-dark silk is watching her Ball.
ODILE: When you reach her, she doesn't turn. "It's singing, Examiner. I can hear it through the floor. I used to kneel down to hear it." Her hand is flat on the gallery rail, feeling the hum. "I'm not deaf. I'm only ruined."
* {knows_mutual_clause && odile >= 0} "Let it be my order. The Mutual pays you. Move them now." -> a3_o_yes
* {proof_fist || proof_under} [Show her the candle ice.] -> a3_o_proof
* [TENDERNESS {11 - (knows_odile_past ? 2 : 0) - (danced ? 2 : 0)}] "He told you you'd be dancing on it when it went. Odile — don't let him be right." -> a3_o_yes | a3_o_no
* [GRAVITAS 12] "Madame. Stop the music." -> a3_o_yes | a3_o_no
* "I'll close it myself, from the bandstand." -> hub3

== a3_o_proof
> You hold it out on your palm. The warmth of the gallery works on it at once: the long needles lean, slide, collapse into a wet glittering heap.
ODILE: She watches it the way you would watch someone breathe their last. "Sugar," she says. "He said sugar."
=> a3_o_yes

== a3_o_yes
ODILE: She turns from the rail. For a moment she looks at the whole bright hall below — thirty-five years of it — the way you'd look at a face you're about to kiss goodbye.
ODILE: "Benny!" Over the rail, in the voice that once filled a tent with a fiddler and a brazier. "*The long march!* Take them to the Customs warehouse! Free wine! Everyone out!"
> Below, the old accordionist doesn't hesitate. The band breaks off the waltz mid-bar and swings into a march, and Benny climbs down off the stage still playing and starts through the crowd toward the doors, and the crowd, laughing, confused, delighted — the way crowds always follow a band — begins to follow him out into the rain.
@set f_odile
@add odile 1
@xp 25
=> hub3

== a3_o_no
ODILE: "No." Softly. "It's the last Ball, Examiner, isn't it? One way or another. Let them have it." She turns back to the rail. "Let *me* have it."
@set odile_refused
@add odile -1
-> hub3

// ---------------------------------------------------------------- Moth
== a3_moth
@bg booth
@music interior
@title THE GREAT MUTUAL — GLASS OFFICE
@time 40
> Moth is standing outside his booth in the warm rain with his hat off, listening to the ice sing. He looks, for the first time, like a man without a book.
MOTH: "I've been calculating it by ear." He doesn't look at you. "It's a very poor method. It's also, I'm afraid, rather conclusive."
* {has_logbook || has_log || proof_fist || proof_under} [LEDGER {10 - (thought("price") ? 2 : 0) - (has_logbook ? 2 : 0) - (proof_under ? 1 : 0)}] "Then let me give you the figures to go with it." -> a3_m_yes | a3_m_no
* {thought("price")} "Six and a half million crowns, Moth. On a floor that's singing." -> a3_m_price
* [TENDERNESS 12] "You don't need a figure. You've been standing out here listening." -> a3_m_yes | a3_m_no
* "Never mind." -> hub3

== a3_m_price
@if has_logbook || has_log || proof_fist || proof_under
=> a3_m_yes
@endif
MOTH: "Beautifully put." He puts his hat back on. "Still not a figure."
@set moth_refused
-> hub3

== a3_m_yes
MOTH: He takes a pencil from his pocket, looks at it, and puts it back without writing anything. "Seventy percent," he says. "At least. I don't need the machine."
> He goes into the booth and comes out with a sheet of cream notepaper, already written, already signed. He must have written it an hour ago and not been able to post it.
MOTH: "The Mutual withdraws cover from anyone on the ice after one o'clock." He turns toward the gate. "I'll read it at the Chandelier myself. People don't believe paper. They believe a man in a good coat who looks frightened." A thin smile. "I find I'm well cast."
@set f_moth
@add moth 1
@xp 25
=> hub3

== a3_m_no
MOTH: "Not enough." He says it almost apologetically. "I'm sorry, Examiner. I'd be dismissed by breakfast and the notice torn down by two. Bring me something the Tables can't argue with."
@set moth_refused
-> hub3

// ---------------------------------------------------------------- Bran
== a3_bran
@bg cutters
@music interior
@title THE CUTTERS' HALL
@time 40
> The hall is empty but for Bran and a dozen men, standing in the doorway in their oilskins, listening to the ice with their heads on one side like dogs.
BRAN: "It's talking." He doesn't greet you. "Forty years I've heard it sing. I've never heard it *talk*."
* [TENDERNESS {11 - (bran >= 2 ? 2 : 0)}] "Then help me get them off it before it finishes the sentence." -> a3_b_yes | a3_b_no
* {thought("saw")} "Pull, and let them pull. Never push the steel." -> a3_b_yes
* {has_logbook} "It's the Works. I have Quell's own log. Help me, and I'll put it in the Last Line." -> a3_b_deal
* [SINEW 12] [Pick up a coil of line and a plank and walk out into the rain without a word.] -> a3_b_yes | a3_b_no
* "Never mind." -> hub3

== a3_b_deal
BRAN: He looks at you hard. "In the Last Line. With their name on it."
* "With their name on it." -> a3_b_deal_yes
* "I'll put in what's true. That's all I can promise." -> a3_b_deal_true

== a3_b_deal_yes
@set promised_bran_unlawful
BRAN: "Then we're on." He spits in his palm and holds it out. You shake it. It's like shaking hands with a door.
=> a3_b_yes

== a3_b_deal_true
BRAN: He considers that for a long moment. "...Aye. That'll do. True's got their name on it anyway."
=> a3_b_yes

== a3_b_yes
BRAN: "Right, lads." He doesn't raise his voice. He doesn't need to. "Planks. Poles. Line. We work the seam — anyone goes in, we're on them before they've finished shouting. Tammas, Dutchman, the north end. Rest with me."
BRAN: As they go: "And Examiner. When you get up on that bandstand — don't shout. Nobody on the Glass listens to shouting. Wait for us." He grins in his wet beard. "We'll knock."
@set f_bran
@set bran_knock
@add bran 1
@xp 25
=> hub3

== a3_b_no
BRAN: "Help." He shakes his head slowly. "We'll be on the ice, Examiner. For our own. We always are." He turns back to listen. "The rest can follow the band."
@set bran_refused
-> hub3

// ---------------------------------------------------------------- Pim
== a3_pim
@bg watch
@music interior
@title THE GLASS WATCH-HOUSE
@time 40
> Pim is standing in the middle of the watch-house with his hand on the bell rope and his lantern lit and his eyes shut, lips moving. Praying, or reciting the Handbook. Possibly both.
@if pim_maybe
PIM: "Sir." His eyes open. "I walked the blue line. Twice. I can do it." He swallows. "But the bell, sir. Six months, if it's false. And everybody'll know it was me."
* [KEEL 10] "It isn't false. And they *should* know it was you." -> a3_p_yes | a3_p_no
* [GRAVITAS 10] "Constable Vandersloot. That's an order." -> a3_p_yes | a3_p_no
* "Then don't ring it. Just walk the line." -> a3_p_half
@else
PIM: "Sir! What — is it — is it now, sir?"
> You tell him what you need. The safe way off: the Warden's blue-flag line. The Break Bell.
* [TENDERNESS 10] "You told me you'd be awake tonight. This is what awake looks like." -> a3_p_yes | a3_p_no
* [GRAVITAS 11] "Constable. Ring the bell." -> a3_p_yes | a3_p_no
* "Then don't ring it. Just walk the line." -> a3_p_half
@endif

== a3_p_yes
PIM: He takes a breath. It goes all the way down. "Yes, sir."
@sfx bell
> He pulls. The Break Bell has a different voice from the Thaw Bell — harsh and fast, a hammer on a pan, *clang-clang-clang-clang* — the sound of a house on fire. It hasn't been rung in twenty years. Half the Glass has never heard it. All of the Glass knows what it means.
> Then he takes his lantern and runs out into the rain, and you hear his voice going away across the ice, cracking on the high notes, not caring: "*This way! Blue flags! Follow the blue! Not the straight way — the BLUE!*"
@set f_pim
@add pim 1
@xp 25
=> hub3

== a3_p_half
PIM: "Just the line." He looks relieved and ashamed in equal parts. "Yes, sir. I can do the line."
> He takes his lantern and goes. You hear no bell.
@set pim_line_only
@set f_pim
=> hub3

== a3_p_no
PIM: He lets go of the rope. "I can't, sir. I'm sorry. I'm not — I'm not the Warden. I'm not you." He sits down on the cot with his lantern between his boots. "I'll be here. If anyone comes in, I'll tell them."
@set pim_refused
-> hub3

// ---------------------------------------------------------------- Quell
== a3_quell
@bg works
@music wind
@title THE COLD WORKS
@time 40
> The walk to the shore takes longer in the rain. The seam is a river now, a black stripe of meltwater on top of the ice, and you walk beside it, not on it.
@if seen("wo_in")
QUELL: He meets you at the door, in his cardigan, with his key ring already in his hand. "I heard the bells. I've been standing here. I didn't know if I was allowed to—"
@else
> A thin man in shirtsleeves and a cardigan is standing in the lit doorway of the building, staring out at the Glass. When he sees the silver pin on your coat he goes white, and then — oddly — looks relieved.
QUELL: "You're from the Inquest." His voice is shaking. "I'm Quell. Night engineer. I — my daughter's out there. At the Ball. She's nine."
@endif
* "Open the engine hall, Mr. Quell. They'll need somewhere warm to go." -> a3_q_yes
* {!quell_diverted} "And shut the outfall." -> a3_q_divert

== a3_q_divert
QUELL: "Yes." He doesn't argue. He goes into the roaring hall, and after a while you hear a great iron wheel turning, and far off a groan of water finding another way to go.
@set quell_diverted
=> a3_q_yes

== a3_q_yes
QUELL: He looks at the key ring in his hand as if it were a medal. "The engine hall. Yes. It's the warmest room in Aubade. We throw heat away all night, that's the — that's the whole problem." He unlocks the great doors. Warm air rolls out into the rain like breath. "Tell them. Tell them to come here."
@set f_quell
@add quell 1
@xp 20
=> hub3

// ---------------------------------------------------------------- Marta
== a3_marta
@bg mending
@music interior
@title NEEDLE ROW
@time 40
@if f_bell
> The stall is half-packed. Coats are coming down off their hooks in armfuls and going into a handcart. Marta Varga is directing the operation from atop a crate, with pins in her mouth, like an admiral.
MARTA: "The bell rang!" Through the pins. "Didn't you hear it? The bell rang, love. That's what the bell's for." She beams at Ilse. "Take that end of the cart, Ilsie."
> Ilse takes that end of the cart. Her face, for the length of one breath, is entirely unguarded.
@set marta_safe
@add ilse 1
@xp 10
-> hub3
@endif
> The stall is exactly as it was: the forest of coats, the lamp, the treadle going. Marta Varga is mending a child's jacket as if the ice were not singing all around her.
ILSE: She stops in the lane. She doesn't go in. "Mama." It is the first time you have heard her say it. "Mama, it's going. The Examiner says it's going."
MARTA: "When the bell rings, love." She doesn't look up. "Not before. Who'll mend them, if I go?"
* {ilse >= 3} [Look at Ilse. Let her say it.] -> a3_m_ilse
* [DECORUM 10] "Madame Varga — there'll be eleven hundred people at the Works tonight with torn coats. I need a mender there. Officially." -> a3_mm_yes | a3_mm_no
* [TENDERNESS 11] "Your daughter can't lose you on the ice, Marta. Not her too." -> a3_mm_yes | a3_mm_no
* [SINEW 10] [Pick up the sewing machine.] -> a3_mm_carry | a3_mm_no
* "We'll come back." -> hub3

== a3_m_ilse
ILSE: She goes into the stall. She takes the child's jacket out of her mother's hands, gently, and puts it down. She kneels in front of the crate, so that she is lower than her mother, the way you knelt in the Warden's hut.
ILSE: "Mama. Please. I've written down eleven thousand hours of people who didn't leave in time. I don't want to write down you."
MARTA: She looks at her daughter's face for a long time. Then she takes the pins out of her mouth, one by one, and puts them in the cushion.
MARTA: "Well," she says. "Well, if it's for the *record*."
=> a3_mm_yes

== a3_mm_carry
> You bend, take the treadle machine by its iron frame — it weighs roughly as much as a regret — and lift it off the floor.
MARTA: "Put that — you put that *down*—" But she's already on her feet, following her machine out of the stall, because a mender follows her machine the way a fiddler follows his fiddle. "Mind the treadle! Mind the *belt!*"
=> a3_mm_yes

== a3_mm_yes
MARTA: "Ilsie, the good scissors. And the thread box. And the — oh, the *blue* coat, that's the Hanssen boy's, he'll freeze." She's packing now, fast, with a mender's economy. "Officially, he says. Officially."
@set marta_safe
@add ilse 2
@add thaw 1
@xp 20
ILSE: As they go, she looks back at you, over the handcart. She doesn't say anything. She doesn't need to. You will find it later, if you're lucky, in a small black notebook.
-> hub3

== a3_mm_no
MARTA: "No." Placidly, completely, like a stone saying no to a river. "When the bell rings."
ILSE: She stands in the lane with her fists closed. "Then I'll stay with you."
MARTA: "Don't be silly, Ilsie."
ILSE: "Then I'll stay with you." She looks at you. "Go, Examiner. Do what you have to do. I'll be here."
@set marta_refused
@set ilse_stays
-> hub3
`);
