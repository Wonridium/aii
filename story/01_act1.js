CANDLE.script(String.raw`
== a1_start
@act "ACT ONE" "The Man Under the Glass"
@bg gate
@music glass
@title THE GLASS — ICE GATE
@clock 20:04
@checkpoint
> The Glass has a gate: an arch of cut ice blocks three men high, with lanterns frozen *inside* them, so that the whole thing glows from within like a mouth full of lit teeth. A banner hangs across it — THAW BALL · TONIGHT · THE CHANDELIER · ALL WELCOME · NO KNIVES.
DECORUM: "No knives." A dance for people who have to be told. You are going to like it here.
> A young man in a constable's greatcoat three sizes too hopeful comes skidding toward you across the ice, one hand on his cap, the other raised in a salute that begins as military and ends somewhere near a wave.
PIM: "Examiner! Your — Examiner, sir! Your Examinence!"
OBJECTION: "Examinence" is not a word.
GRAVITAS: Let him use it. It *should* be a word.
PIM: "Floe-Constable Pim Vandersloot, Glass Watch, sole officer, sir. I sent the wire, sir — it was me." He is out of breath. "I've never sent a wire to the Inquest Office before. I didn't know if I should put 'stop' after every sentence or only the sad ones."
* "Only the sad ones, Constable." -> a1_pim_sad
* "At ease." -> a1_pim_ease
* "Where is he?" -> a1_pim_where

== a1_pim_sad
PIM: He nods, seriously, as if filing it away forever. "Only the sad ones. Stop." He winces. "Sorry. I'm — sorry, sir."
TENDERNESS: He has been waiting at the gate for hours. He is twenty-two and he is the only law on a town of eleven hundred people standing on water, and today one of them died, and he is so relieved to see you that it is coming out of him as nonsense.
@add pim 1
=> a1_pim_fan

== a1_pim_ease
PIM: He attempts to be at ease, which on him looks like a coat hung on a door. "Yes, sir. Easing, sir."
=> a1_pim_fan

== a1_pim_where
PIM: "Right — yes — this way, sir, by the Chandelier's steps, we've put lanterns round him—" He stops. "Round *it*. Round him. I don't know which is correct, sir."
GRAVITAS: Him. Always him. The dead keep their pronouns. That is the first rule and the last.
=> a1_pim_fan

== a1_pim_fan
?{c1 == "REASON"} PIM: "Sir — I have to say — the Tallow Street poisonings. I've read the ruling eleven times. The glaze was on the *outside*!" He says it like a man describing a sunset.
?{c1 == "SOUL"} PIM: "Sir — I have to say — the *Brisk* widows. My aunt was the fourteenth. She still says you were the only one who looked at her like she was a person and not a form."
?{c1 == "FLESH"} PIM: "Sir — I have to say — Sturmhaven. Thirty-one hours. My sergeant at the academy used to shout it at us. 'Marrow did thirty-one hours in the rubble, Vandersloot, and you can't do forty minutes of drill!'"
?{c1 == "NERVE"} PIM: "Sir — I have to say — the bell tower. 'Before or after the closing formula.' We all used to say it at the academy. Before or after. Before or after!" He is nearly bouncing.
?{c1 == "REASON"} LEDGER: A fan. You have a fan. Item: this is unprecedented. Item: it is not unwelcome.
?{c1 == "SOUL"} TENDERNESS: The fourteenth. Grey shawl. She held your hand so hard your ring left a mark on her palm for an hour. You remember.
?{c1 == "FLESH"} SINEW: He is right. You *did* thirty-one hours. He could not. Almost nobody could. Let the body enjoy this.
?{c1 == "NERVE"} STARCH: The collar straightens itself of its own accord. You are the man from the bell tower. You had forgotten you were ever anyone that people said sentences about.
PIM: Then his face does something complicated, as he remembers why you are here. "It's Sarre, sir. Old Sarre. The Warden." He swallows. "He taught me to read the ice when I got posted here. You put your ear to it, he said. Good ice sings low. Bad ice—" He stops.
* "Bad ice what?" -> a1_pim_laugh
* [Wait for him.] -> a1_pim_laugh

== a1_pim_laugh
PIM: "Bad ice laughs, sir." He tries to smile and does not manage it. "It's been laughing all week."
BAROMETER: Under your boots, faint as a thought, something high and thin goes *tik — tik — tikkk* and dies away toward the dark.
HACKLES: Did you hear that. Tell me you heard that.
ILSE: She has stopped walking. She is looking down at the ice as though it had said her name.
=> a1_body

== a1_body
@bg body
@title OUTSIDE THE CHANDELIER
@time 10
> They have ringed the place with lanterns on poles, the way you would ring a hole. A crowd has gathered and stopped, the way crowds do at the edge of things: forty people in scarves standing very still, as if the ice might notice them.
> Beneath the lanterns the ice is black. Not dark — *black*, clear as a window at night, and you can see down into it: bubbles hung like seed-pearls, a drift of old snow frozen mid-fall, and then—
> A face.
> A man of sixty or so, looking up. His eyes are open. His grey hair has floated around his head in a slow crown and frozen there. He lies on his back beneath the ice as if beneath the glass of a museum case, one arm at his side, the other raised: the left hand pressed flat against the underside of the ice, fingers spread, as if he had been caught in the act of knocking.
UNDERTOW: Oh.
UNDERTOW: Oh, there you are.
@task body Examine the man under the ice.
=> a1_exam

== a1_exam
* [Look at his face.] -> a1_face
* [Look at the raised hand.] -> a1_hand
* [Something trails from his waist. Look at it.] -> a1_rope
* [Look at his belt and pockets.] -> a1_belt
* [Look at the ice itself.] -> a1_ice
* "Constable — who found him?" -> a1_found
* [Listen to the crowd.] -> a1_crowd
* [Someone is sitting on a folding stool, not looking at the body. Look at him.] -> a1_moth
+ [Straighten up. You have seen enough.] -> a1_standoff

== a1_face
> Through the ice his face is weathered in the way of men who work outdoors: skin brown-red and folded at the eyes like a map that has been used. A broad nose, broken once, long ago. On his chin, three short tattooed bars, faded blue.
ARCHIVE: Three chin-bars: a Rime-folk ice-reader's marks. One for each lake he learned to read as a boy. Three is a great many. Three is a man who could tell you the weather of the water by the sound of a dropped coin.
TENDERNESS: Look at his expression. Not terror. Not peace, either. Something in between — the face of a man who has just remembered where he left something.
UNDERTOW: His eyes are open because he wanted to see. He went down there to *look* at something.
@clue face The Warden's face is calm, eyes open. Three Rime-folk chin-bars: a master ice-reader.
@xp 5
=> a1_exam

== a1_hand
> His left hand is pressed palm-out against the ice from below, fingers spread. The knuckles of the first two fingers are split and pale.
> He was knocking. Before the cold took the knock out of him, he was knocking.
> For a moment — only a moment — the hand is small. The fingers are a boy's fingers. The water is the Basin at dusk, forty-four winters ago, and your brother—
@if pass("STARCH", 11)
STARCH(11): —*No.* Collar. Chin. You are an Examiner of the Crown standing at a scene. The scene has a hand in it. Hands are evidence. Look at it as evidence.
@else
> You are kneeling. You do not remember deciding to. Your own gloved hand is flat on the ice above his, fingers spread to match, and the crowd has gone quiet in a different way.
@morale -1
@add thaw 1
@set knelt
ILSE: "Examiner." Very quietly. Not a rebuke. A rope, thrown.
> You get up. Your knees are wet. Nobody says anything, which is worse.
@endif
SCRUTINY: The split knuckles are ragged, not clean. Split on something rough. But the underside of good ice is smooth as a plate — ask any fisherman who has lost a hand-line under it.
SCRUTINY: So why is the underside of this ice rough enough to cut a man's hand?
@clue knuckles The Warden's knuckles are split, as if he knocked on rough ice from below. Good ice is smooth underneath.
@xp 10
=> a1_exam

== a1_rope
> From his waist a rope trails away into the black — good hemp line, oiled against the wet, knotted at his belly. It runs off for an arm's length beneath the ice and then simply stops.
SCRUTINY: The end of it. Look at the end. Not frayed. Not chafed through. *Cut* — one clean stroke, the fibres flush as a trimmed cigar.
SLEIGHT(10): And the knot at his waist is a Warden's bowline: a bowline with a slip-tuck, so it can be pulled loose under load. You tie that one yourself, on yourself, so you can get *out* of it. He tied it. Nobody tied it for him.
LEDGER: Item: a man goes under the ice on a rope. Item: someone holds the other end. Item: the rope is cut. Either the man cut it or the one holding it did. There is no third item. Rope does not cut itself.
@clue rope A rope is tied at the Warden's waist with his own knot. The end is cut clean. Somebody held the other end.
@task rope Find the other end of the Warden's rope.
@xp 10
=> a1_exam

== a1_belt
> A leather belt. A ring of iron keys. A tin whistle on a thong. A sheath for a clasp-knife — empty. In the breast pocket, visible through the ice, the brass disc of a watch, its chain floated up like a question mark.
SCRUTINY(8): The face of the watch is turned just enough to read. The hands say twelve minutes past three.
LEDGER: Watches do not stop when men die. They stop when they are wet, or unwound. This one went into the water at three-twelve, or near it. This morning — or last night, depending on what sort of person you are.
OBJECTION: And the sheath. The *empty* sheath. A man goes under with a rope and a knife. The rope is cut. The knife is missing. The prosecution invites you to draw the obvious line between two dots. The defence notes that dots are also where people hide things.
@clue watch The Warden's watch stopped at 3:12. It went into the water then.
@clue sheath The Warden's knife-sheath is empty.
@xp 10
=> a1_exam

== a1_ice
BAROMETER: This ice is not old. Around him it is clearer than the rest: black ice, formed fast and recently, the way water freezes in a still hole on a hard night. He did not fall through here. He *drifted* here, under the sheet, and the cold closed over him like a hand closing a book.
CONJECTURE(10): Picture it. A hole somewhere near, cut square. A lantern going down. A man going down after it — calm, deliberate, like a key into a lock. And then something carrying him under the ice to the steps of the dance hall, where he would be found. Right where he would be *found*.
ARCHIVE: The Basin has no current in winter. Everyone knows this. It is why they can build a town on it.
ARCHIVE: (Hm.)
@clue drift The Warden did not go in here. He drifted under the ice — in a basin that should have no current.
@task hole Find where the Warden went into the water.
@xp 10
=> a1_exam

== a1_found
PIM: "Gull found him, sir. The chestnut boy. At ten past four this afternoon — he was sliding. They slide here, the boys, on the black patches. He slid right over the Warden's face." Pim looks at his boots. "He hasn't stopped shaking. I gave him my scarf."
TENDERNESS: That is why his throat is bare. He has been standing out here for four hours with his throat bare.
PIM: "Sarre was Warden forty-one winters, sir. Drills the ice every morning, marks the safe lines with flags — blue for good, red for keep off. Declares the season open and rings the Thaw Bell when it's over. Nobody builds so much as a privy till the Warden says." A pause. "Said."
* "Did anyone see him go into the water?" -> a1_found_saw
* "Where's your scarf now, Constable?" -> a1_found_scarf
* "Thank you. That's helpful." -> a1_exam

== a1_found_saw
PIM: "No, sir. Nobody's said." He hesitates a fraction too long. "I was — I was asleep, sir. At three. I'm entitled to sleep. It says so in the Handbook. Four hours in twenty-four."
OBJECTION: Nobody asked where *he* was at three. He answered anyway.
@set pim_guilt
=> a1_exam

== a1_found_scarf
PIM: "The boy has it, sir." He touches his bare throat as if only now noticing it. "It's all right. I run warm."
ILSE: She unwinds her own scarf — grey, regulation, unlovely — and holds it out to him without a word. He stares at it. She keeps holding it until he takes it.
TENDERNESS: She did that for you, a little. So that you would not have to.
@add pim 1
@add ilse 1
=> a1_exam

== a1_crowd
> Faces in the lantern light: fishwives, a boy with a brazier of chestnuts and a constable's scarf wound three times round his neck, dancers already in their good coats, two ice-cutters with saws slung over their shoulders like rifles, a woman holding a baby with the tenderness of someone holding a hot dish.
TENDERNESS: Grief, yes. But also something else. Embarrassment. As though they had been told this would happen, and had laughed.
FISHWIFE: Without turning her head: "He was shouting about the ice all week. Drunk as a bell. Said the Glass would go down like a soufflé."
CUTTER: "Said it'd go at the Ball."
FISHWIFE: "Said it every year."
CUTTER: "Every year, for money."
OBJECTION: Note that. *Every year, for money.*
GULL: From the brazier, very small, teeth chattering: "He wasn't drunk yesterday. He was *sad*. It's different. My da's drunk. I know the difference."
@clue shouting All week the Warden warned that the ice would fail at the Ball. Nobody believed him. They say he did it every year, for money.
@xp 5
=> a1_exam

== a1_moth
> A thin man in a grey coat so well cut it looks like an opinion. He sits on a folding stool he has apparently brought with him. He is not looking at the body. He is writing in a small green book, and occasionally consulting a smaller one.
MOTH: "Examiner Marrow." He rises exactly halfway, a courtesy measured to the inch. "Perrin Moth. The Great Mutual — claims and valuations. Please don't mind me. Think of me as weather."
@set met_moth
=> a1_moth_q

== a1_moth_q
* "Why is the Mutual at my scene?" -> a1_moth_why
* "What is he worth?" -> a1_moth_worth
* [OBJECTION 9] "You've already decided what you want me to rule." -> a1_moth_obj | a1_moth_obj_f
* "Do you believe a man can be priced?" -> a1_moth_price
+ [Leave him to his weather.] -> a1_exam

== a1_moth_why
MOTH: "Your scene, Examiner, is also a claim. Every death in Aubade is two things: a sorrow and a sum. You attend to the sorrow. I wait to learn the sum." He turns a page. "We're a good partnership, historically. You never look at my book. I never look at the body."
UNDERTOW: He is lying about that last part. He looked. Once, when he arrived, for exactly as long as it takes to be sure. Then he sat down facing the other way.
=> a1_moth_q

== a1_moth_worth
MOTH: "Ailo Sarre. Warden. Sixty-two. Widower. Chronic drinker — that's a deduction. Forty-one winters working on the ice, which is frankly an actuarial *miracle*." He says it with real admiration. "Three thousand, nine hundred crowns."
MOTH: "Rule misadventure and the Mutual pays that sum to his dependant — a granddaughter, I believe. Rule self-inflicted and the Mutual pays nothing. Rule unlawful killing and the Mutual pays, and then goes looking, with great patience, for whoever made it pay."
ARCHIVE: The four Last Lines of the Inquest Act: Misadventure. Self-inflicted. Unlawful Killing. Open. Every death in Aubade must go in one of the four drawers. The Settlement of forty years ago made it so, so that everyone would know who pays.
@clue valuation The Warden's valuation: 3,900 crowns, payable to a granddaughter if the death is ruled misadventure. Nothing if self-inflicted.
=> a1_moth_q

== a1_moth_obj
OBJECTION: He has a sheet of the Mutual's pink claim forms under the green book. The top one is already half filled in. You can read the box from here, upside down. It says: SELF-INFL.
MOTH: He follows your eyes, and — to his credit — does not move the form. "I fill in the likeliest, Examiner. It saves ink. I've been wrong before." A pause, precisely weighted. "Twice."
MOTH: "He wrote to us, you know. The Warden. Several letters. He wanted the Mutual to *value the ice*." He smiles very slightly. "We don't value ice. We value what stands on it."
@set moth_letters
@clue moth_letters The Warden wrote several letters to the Mutual, asking them to "value the ice". Moth has pre-filled a claim form: SELF-INFLICTED.
@xp 10
=> a1_moth_q

== a1_moth_obj_f
MOTH: "I have decided nothing, Examiner. The Mutual never decides. It only waits for you to." He turns a page as if turning you. "It's very restful. You should try it."
OBJECTION: He is lying. You can't tell about what. That is the worst kind.
=> a1_moth_q

== a1_moth_price
MOTH: He looks genuinely pleased, like a man offered his favourite dish at someone else's table. "Oh, I do more than believe it, Examiner. I *do* it. Every day. What do you believe?"
* "Everything is priced. The price is what makes it fair." -> a1_moth_p_act
* "We price him so his granddaughter can eat. That is what the Mutual is *for*." -> a1_moth_p_mut
* "A man is a lantern, not a ledger." -> a1_moth_p_hear
* "No one is a number. Not him. Not you." -> a1_moth_p_unp

== a1_moth_p_act
@align actuarian 1
@add moth 1
MOTH: "Yes." Softly, as though you had said something tender. "Before the Mutual, a widow got whatever her husband's employer felt like giving her. Now she gets a number. Numbers don't feel like anything, Examiner. That is their mercy."
=> a1_moth_q

== a1_moth_p_mut
@align mutualist 1
MOTH: "A sentimental Mutualist. We have a great many of those in the lower offices. They make excellent clerks and terrible actuaries." He writes something small. "Still. You're not wrong. You're only early."
=> a1_moth_q

== a1_moth_p_hear
@align hearther 1
MOTH: "A Hearther. How restful." He glances, for the first time, down at the face under the ice, and away again. "Lanterns go out, Examiner. Ledgers don't. I know which I'd rather be written in."
=> a1_moth_q

== a1_moth_p_unp
@align unpriced 1
@add moth -1
MOTH: "Ah." He takes it as a man takes a small, cold drop of rain on the back of the neck. "You'll want to be careful saying that on the Glass. The cutters paint it on walls. The Mutual paints over it. It's a very old argument, and we are winning it, and I'd hate for you to be on the ice when it's settled."
HACKLES: Was that a threat. That was very nearly a threat. It was a threat wearing a threat's good coat.
=> a1_moth_q

== a1_standoff
@done body
> A commotion at the Chandelier's steps. Two waiters in white jackets are carrying a rolled carpet between them like a battering ram, and behind them, in a coat of dyed fox that has seen more winters than most of the crowd, comes a woman who is plainly the reason for the carpet.
ODILE: "Examiner. Odile Castellane." She does not offer a hand; she offers a chin. "The Chandelier is mine. The steps you are standing on. The light you are seeing him by."
ODILE: "I've brought the Aurean runner. Thirty feet. Crimson. We lay it from the steps to the gate, and tonight six hundred people walk into my Ball without having to look at a dead man's face on the way in."
DECORUM: Sixty, perhaps. Dancer's posture — you can see it in the way she stands in the fur, as if the fur were a partner she was about to leave. Rouge applied for lamplight, not for daylight. She has done this a very long time.
> And from the other side of the ring of lanterns, the crowd parts for a man built along the lines of a church door: bald, bearded, ice in the beard, a cross-cut saw over one shoulder like a sleeping child. Six men behind him, all with saws.
BRAN: "You'll lay no carpet over him, Odile." A voice like a cellar door. "He's ours. We'll cut him out and carry him to the chapel like a man. We don't leave him under a rug like a wine stain."
ODILE: "Brannock." Not a greeting; a diagnosis.
MOTH: From his stool, not looking up: "Moving remains before the Examiner's preliminary is irregular, of course." A page turns. "Not forbidden. Irregular. I only mention it."
HACKLES: Seven saws. The big one's is the biggest. Every person in the ring of lanterns is now looking at you.
* "Cut him out. Carefully. He goes to the chapel." -> a1_cut
* "He stays where he is. The ice is the scene." -> a1_carpet
* [GRAVITAS 10] "Nobody cuts. Nobody covers. He stays in plain sight until I say otherwise." -> a1_cordon | a1_cordon_f
* [TENDERNESS 9] [Look at Castellane. Really look.] -> a1_odile_look | a1_odile_look_f

== a1_odile_look
TENDERNESS: She will not look down. Everyone else in the ring has looked at the face under the ice; she has not, not once. She is staring at a point just above your shoulder with the concentration of a woman walking a line on a floor.
TENDERNESS: It isn't disgust. You know what disgust looks like. This is someone who cannot afford to see a particular face, because she knows it too well.
@set odile_knew
@clue odile_look Odile Castellane will not look at the Warden's face. She knew him — well.
=> a1_standoff_again

== a1_odile_look_f
TENDERNESS: Fur, rouge, a chin like a bowsprit. A businesswoman with a carpet. That is all you can see, and you have the uneasy feeling that it is exactly what she wants you to see.
=> a1_standoff_again

== a1_standoff_again
* "Cut him out. Carefully. He goes to the chapel." -> a1_cut
* "He stays where he is. The ice is the scene." -> a1_carpet
* [GRAVITAS 10] "Nobody cuts. Nobody covers. He stays in plain sight until I say otherwise." -> a1_cordon | a1_cordon_f

== a1_cut
@set body_cut
@add bran 2
@add odile -1
BRAN: He looks at you for a long moment, as if measuring a block for a cut. Then he nods once. "Right, lads."
ODILE: "Six hundred tickets, Examiner." Very quietly. "Six hundred. I hope you've budgeted for my staff's wages, because I haven't." She turns, fur and all, and goes back up the steps. The carpet goes with her.
> The cutters work the way good workmen do, without hurry and without waste. A rectangle is scored around him with a pick. Then the saws: long, two-handled, a man at each end, pulling in turn — *hunh*, *hunh* — and the blades sing in the ice with a sound like a bowed string.
BAROMETER: Listen to the cut. The top of the ice sings. The bottom of it — the last hand's-breadth before the water — makes no sound at all. It goes through like cake.
> Black water wells up, steaming faintly in the lantern light. Two men kneel with boat-hooks. They bring him up gently, streaming, stiff as a plank. His left arm stays raised. They cannot lower it.
> They carry him away across the ice to the chapel tent with his hand still up — as if he were hailing a cab, or asking a question, or knocking on a door that is not there.
UNDERTOW: He's still knocking.
@if bran >= 2
BRAN: As they pass, he pauses beside you. "You'll find the ice under that cut's rotten, Examiner. Look at the saw blades." He holds one up in the lantern light. The teeth are clean. "Clean saw means soft cutting. Forty years I've cut this Basin. Never had a clean saw in Deepwinter."
@clue soft_cut When the cutters sawed the Warden out, the bottom of the ice cut "like cake". Brannock Kell says the ice is rotten underneath.
@endif
@xp 10
=> a1_letter

== a1_carpet
@set body_carpet
@add odile 2
@add bran -2
ODILE: "Thank you, Examiner." For the first time, something in her face unclenches. "You've no idea what you've spared us."
BRAN: He says nothing for a moment. Then: "Forty-one winters he read this ice for her. For all of you. And he gets a rug." He spits, carefully, *not* on the ice, but on the snow at its edge, which somehow makes it worse. "Right, lads." They go.
> The waiters unroll the Aurean runner across the lantern-lit ice. Thirty feet of crimson wool with a border of gold vines. It covers the face, the crown of hair, the raised hand.
> For a moment you can see the slight rise in the carpet where his knuckles press up beneath it. Then one of the waiters smooths it flat with his foot.
TENDERNESS: The waiter looked sick when he did that. He did it anyway. He has a job.
UNDERTOW: Now he's knocking on the underside of a carpet. That's a new one. That's a new one even for us.
@morale -1
@xp 5
=> a1_letter

== a1_cordon
@set body_cordon
@add bran 1
@add odile 1
GRAVITAS: You do not raise your voice. You lower it. It is an old trick, and the best one: the room leans in to hear you, and once it is leaning, it is yours.
> "This man is under the protection of the Inquest Office until his Last Line is written. He will not be cut out like a block for an icebox. He will not be rolled under a carpet like a stain. The lanterns stay. The rope stays. Madame Castellane's guests may use her side door."
ODILE: A pause, in which the six hundred tickets are visibly weighed against the Crown. "...The side door," she says at last. "Of course, Examiner." She goes. The carpet goes with her.
BRAN: He rubs his beard. Ice falls out of it. "Didn't know they still made them like you." It is not clear whether that is praise.
MOTH: Without looking up: "Very correct, Examiner." Somehow, in his mouth, that is not praise either.
@xp 15
=> a1_letter

== a1_cordon_f
> You begin to speak. You have a fine sentence ready — it has "Crown" in it, and "protection", and a subordinate clause you are particularly proud of.
> Halfway through the subordinate clause, you realise that nobody is listening. The cutters are arguing with the waiters; the waiters are arguing with Castellane; Castellane is arguing with the air. The carpet is already half unrolled.
GRAVITAS: They didn't — they didn't *lean in*. Why didn't they lean in? They always lean in.
BRAN: Over the noise: "Carpet it is, then." He turns away in disgust before you can say otherwise. "Right, lads."
> By the time you finish the sentence, thirty feet of crimson wool lies across the face, the crown of hair, the raised hand. One of the waiters smooths it flat with his foot.
@set body_carpet
@add bran -1
@add odile 1
@morale -1
=> a1_letter

== a1_letter
@bg gate
@title THE GLASS — BY THE LANTERNS
@time 20
> The crowd thins. Behind you the Glass goes back to the business of getting ready for a party. Ilse steps close — close enough that only you can hear.
ILSE: "The irregularity in the docket." She takes out a single sheet folded in thirds, the paper coarse and grey, the kind sold for wrapping fish. "This came to the Office six days ago. It was filed under 'cranks'. When the constable's wire came this morning, the Superintendent had it pulled."
DOC: To the Inquest Office of Aubade. If the Warden of the Glass is found dead this winter, send the Examiner Aurel Marrow. No other. He will understand.
DOC: — A. Sarre, Warden.
UNDERTOW: He knew he would be found dead. He wrote the invitation to his own inquest, and addressed it to you.
ILSE: "Do you know him?"
* "I've never heard the name in my life." -> a1_l_never
* "...I don't know." -> a1_l_dunno
* "Why me? What would I 'understand'?" -> a1_l_why

== a1_l_never
ILSE: "The Superintendent said you'd say that." She folds the letter along its old creases. "He also said you'd be curious. He thinks curiosity is good for convalescence."
=> a1_l_common

== a1_l_dunno
ILSE: She looks at you for a moment longer than the Office requires. "That's a different answer from the one the Superintendent expected."
KEEL: It's a different answer from the one *you* expected. Why did you say it? You don't know him. You have never been on the Glass in your life.
UNDERTOW: That isn't true, is it.
@add thaw 1
=> a1_l_common

== a1_l_why
ILSE: "I was hoping you'd tell me." She folds the letter along its old creases. "I've read four thousand of your Last Lines, Examiner. I type them. I don't know what anyone would *understand* from them, except that you're very thorough."
=> a1_l_common

== a1_l_common
ARCHIVE: The Inquest Act, section eleven. At the scene of a death under inquiry, the Examiner's word is the Crown's word. He may seal a room. A ship. A street. In principle he may seal a harbor.
ARCHIVE: Nobody has ever sealed a harbor.
GRAVITAS: In principle. In principle is where all the best things are kept.
ILSE: "Where would you like to begin?" She is already opening the notebook. "It's just past nine. The Ball starts at midnight."
@task why Find out why the dead man asked for you.
@if !body_cut
BAROMETER: Beneath you, faint and high: *tik — tikkk.* The ice laughing at something only it can see.
@endif
-> a2_start
`);
