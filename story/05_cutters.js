CANDLE.script(String.raw`
== cu_enter
@bg cutters
@music interior
@title THE CUTTERS' HALL — LOCAL NINE
@if seen("cu_enter") > 1
@time 15
=> cu_return
@endif
@time 25
@insert v_saws
@sfx saw
> A long shed on runners, walls of raw plank. Along them, hung on pegs like the jawbones of whales, the great two-handled saws of the ice trade — some taller than a man, their teeth filed bright. Braziers glow at either end. Thirty men with red faces and wet wool steaming off their shoulders sit on crates and benches, and they are singing.
> Painted on the far wall in tall red letters, and painted over in grey, and painted again in red, so that the word has the look of a scar that keeps reopening: UNPRICED.
DOC: *Pull, boy, and let him pull — / never push the steel; / the sea lies down in Deepwinter / and we're the ones who kneel. / One block for the brewer, / one block for the Crown, / one for the man who won't come up / when the Basin lets him down.*
@if bran >= 1
> The song finishes. A big shape at the far end rises from a crate: Brannock Kell, beard thawing, a tin cup in one fist.
BRAN: "Examiner! Make room, lads — make room for the man who wouldn't put a rug on Sarre." A bench is cleared for you with a great deal of scraping. Someone puts a cup in your hand. It is not tea.
@add bran 1
@elif bran < 0
> The song stops halfway through a line. Thirty faces turn toward the door. At the far end, Brannock Kell does not get up.
BRAN: "Look, lads. The carpet man."
HACKLES: Thirty men. Thirty saws on the walls. One door, and you are standing in it.
@else
> The song finishes. At the far end a big shape rises: Brannock Kell, beard thawing, a tin cup in one fist.
BRAN: "Examiner." Neither warm nor cold. "Come in or go out. You're letting the heat go."
@endif
=> cu_talk

== cu_return
> The singing has stopped. The men are sitting closer to the braziers now, talking low. Bran looks up when you come in.
BRAN: "Examiner."
=> cu_talk

== cu_talk
+ {!seen("cu_sarre")} "Tell me about the Warden." -> cu_sarre
+ {!seen("cu_works")} "You blame the Cold Works." -> cu_works
+ {!seen("cu_line")} "What do you want his Last Line to say?" -> cu_line
+ {!seen("cu_night")} "Did anyone see anything last night?" -> cu_night
+ {!seen("cu_block_ok") && !seen("cu_block_f")} [Look at the block of ice on the trestle by the door.] -> cu_block
+ {(has_log || knows_candle || clue("soft_cut")) && !bran_promised} "If the ice goes tonight, will your men help get people off it?" -> cu_help
+ {!seen("cu_strike")} "Tell me about the Long Strike." -> cu_strike
+ [Leave the hall.] -> hub2

== cu_sarre
BRAN: "He measured our fields." Bran sits heavily. "Every cutter in this Basin knows where to put his saw because Sarre put a flag there first. Forty years. He paid his dues to Local Nine in fish, because he said money was for people who trusted it."
BRAN: "He was one of ours. Not a cutter — a reader. But ours."
CUTTER: From a bench: "Couldn't hold his drink."
BRAN: "Couldn't hold his drink," Bran agrees. "Could hold everything else."
=> cu_talk

== cu_works
BRAN: "Three hundred men cut ice in this Basin when I was a boy. Every icehouse in Aubade, every brewery, every fishmonger — ours. Winter's harvest. Then the Aubade Cold and Light Company built a brick box on the shore with ammonia in its guts, and now they *make* ice. In a building. All year."
BRAN: "There's forty of us left." He drinks. "And do you know how they make it? They pump the heat out of their water and into ours. Day and night, through a pipe as thick as this bench, into the Basin." He laughs. "They're making ice by melting ice. Tell me that isn't the whole world in one sentence."
?{pass("LEDGER", 10)} LEDGER(10): Item: refrigeration moves heat; it does not destroy it. Item: the heat has to go somewhere. Item: *somewhere* is under the Glass.
@clue pipe The Cold Works pumps its waste heat into the Basin through a pipe on the shore, day and night.
@task seam Find out what is rotting the ice along the seam.
@xp 10
* "Everything has a price, Kell. Even ice." -> cu_w_act
* "The Mutual should be paying for what's been taken from you." -> cu_w_mut
* "They've broken something older than any company." -> cu_w_hear
* "No one here is a number." -> cu_w_unp
* [Say nothing.] -> cu_talk

== cu_w_act
@align actuarian 1
@add bran -1
BRAN: "Aye. And they've priced us at two thousand one hundred crowns a head." He shows you his papers, the valuation stamped on the back in violet ink. "My saw's worth more than that. The saw, at least, they'd *replace*."
=> cu_talk

== cu_w_mut
@align mutualist 1
BRAN: "The Mutual." He says it like the name of a cousin who borrowed money. "The Mutual pays a widow three thousand crowns and calls it solidarity. Solidarity is a man on the other end of your saw. That's all it ever was."
@thought saw
=> cu_talk

== cu_w_hear
@align hearther 1
BRAN: "Older than the company, aye. Older than the Mutual. My grandfather cut this Basin with a saw his grandfather forged." He looks at the red letters on the wall. "But it wasn't the Hearth-King that looked after us, Examiner. It was the lads."
=> cu_talk

== cu_w_unp
@align unpriced 1
@add bran 2
> The nearest cutters look up. One of them raises his cup to you, slowly, as if not sure whether it's a trick.
BRAN: "Say that louder and they'll paint it on you." He is grinning. "Unpriced. That's what we are, in the end. Not because we're worth nothing. Because we're not *for sale*."
@thought saw
=> cu_talk

== cu_line
BRAN: "Unlawful killing." He doesn't hesitate. "By the Aubade Cold and Light Company. Write that, Examiner, and I'll carry you on my shoulders across the harbor."
BRAN: "Write that, and every paper in Aubade prints it, and the Works pays, and the men who've been lying about that pipe go before a court. Write *misadventure* and it's an old drunk who fell in. Write *self-inflicted* and it's an old drunk who jumped."
* "And if it was none of those things?" -> cu_line_none
* "I write what happened. Not what's useful." -> cu_line_what
* [OBJECTION 10] "You want a martyr, Kell. Not a verdict." -> cu_line_obj | cu_line_obj_f

== cu_line_none
BRAN: He looks at you for a long moment over the rim of the cup. "Then write a fifth." He shrugs his enormous shoulders. "The Settlement wrote four lines. Men wrote them, at a table, with pens. Men can write another."
@if !known("fifth")
@thought fifth
@endif
@add bran 1
=> cu_talk

== cu_line_what
BRAN: "Happened." He snorts. "What happened is forty years of lies about that pipe, and a man who knew the ice better than anyone alive going under it. You tell me which of your four boxes that fits in."
=> cu_talk

== cu_line_obj
BRAN: That lands. He puts the cup down. "Aye," he says at last. "Aye, I do. Because a martyr's the only thing the Works can't buy, and the Mutual can't price, and the papers can't ignore." His voice drops. "And because if Sarre's a martyr, then it *meant* something. And if it meant something, I can sleep."
TENDERNESS: That is the truest thing he has said tonight, and he said it to the floor.
@add bran 1
@xp 10
=> cu_talk

== cu_line_obj_f
BRAN: "I want the truth, Examiner. The truth just happens to have the Works' name on it." He smiles without any humour at all. "Funny how often it does."
=> cu_talk

== cu_night
BRAN: "Night shift was clearing snow on the north field." He nods at two men by the brazier. "Tammas. Dutchman. Tell him."
CUTTER: The younger one, Tammas, wipes his nose on his sleeve. "Ten past three. There was a light under the ice. Moving. Slow — slow as a man walking. From out past the Warden's hut in toward the Chandelier." He swallows. "Green-gold, like. Like a lantern in a bottle."
CUTTER: The Dutchman, older, without looking up: "The Lantern Walker. My mother used to say. The drowned carry their lanterns under the ice till someone lets them up." He crosses himself the Lanternist way, a small circle over the heart.
BRAN: "They went and knocked up the constable. Constable was asleep. Didn't answer."
@set knows_light
@clue light At 3:10 a.m. two cutters saw a light moving under the ice from the Warden's hut toward the Chandelier. They knocked at the watch-house; the constable did not answer.
@xp 10
* [OBJECTION 10] "And you, Kell. What did *you* see?" -> cu_night_obj | cu_night_obj_f
* "Thank you." -> cu_talk

== cu_night_obj
OBJECTION: He said *they* went to the constable. He didn't say where *he* was. A man who likes to be the centre of every story left himself out of this one.
BRAN: He is silent a while. Then, low, so the others don't hear: "Half past three. The Warden's girl. Running across the ice from his hut in her socks, crying so hard she couldn't see. I caught her. She wouldn't say. I took her home and sat outside her door till morning."
BRAN: His hand closes on your sleeve — not hard, but you feel how hard it could be. "You leave the girl out of this, Examiner. Whatever happened, she's sixteen, and she's the only Warden we've got."
@set bran_saw_aino
@add bran 1
@xp 10
=> cu_talk

== cu_night_obj_f
BRAN: "I was asleep, Examiner. Like an honest man." He turns his cup around in his hands. It is empty. He goes on turning it.
=> cu_talk

== cu_block
> A block of Deepwinter ice sits on a trestle by the door, sawn clean, the size of a small trunk. It is the colour of a bottle held to the light.
BRAN: He sees you looking. "Ninety kilos, near enough. It's the test for a new man. Lift it off the trestle and set it down without dropping it, and you can hold a saw in Local Nine." A few men turn to watch. "Sarre could lift one at sixty. Drunk."
* [SINEW 11] [Take off your coat. Lift it.] -> cu_block_ok | cu_block_f
* "I'm not a new man." -> cu_talk

== cu_block_ok
> You hand your coat to someone. You take hold of the block, the cold biting straight through your gloves, and you lift — from the legs, not the back, as the rubble at Sturmhaven taught you — and for one long moment the whole weight of a winter hangs from your arms.
> You set it down. It does not crack. You do not drop it.
> There is a pause. Then thirty men bang their cups on the benches.
SINEW: *There* you are. Forty-four years in a coat, and there you are.
BRAN: He is laughing, delighted, slapping your back hard enough to move a boat. "Put his name in the book, lads! The Examiner of the Third Bench, Local Nine!"
@add bran 2
@thought saw
@xp 15
=> cu_talk

== cu_block_f
> You take hold of the block. You lift. It comes up an inch — two — and then something in your lower back makes a sound like a drawer being slammed, and the block goes down on the trestle with a thud, and you go down on one knee beside it.
@health -1
> Silence. Then thirty men laugh. It is not a cruel laugh. It is the laugh of men who have all done exactly that, and remember it.
BRAN: He hauls you up by the elbow. "You tried," he says, and he says it the way another man might say *you're one of us*. "Most of them from over the water don't try."
@add bran 1
=> cu_talk

== cu_help
BRAN: "Help." He sets down his cup. "Help who? Odile's dancers? The Mutual's clients? The people who've been buying cheap Works ice and letting forty of us starve?"
@if bran >= 3
BRAN: But he's already standing. "Aye. Of course we'll help. We've pulled men out of the Basin before, and they were never all ours." He raises his voice. "Lads! Planks, poles and line. If the Examiner says the ice is going, we're on it before it goes."
@set bran_promised
@clue bran_help Brannock Kell has promised his cutters — with planks, poles and rope — if the ice goes.
@xp 20
=> cu_talk
@endif
* [TENDERNESS 11] "The Warden didn't ask who they were. He just went under." -> cu_help_yes | cu_help_no
* {thought("saw")} "Pull, and let them pull. Never push the steel." -> cu_help_song
* "Think about it." -> cu_talk

== cu_help_song
> You say it quietly. The words of their own song, in the flat Office voice of the Third Bench.
> Bran looks at you for a long moment. Then he nods, slowly, as though you had passed some older test than the block.
=> cu_help_yes

== cu_help_yes
BRAN: "...Aye." He scrubs a hand down his face. "Aye, damn you. Lads — planks, poles and line. If the Examiner says it's going, we're on it before it goes."
@set bran_promised
@add bran 1
@clue bran_help Brannock Kell has promised his cutters — with planks, poles and rope — if the ice goes.
@xp 20
=> cu_talk

== cu_help_no
BRAN: "He went under because nobody listened to him. Where were you then?" He turns back to the brazier. "Come back when you've got something to say that *he* couldn't."
=> cu_talk
`);
