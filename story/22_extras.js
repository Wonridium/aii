CANDLE.script(String.raw`
// Extra topics hooked into the existing conversations.

// ---------------------------------------------------------------- the hut
== hut_towel
> You hold out the Warden's towel: grey linen, cedar-smelling, three short blue bars woven into one end.
AINO: She takes it with both hands and looks at the bars for a long moment. "He wove these. The winter I was eight. He said it was so Saari would stop lending it to fat men from the Customs House." Her mouth does something complicated. "It's his chin. It's his marks."
> She holds it against her face. Not crying. Just breathing it in — cedar, smoke, him — with her eyes shut.
AINO: Muffled: "Thank you."
@unset sarre_towel
@set gave_towel
@add aino 2
@add thaw 1
=> hut_talk

== hut_teach
AINO: She looks at you as though you'd asked her to teach you to breathe. "Now?" Then, grudgingly, as if she's been waiting for someone to ask since this morning: "Lie down. On the floor. Ear to the ice — the new ice, in the trapdoor. No, the *other* ear. You've got a deaf side; everyone has."
> You lie down on the plank floor of the Warden's hut in the coat of the Inquest Office, and put your ear to the square of new ice. It is cold enough to burn.
AINO: She lies down too, on the other side of the trapdoor, her face a hand's breadth from yours. "Now shut up. Don't breathe loud."
> For a long time there's nothing. The stove. Your own blood. Then — so low you feel it in your jaw before you hear it — a hum. Deep and round and steady, like a cello being played very softly two rooms away.
AINO: Whispering: "That's the mother ice. The old ice, far down. That's good. That's singing."
> And then, over it, thin and high and electric, from somewhere off to the east — *pyeww* — and again, closer — *pyeww-ow* — like something small and bright being fired a very long way.
AINO: "That's the seam." Her eyes are open now. "That's laughing. He said you'd never forget it once you'd heard it." She sits up. "There are seven Rime words for rotten ice. The last one means *it has forgotten it is holding anything*."
BAROMETER: You'll never un-hear it now. Every step on this ice for the rest of your life, you'll be listening for the cello under the laughter.
@set learned_listen
@if !known("candle")
@thought candle
@endif
@add aino 1
@xp 15
=> hut_talk

== hut_mother
AINO: "My mother died in the fever winter when I was six. His daughter. Sanna." She says it the way you'd say a date. "My father went north before I was born. Rime men do that. They go north and they send reindeer-skin gloves at midwinter, the wrong size."
AINO: "So he had me. Ailo." She almost laughs. "He was terrible at it. He taught me to drill before he taught me to write. I could read a core before I could read a clock. He forgot my birthday every year and then came home with a fish wrapped in newspaper and said *happy ice*."
* "He sounds like a good grandfather." -> hut_mother_good
* "He sounds like my Office." -> hut_mother_office

== hut_mother_good
AINO: "He was a *terrible* grandfather." Fiercely. Then, not fiercely at all: "He was the best one."
@add aino 1
=> hut_talk

== hut_mother_office
AINO: She snorts, despite herself. "Did your Office bring you fish?"
AINO: "...No. I suppose not." She looks at the neat coil of rope. "Nobody else is ever going to bring me fish."
@add aino 1
=> hut_talk

// ---------------------------------------------------------------- the booth
== bo_works
MOTH: He doesn't answer at once. He takes off his spectacles — you hadn't noticed he wore them — and polishes them on a square of chamois, very slowly.
MOTH: "Yes. Two nights ago. After the Warden's third letter." He puts the spectacles back on. "I went to ask for the discharge figures myself. The night man gave me the official log. Fourteen degrees, every hour, for a week. One hand. One ink. Not a blot."
MOTH: "I knew it was false the way one knows a forged signature, Examiner. Instantly. In the stomach." He turns his cup a quarter-turn. "And I did nothing. Because a feeling in the stomach is not a figure, and the Mutual does not act on the stomach of a claims officer."
MOTH: "Please don't enter that either, Clerk."
ILSE: A pause. "...I'll consider it."
@set moth_guilt
@add moth 1
@xp 10
=> bo_talk

== bo_tomasz
MOTH: For the first time since you met him, Perrin Moth is completely still. Not the stillness of a man composing himself. The stillness of a man who has been struck.
MOTH: "Mr. Wick." Very quietly. "He's still out there. On his stool."
@if tomasz_moved
MOTH: "And he's — moved? He's left the hole?" Something in his face you can't read. "Eleven years. What on earth did you say to him?"
@elif seen("fi_leave")
> You tell him what the old man said, as you left: that the answer was always four thousand two hundred.
MOTH: He closes his eyes. "Of course it was." He opens them. "Of course it was. The Tables don't make mistakes. That's their great virtue." He says it like a man repeating a creed he no longer believes and cannot put down.
@endif
MOTH: He looks down at his green book. "He taught me everything. The Tables. The good pen. The column of forty in your head." A pause. "He computed his wife eleven times, Examiner. I told him I'd have done a twelfth. I've regretted it every day for eleven years."
MOTH: "I'll go and see him. Afterward. If there's an afterward."
@add moth 1
@add thaw 1
=> bo_talk

// ---------------------------------------------------------------- the chapel
== cp_ondine
HESPER: "Ondine?" She brightens; this is a question she likes. "A fisherman's daughter from the Narrows. Six hundred years ago, give or take a pope. She fell through the ice at dusk, and under the ice she met the water, and made a bargain with it."
HESPER: "The water said: *you may go back up and live, on one condition. You must remember to breathe. Every breath, on purpose, for the rest of your life. The day you forget, I'll take you back.*"
HESPER: "And she did it. Forty years. Every breath on purpose. She couldn't sleep — you can't breathe on purpose asleep — so she prayed all night and worked all day and never once let herself forget. And then one night, very old, very tired, she sat down by the fire and fell asleep. And stopped."
HESPER: "The doctors still call it that — Ondine's curse — when a child is born who can't breathe unless they remember to. She's the patron saint of people who have to keep doing on purpose what everyone else does without thinking."
KEEL: The six-forty tram. The boiled egg. The long way round the bay. Every breath on purpose, for forty-four years.
* "That's a terrible story." -> cp_ond_terrible
* "What happens if you let yourself sleep?" -> cp_ond_sleep

== cp_ond_terrible
HESPER: "It's a *wonderful* story. Forty years she got. Forty years she wasn't meant to have." She looks at you over the mug. "The Glass loves her. Everyone out here's breathing on purpose, one way or another."
@add thaw 1
=> cp_talk

== cp_ond_sleep
HESPER: She looks at you for a long time, and you have the uncomfortable sense that she can see the four months of shadows under your eyes. "Then the water takes you back, in the legend." A pause. "In life, child, you mostly just wake up. Rested. Surprised." She pats your hand. "Try it. I'll pray."
@add thaw 1
@add hesper 1
=> cp_talk

// ---------------------------------------------------------------- the watch-house
== wa_quiz
PIM: "Would you — sir, would you *test* me? On the Act?" He holds out the Handbook with both hands, like an altar boy with a missal. "Nobody ever tests me. I test myself in the mirror, but I know all the answers, so it's not fair."
* "Section eleven." -> wa_quiz_11
* "Why don't you test me instead?" -> wa_quiz_me

== wa_quiz_11
PIM: He shuts his eyes. "'At the scene of a death under inquiry, the Examiner's word is the Crown's word, and he may seal any room, vessel, street or—'" He stops. Opens one eye. "Or *harbor*." He looks faintly awed. "You could seal the *harbor*, sir."
* "Section thirty." -> wa_quiz_30
* "Correct." -> wa_quiz_ok

== wa_quiz_30
PIM: "Section thirty. Section thirty." He goes red. "Witnesses. It's — witnesses who give evidence against their employer. They're — protected? Until the — the Line?" He peers at you. "Is that right? I always get thirty mixed up with thirty-one, and thirty-one's about *horses*."
=> wa_quiz_ok

== wa_quiz_me
PIM: His face lights up like a lamp. "Sir! Really?" He flips pages frantically. "Section — section nineteen. The disposal of unclaimed remains at sea."
ARCHIVE(9): *"Where no claimant appears within forty days, the Examiner may direct burial at sea beyond the Narrows, with the rites of the deceased's faith if known, and with a lantern if not."* With a lantern if not. You'd forgotten that clause. Someone, a long time ago, thought to put a lantern in the Act.
PIM: "*With a lantern if not!*" He is delighted. "That's the one I always forget! With a lantern!"
=> wa_quiz_ok

== wa_quiz_ok
PIM: He closes the Handbook with reverence. "Thank you, sir. That's — nobody's ever—" He can't finish. "I'm going to pass this spring. I can feel it."
LEDGER: He is not going to pass this spring.
KEEL: It doesn't matter. Look at his face.
@add pim 1
@xp 5
=> wa_talk

// ---------------------------------------------------------------- the Chandelier
== ch_o_icicles
ODILE: She looks up at the great chandelier through the gauze, at the long clear icicles hung among the crystal drops, streaming quietly in the warm air.
ODILE: "Ailo's idea. The first winter, when it was only a tent and a fiddler and a brass lamp with six arms. He came in with one icicle, as long as my arm, and hung it from the lamp, and said, *Now it's ours. Now it belongs to the Glass.*"
ODILE: "Every Thaw Ball since, the Warden brings the icicles. Thirty-four years. From under the eaves of his hut, chosen one by one." She draws on the holder. "This year the cook brought them. From the bathhouse roof." She watches one drip. "They're the wrong ones. Nobody else can tell."
TENDERNESS: She can tell. She's been able to tell every one of the thirty-four years.
@add odile 1
@add thaw 1
=> ch_odile

== ch_benny_song
BENNY: "A tune?" He looks genuinely pleased, like a man offered a chair. "For the Examiner. Right." He considers. "'The Long Freeze.' The old one. My father played it. They don't dance to it anymore, it's too sad for dancing. Too sad for everything, really, except a night like this."
@sfx accordion
> The accordion breathes in. And the old man plays — slow, in a minor key, the melody going up and then stepping down again like someone coming carefully down a flight of icy stairs — and after a while, not looking at you, he sings. His voice is cracked and true.
DOC: *Oh, the Basin lay down in the Long Freeze, / and we built us a town on her breast; / and we danced on the lid of the water / and we laid down our dead in her chest. // Oh, the Basin will wake in the springtime / as the Basin has always done; / and she'll take back the town that we built her, / every roof, every hearth, every one.*
> The last note hangs in the empty hall under the dripping chandelier. A waiter has stopped polishing a glass. He starts again.
BENNY: "My father said you play that one so the ice knows you know." He shrugs, closing the bellows. "Superstition. I play it anyway."
@add thaw 1
@morale 1
@xp 5
=> ch_floor

// ---------------------------------------------------------------- the cutters
== cu_strike
BRAN: "The Long Strike." He settles back like a man lowering a load he's used to. "Forty-one winters ago. Before the Settlement. Before the Mutual. There were Guild Wars on the docks — cutters, lightermen, stevedores against the Houses — and the cutters of the Basin put down their saws in Deepwinter and didn't pick them up for six weeks."
BRAN: "No ice in Aubade. No beer, no fish, no ice for the hospital. The Houses went mad. They hired men from the south — strikebreakers, good men, most of them, hungry men — and put them on the Basin with our saws to cut the harvest."
BRAN: "They cut in the wrong place. Nobody told them where the Warden's flags went, because the Warden was on strike too." He looks at the red letters on the wall. "Twenty-two of them went through on the north field in one afternoon. Twenty-two southern men, strangers, drowned in our Basin cutting our ice."
BRAN: "My father was on the picket line. He went out on the ice to pull them out. He got four." A long breath. "The Settlement came out of that winter. The Houses and the Guilds sat down at a table and wrote the Mutual, so no one would ever again drown in Aubade without somebody paying for it."
BRAN: "So you see, Examiner. The Mutual was born out of this ice breaking. And now it's standing on it with its hands in its pockets."
BAROMETER: Everything in this city comes back to the Basin. Every law, every drawer, every number on the back of every paper. All of it written by people standing on the edge of a hole.
@set knows_strike
@xp 10
=> cu_talk

// ---------------------------------------------------------------- the Works
== wo_q_hilda
QUELL: He goes pink. "Oh. That." He glances out at the great thudding machine. "It's — well. It's my mother-in-law's name. She knocks when she's cold too." He almost smiles. "My wife named them. Hilda and Brunhild. After her mother and her aunt. She said at least this way someone in the family would be reliably warm."
QUELL: "I talk to them because nobody else comes in after ten. It's a long night, a compressor hall. You start to hear things in the rhythm. Hilda has a hitch in her third stroke, like a limp. I know it the way you know somebody's footsteps on the stair."
QUELL: He looks at his hands. "I heard the Basin in her, Examiner. This last fortnight. She's been working twice as hard, and the heat's got to go somewhere, and every time she thuds I think: *that's going under the Glass*." He swallows. "And then I write *fourteen*."
@add quell 1
@xp 5
=> wo_talk

// ---------------------------------------------------------------- Needle Row
== me_fever
MARTA: "The old days." She takes the pins out of her mouth to do it properly. "The fever winter. Ilsie was six. It came over from the city in Deepwinter and it went through the huts like fire through straw, because we were all packed so close."
MARTA: "The Deaconess — she was just Sister Hesper then, a nurse from the Customs hospital — she turned the chapel tent into a fever ward. Forty cots on the ice. And my Ilsie—" she jabs the shears toward her daughter — "sat at the tent door every day with her copybook and wrote down the name of everybody who went in. And everybody who came out. Six years old."
ILSE: "Mother, the Examiner doesn't need—"
MARTA: "She'd come home and read me the lists. *Went in: the Hanssen boy. Came out: the Hanssen boy.* And when somebody didn't come out, she'd write their name very neatly on a separate page, and she wouldn't read that page to anybody." Marta looks at her daughter. "She was keeping the Record for the ones who didn't have one."
ILSE: She doesn't say anything. She has turned her face toward the coats.
TENDERNESS: Things Not Entered. It started there, at six, at a tent door, with the names that needed a page of their own.
@add thaw 1
@add ilse 1
@xp 5
=> me_talk

// ---------------------------------------------------------------- Act III additions
== a3_tomasz
@bg fisher
@title THE MAGISTRATE'S HOLE
@time 30
> Tomasz is still on his stool. The ice around his windbreak is grey and running with meltwater, and the fishing hole has widened to the size of a cartwheel, steaming gently in the rain. He has his rod between his knees and his three coats buttoned to the throat.
TOMASZ: "It's singing, Examiner. I've never heard it sing like this." He sounds delighted. "The Magistrate must be *furious*."
* [LEDGER 8] "Tomasz. Do the valuation. You, on this stool, tonight." -> a3_tom_yes | a3_tom_no
* [SINEW 10] [Pick up the stool, with him on it, and carry him to the blue flags.] -> a3_tom_carry | a3_tom_no
* "Please." -> a3_tom_please

== a3_tom_please
@if tomasz >= 2
=> a3_tom_yes
@endif
TOMASZ: "Please." He considers it with real courtesy. "No. I don't think so. But thank you for asking so nicely. Nobody ever asks the Magistrate *please*."
=> a3_tom_no

== a3_tom_yes
TOMASZ: He looks at the widened hole for a long moment, doing a sum you can see move behind his mended spectacles. "Ninety-one percent," he says at last, quietly. "Before three." He reels in. "Well. The Magistrate has adjourned."
@set tomasz_moved
@xp 15
-> hub3

== a3_tom_carry
> You pick up the stool. He is lighter than his three coats suggested — a small old man made mostly of wool and opinions — and he holds onto his rod and his hat and says nothing at all as you carry him, stool and all, across the grey ice to the nearest blue flag and set him down.
TOMASZ: He looks up at you. "That," he says, "was the most undignified moment of my life." A pause. "Thank you."
@set tomasz_moved
@add tomasz 1
@xp 15
-> hub3

== a3_tom_no
TOMASZ: "Go on, Examiner. You've a town to move." He settles deeper into his coats. "I'll be the one with the rod."
@set tomasz_stays
-> hub3

== a3_gull
GULL: He appears at your elbow as if summoned — cap, scarf, a cone of chestnuts for the road. "Message? Where to?"
* {!f_pim} "The watch-house. Tell Constable Vandersloot the Examiner says: now. Ring it." -> a3_gull_pim
* {!f_quell && (seen("wo_in") || has_logbook)} "The Cold Works. Tell Mr. Quell the Examiner says: open the engine hall." -> a3_gull_quell
* {!f_bran && bran >= 1} "The Cutters' Hall. Tell Brannock Kell the Examiner needs Local Nine on the ice." -> a3_gull_bran
* "Never mind." -> hub3

== a3_gull_pim
GULL: "Watch-house. *Now, ring it.*" He's gone, sliding across the black patches like a stone skipped on a pond.
@set gull_used
@if pim >= 2
> A few minutes later, over the band and the singing ice — harsh and fast, a hammer on a pan — the Break Bell. And a boy's voice going across the Glass, cracking on the high notes: "*Blue flags! Follow the blue!*"
@set f_pim
@sfx breakbell
@else
> He comes back ten minutes later, breathless. "He said he can't. He said he's not you. He's just sitting there with the lantern." Gull scowls. "I told him he was a coward. Sorry."
@endif
-> hub3

== a3_gull_quell
GULL: "The Works. Nine minutes." He's gone.
@set gull_used
@if quell >= 1
> Twenty minutes later, far off on the shore, you see the great doors of the engine hall swing open and a long bar of warm light fall out across the ice.
@set f_quell
@else
> He comes back half an hour later, soaked to the knees. "Dogs," he says, darkly. "And the man in the cardigan said *tell him I can't*."
@endif
-> hub3

== a3_gull_bran
GULL: "Cutters. *Local Nine on the ice.*" He's gone.
@set gull_used
> You hear it before he's back: forty men in oilskins coming out of the Cutters' Hall with planks on their shoulders, singing the Song of the Saw in the rain.
@set f_bran
@set bran_knock
-> hub3

== a3_ball
@bg ballroom
@music ball
@title THE THAW BALL
@time 20
> You walk through the Ball. It is like walking through the inside of a music box that someone has dropped in a bath: gold light, red plush, six hundred people turning, and the chandelier raining meltwater on all of them while the floor grinds underfoot and the band plays louder to cover it.
DANCER: A girl in green, spinning past: "Examiner! Is it true the Warden's under the floor?" She laughs before you can answer. "It's the most romantic thing I've ever heard!"
> By the bar, pink and sweating in an evening coat that fits worse than his towel did, stands Fenwick the actuary from the bathhouse.
@if seen("ba_enter")
FENWICK: He grabs your sleeve. "Examiner. The floor. Do you feel the floor?" He is sober now, very sober, and very frightened. "I've been doing the sums. On a napkin. I keep getting the same number and I don't *like* the number."
@endif
@if knows_lotte
> And near the stage, holding hands with a tall woman in a borrowed fur, a girl of nine in a yellow ribbon, waltzing on her aunt's shoes, counting out loud: *one-two-three, one-two-three*.
HACKLES: Lotte. On the seam. Under the chandelier.
* "Madame — you're Mina? Quell's sister?" -> a3_ball_mina
@endif
* [Leave the floor.] -> hub3

== a3_ball_mina
> The woman in the borrowed fur looks at you in surprise, and then at the silver pin, and then — the way people do — at the girl.
> You tell her, quietly, bending so the child can't hear: her brother sent you. The floor isn't safe. Take her to the Works. There's a warm hall there with an old compressor called Hilda, and her father's waiting.
LOTTE: Tugging at the fur: "Aunt Mina, is it the second waltz? Is it the *Warden's* waltz?"
> Aunt Mina looks at you for one long second. Then she picks the child up, ribbon and all, and walks straight out of the Thaw Ball without her coat.
@set lotte_safe
@add quell 1
@add thaw 1
@xp 15
-> hub3

// ---------------------------------------------------------------- Act IV shore additions
== a4_gull
GULL: He has set his brazier up on the shingle and is selling hot chestnuts to shivering dancers at a price you suspect has been adjusted for the occasion. "Examiner! Free for you." He shoves a cone into your hands. "I carried *eleven* messages tonight. Eleven. I'm going to be a Warden." He looks out at the open water, where the Glass used to be. "Aino says there'll be new ice next winter. She says she'll teach me the seven words."
?{knocked_with_gull} GULL: Quieter: "I knocked again. Three times. When it went down. So he'd know." He looks at you. "You too. I said *two people heard*."
-> a4_shore

== a4_tomasz
@if tomasz_moved
TOMASZ: He is sitting on his folding stool on the Customs House steps, three coats and all, with a queue of people in front of him. "Free valuations," he says as you come up. "I've done forty-one. Every single one of them came out *priceless*." He adjusts his spectacles. "I've clearly lost my touch. It's glorious."
@else
TOMASZ: They brought him in on a floe. Brannock Kell's men, with poles, at a quarter past five: an old man sitting on a folding stool on a slab of ice the size of a dining table, drifting toward the Narrows with his rod between his knees. He is wrapped in six coats now and drinking something from Bran's cup.
TOMASZ: "He bit," he says to you, radiant. "At the very end. When the ice went. I felt him take the line." He holds up the rod: the line snapped clean. "He took the hook and went. Toward the sea." A long, satisfied sigh. "Eleven years. The Magistrate is free."
@endif
-> a4_shore

== a4_saari
> Ma Saari has had the cutters carry the bathhouse stove up the shingle on two planks, and has built a tent of sailcloth around it, and is sitting at the door with her birch whisk.
SAARI: "Anyone who walked off my ice sweats for free," she says. "You walked off it. In." A pause. "No coats. No pin."
?{seen("ba_parl")} > Inside, through the steam, you can hear Oskar and Fenwick and Grandfather Ib arguing about who paid for the Glass. Dagny is laughing at all of them.
@health 1
-> a4_shore
`);
