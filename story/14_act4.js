CANDLE.script(String.raw`
== a4_start
@act "ACT FOUR" "Aubade"
@clock 04:40
@checkpoint
@bg break
@music break
@weather mild
@title THE BASIN — {?quell_diverted|05:12|04:51}
@set body_lost = !body_cut
@if evac == 3
> You are the last one off the blue line. You did not plan that either; it simply happened, the way the last man off a sinking ship is usually the one who was busy counting everyone else. Pim walks beside you with his lantern. Neither of you says anything.
> From the shore, eleven hundred people and a dance band watch the Glass.
@elif evac == 2
> You are on the blue line when it happens, halfway to the shore, with a child on your shoulders who is not yours and whose name you never learn.
@else
> You are at the Chandelier's doors when it happens, shouting, still, at people who have stopped being able to hear you.
@endif
@sfx crack
> It does not crack. That is the first thing everyone will say afterward, for years, in every kitchen in Aubade: *it didn't crack.* There is no great report, no rifle-shot, no warning.
> The Glass simply stops being there.
@insert v_crack
> Along a line as straight as a ruled margin — from the Works on the shore, through the Warden's hut, under the Chandelier and on toward the Narrows — the ice gives up the idea of being a floor. It happens at {?quell_diverted|twelve minutes past five|nine minutes to five}. The candles let go of each other. The sugar goes back to being water.
@sfx bell
> The Warden's hut tips, slowly, like a man bowing, and slides into the black. Its little bell rings once as it goes, by itself.
> And the Chandelier—
> The great pavilion settles into the Basin the way a woman settles into a bath: carefully, and all at once. The sprung floor folds. The red plush walls lean. And the chandelier itself, a haywain of crystal and brass and hundreds of candles, swings once on its chain, very slowly, and goes down into the water still *lit* — turning as it sinks, burning under the black surface for a long, long moment, gold and then green and then gone, like a lantern carried across.
UNDERTOW: There it goes. Across the dark water. Somebody's carrying it.
=> a4_break_after

== a4_break_after
@if evac == 3
> And then silence. Real silence, for the first time all night: the ice has stopped singing, because there is almost no ice left to sing.
> On the shore, eleven hundred people stand in the rain and watch the floes drift out toward the Narrows, dozens of them, carrying huts, carrying lanterns still lit in their windows, turning slowly on the black water like a town going somewhere else without them.
> Nobody was on it. *Not one.* The count is made twice, by Pim and then by Ilse, from the Warden's lists and the Mutual's chart and the cutters' rolls, and both times it comes out the same.
?{!benny_dead} > Somewhere near the fires, an accordion starts up — not a waltz; something slow, an old Rime air — and a few people begin, quietly, to sing along.
@elif evac == 2
> Screams, then. Lanterns in the water. People who took the straight way, across the seam, going in with it.
?{f_bran} > And the cutters of Local Nine — already out on the ice with their planks and poles and line, spread flat like the Warden taught them, like seals — go out after them. Again and again. You watch Brannock Kell go into the water to his chest, holding a pole, and come back with a woman, and go back.
?{!f_bran} > People on the shore run to the edge and lie flat and reach. It is not enough. It is never enough.
> When it's over, and the count is made — twice, by Pim and then by Ilse — {=dead} are missing. Most of them from the Chandelier. Some from the seam.
?{benny_dead} > Benny Twelvetrees was on the stage when the floor went. He had stayed to keep the dancers calm. He was playing the second waltz. He did not stop.
@else
> Screams. Lanterns in the water. Six hundred people on a floor, and the floor going.
?{f_bran} > The cutters of Local Nine are out on the ice already with their planks and poles and line, and they save more than anyone could have hoped — you watch Brannock Kell go into the water to his chest, again and again, until two of his men have to hold him down on the ice, the way five people once held down a Rime boy with a boat-hook.
> It goes on for a long time. When the count is made, twice, by Pim and then by Ilse, {=dead} are missing.
?{benny_dead} > Benny Twelvetrees was on the stage when the floor went. He was playing. He did not stop.
@endif
@if odile_dead
> Odile Castellane was in her gallery when the Chandelier went down. Several people saw her at the rail, in wine-dark silk, looking down at her floor. She did not come down. *You'll be dancing on it, Odile, when it goes.* She had said that was the only way she'd want to go.
@elif !f_odile
> At the last moment — people will argue for years about who saw it — Odile Castellane came down the gallery stair and walked out of her Chandelier through the side door, not hurrying, in wine-dark silk, and did not look back once. She was on the blue line when the floor went.
@endif
@if knows_lotte && evac < 3 && !lotte_safe
> A little girl in a yellow ribbon is carried up the shore by a young cutter called Tammas, wet to the waist, crying for her aunt. Her aunt is behind them. Both of them are alive.
@endif
@if knows_ilse_mother && !marta_safe && !ilse_stays
> Ilse left your side the moment you came down off the bandstand; you saw her running toward Needle Row with her coat open. She came back along the blue line with her mother, both of them soaked to the knee, Marta still complaining about her treadle.
@set marta_safe
@endif
@if ilse_hurt
> Ilse came off Needle Row at the last possible moment with her mother on her back, and at the edge of the seam a hut rolled over as the ice gave, and caught her right hand under its runner. She got her mother to the blue flags anyway. She got herself there. The hand is bandaged now, in a strip of someone's petticoat, and she is holding it against her chest like a bird.
@endif
@if body_lost
> And somewhere in all of it, the Warden of the Glass — under his ice, under his carpet or his ring of lanterns, his hand still raised — went down the seam toward the Narrows with the warm water, the way he always said the ice would go. He was never found.
UNDERTOW: Two men, then. Two men you never got to bury.
@else
> The Warden of the Glass came off the ice on the shoulders of six cutters, under his sheet, with his hand still raised, because the Deaconess would not leave without him and nobody was going to argue with the Deaconess.
@endif
@add thaw 1
-> a4_shore

// ---------------------------------------------------------------- the shore
== a4_shore
@bg shore
@music dawn
@weather none
@title THE SHORE, BELOW THE CUSTOMS HOUSE
@clock 05:40
@hub
> The rain has stopped. The sky over the Narrows has gone from black to the grey of a slate wiped with a wet cloth, and along its lower edge there is a line of something that is not yet colour but is thinking about it.
> Fires all along the shore. People in blankets. Children asleep in handcarts. The smell of wet wool and woodsmoke and, from somewhere, frying onions, because on the Glass somebody is always frying onions.
?{f_quell} > Up the shore, the doors of the Cold Works' engine hall stand open, and the compressors thud inside like the hearts of large sleeping animals, and the hall is full of people lying on the warm iron floor.
+ {!seen("a4_odile") && !odile_dead} [Odile Castellane is standing apart, looking at the water.] -> a4_odile
+ {!seen("a4_bran")} [Brannock Kell is sitting by a fire, steaming.] -> a4_bran
+ {!seen("a4_pim")} [Pim is going from fire to fire with his list.] -> a4_pim
+ {!seen("a4_moth")} [Perrin Moth is sitting on a bollard with his green book closed on his knees.] -> a4_moth
+ {!seen("a4_hesper")} [The Deaconess has set a single lamp on the shingle.] -> a4_hesper
+ {!seen("a4_quell") && f_quell} [Tobias Quell is standing in the doorway of the engine hall.] -> a4_quell
+ {!seen("a4_marta") && (marta_safe || ilse_hurt)} [Marta Varga has set up a mending station on an upturned boat.] -> a4_marta
+ {seen("gu_enter") && !seen("a4_gull")} [Gull has set up his brazier on the shingle.] -> a4_gull
+ {seen("fi_enter") && !seen("a4_tomasz")} [{?tomasz_moved|Tomasz Wick is sitting on his stool on the Customs House steps.|The cutters are bringing something in on a floe.}] -> a4_tomasz
+ {seen("ba_enter") && !seen("a4_saari")} [A tent of sailcloth, breathing steam, on the shingle.] -> a4_saari
+ [Aino is standing at the water's edge, alone, with a folded paper in her hand.] -> a4_aino

== a4_odile
@if f_odile
ODILE: "I don't have a Chandelier." She says it wonderingly, as if trying out a new language. "I have a warehouse full of people drinking my wine at five in the morning. It's the best Ball I ever gave."
ODILE: "The Mutual's man says it's closure by lawful order. They'll pay. Eleven thousand crowns." She laughs. "I'll build a new one. Smaller. On *land*." A pause. "Ailo would have hated it."
@else
ODILE: She doesn't turn. She is still in the wine-dark silk, soaked to the knee, a fur someone gave her round her shoulders. "Thirty-five years." That's all, for a long time. Then: "I walked out. At the end. I heard him say it — *you'll be dancing on it* — and I thought, no. No, you old drunk. Not for you. Not for *anyone*."
@endif
?{danced} ODILE: "You still dance like a man filing a report." She almost smiles. "Come to the new one. I'll teach you."
@add odile 1
-> a4_shore

== a4_bran
@if evac == 3
BRAN: "Not one." He is steaming like a kettle in his wet wool, a tin cup in each hand. He gives you one. It is not tea. "Forty years on this Basin, and I've seen it take men every winter. Not one, tonight." He drinks. "Sarre'd be insufferable."
@else
BRAN: He is sitting very still with a blanket over his head like a cowl, and his hands are shaking, and he doesn't look up. "We got a lot of them," he says. "We got a lot of them out." A long pause. "Not enough. Never enough. He'd have got more."
@endif
?{f_bran} BRAN: "You can put Local Nine in your record, Examiner. On the ice when it went. All forty."
@add bran 1
-> a4_shore

== a4_pim
@if f_pim
PIM: "Sir!" He is hoarse; he has no voice left at all, only a kind of determined whisper. "I didn't know I could shout that loud, sir. My mother heard me from the Customs House. She came down to tell me to stop." He looks at his list. "Blue flags, sir. Everyone who went the blue way made it. *Everyone.*"
PIM: "I'm going to fail the Board again in the spring." Not sadly. "I don't think I mind."
@else
PIM: "Sir." He is going from fire to fire with a list and a pencil, ticking off names in a round careful hand. "I'm — I'm counting, sir. It's the one thing I can do." He doesn't look at you. "I should have rung the bell. Nine days ago. He gave me a reason and I asked for another one."
@endif
-> a4_shore

== a4_moth
@if f_moth
MOTH: "Six and a half million crowns." He doesn't open the book. "Still on the Tables. Every one of them." He looks at the water, at the drifting floes with their little lit windows. "The Mutual will pay Castellane, and the bathhouse, and the eel-woman her cones. Sixty thousand. It's the best money we've ever spent, and nobody will ever thank us for it, which is exactly as it should be."
@else
MOTH: "I'll be paying for the ones who stayed." He has the green book open on his knees, and he is writing names, slowly, in his beautiful hand. "{=dead}. At an average of four thousand." He stops writing. "He asked me for a valuation of the ice. I asked him for better figures." He closes the book. "These are the better figures, Examiner. I'd like them to have been worse."
@endif
@if moth >= 2
MOTH: "The Warden's girl will receive her grandfather's valuation. Whatever you write. There's been a clerical error." He almost smiles. "I've been waiting eleven years to make one."
@set moth_pays
@endif
-> a4_shore

== a4_hesper
@if body_lost
@insert v_lantern
HESPER: She has set a single jar-lamp on the shingle at the water's edge, pointing out toward the Narrows, where the floes are going. "For him," she says. "Since I haven't got him to put it by." She looks up at you. "And for your one, child. I lit him again. I thought he'd want company."
@else
HESPER: The Warden lies on a door on the shingle, under his sheet, with a jar-lamp at his head. The Deaconess sits beside him on her camp stool with her tea. "They carried him off on their shoulders," she says. "Six cutters. He'd have been unbearable about it."
@endif
HESPER: "Whatever you write, child. I'll find a way to bury him right. I've decided I'm not too old to be a heretic after all. It's only paperwork."
-> a4_shore

== a4_quell
QUELL: He is standing in the doorway with his cardigan buttoned wrong, watching his engine hall full of sleeping strangers. Asleep on his coat, in the warmest corner by old Hilda, is a little girl with a yellow ribbon.
QUELL: "She wanted to know whether the waltz counts if you dance it on a floor." He smiles, and it's the first time you've seen him smile. "I told her it counts more."
?{has_logbook} QUELL: "The director arrives on the noon train. I'm going to show him the exercise book with the sailing ship on it. And then I'm going to show it to the papers." He swallows. "Hilda and I will manage."
-> a4_shore

== a4_marta
@if ilse_hurt
MARTA: She is re-bandaging Ilse's hand properly, with clean linen, and her own hands are the steadiest thing on the shore. "Crushed," she says, not looking up. "The two middle fingers. She'll write again. Left-handed, for a while, like her grandmother. She'll hate it."
ILSE: "I'll hate it," Ilse agrees, very quietly.
MARTA: "She came back for me." Now she looks at you. "Forty-four winters I waited for the bell, and my daughter came back for me instead."
@else
MARTA: She has a coat across her knees and pins in her mouth and a queue of people with torn sleeves. "Officially," she says through the pins, very pleased. "Officially mending." She points her shears at you. "You. Your lining held?"
> It did.
@endif
-> a4_shore

// ---------------------------------------------------------------- the letter
== a4_aino
@bg shore
> Aino is standing at the very edge of the shingle, where the black water laps and the first floes knock gently against the stones. She is holding a paper folded in thirds, the coarse grey kind sold for wrapping fish.
AINO: She doesn't look at you. "It's after." She holds it out. "He said after."
@if aino >= 3
AINO: "I didn't read it." A pause. "I held it up to the lamp once. I didn't read it."
@endif
@sfx paper
> You take it. The paper is soft from being carried against a body for a day. You unfold it.
=> a4_letter

== a4_letter
@title A LETTER, ON FISH PAPER
@insert v_letter
DOC: Examiner Marrow,
DOC: If the girl has given you this, then I am the dead man and you are the one who writes the line, and that is right. I have been reading your lines in the *Evening Lamp* for twenty-nine years. You write them clean. I cut them out and keep them in my log with the ice. There are worse places to be kept.
DOC: I will tell you plain, because you are a man who likes things plain.
DOC: The Glass is rotten. Not on top. On top it is sixty centimeters of good black ice, and any fool with an auger will tell you so, and I have been that fool, for money. Underneath it has gone to candles. The Works' pipe puts warm water into the Basin day and night, and the warm water runs under the Glass along a seam, and along the seam the ice is standing on its toes. When the Mild comes it will go all at once. It will go under the Chandelier, because that is where the seam runs, and because God has a sense of humour and it is not a kind one.
DOC: I told Odile. I told the Mutual man. I told the boy constable and the Deaconess. They all know I take money to say safe, so when I said unsafe they thought I wanted more. That is fair. That is the price of a lie. You pay it later, and not in money.
DOC: So tomorrow I am going under to cut a piece of the rot and bring it up and put it on Odile's bar in front of everybody. You can argue with a man. You cannot argue with sugar. The girl will hold the rope. If it goes wrong, she will think it was her. Tell her it was the rope. It will have been the rope.
DOC: And if I do not come up, then a dead Warden under the ice will bring an Examiner, and an Examiner can close the ice. I asked a lawyer once, drunk, what it would take. He laughed. I did not.
DOC: I asked for you because you were the boy.
DOC: Forty-four years ago I pulled you out of the Basin by your collar with a boat-hook, and then I went back for your brother three times and could not find him. I reached you because you were closer. That is the whole truth of it. There was no other reason. You were not better. You were closer. I have watched you all your life try to be good enough to have been reached, and I want to tell you that you can stop. There was nothing to earn. There is nothing to pay back. You have paid it back four thousand times anyway. Stop now.
DOC: One more thing and then I am done. You will want to know whether your brother pushed you up or whether you climbed on him. I have thought about it for forty-four years. From where I was, I could not tell. I have decided that it does not matter. A brother pushes. A drowning boy climbs. *It is the same motion, seen from two sides of the water.*
DOC: Write my line how you want. I trust you. The girl's name is Aino. She is better at the ice than I was. Tell her so. I never did.
DOC: Ailo Sarre, Warden of the Glass.
DOC: *P.S. Good ice sings low. Listen for it. It is the most beautiful sound there is, and I was lucky to hear it for forty-one winters.*
@set read_letter
@clue letter_read The Warden's letter: he meant to come back up with proof. He reached you because you were closer — "there was nothing to earn." A brother pushes; a drowning boy climbs: "the same motion, seen from two sides of the water."
=> a4_chorus

== a4_chorus
> You read it twice. The second time, the sun comes up.
@bg dawn
@title THE BASIN, AT DAWN
> Not all at once: the line along the Narrows goes from grey to rose to a colour like the inside of a shell, and then a single bright bead of gold sits on the water, and then the gold spreads, the way light spreads along a floor when someone opens a door.
LEDGER: Item: there was no reason. Item: there was nothing to earn. Item: the account—
LEDGER: The account is closed. Not paid. *Closed.* For forty-four years you have been making payments on a debt nobody was collecting.
TENDERNESS: *Tell her so. I never did.* He's still worried about her, even in a letter. Even after.
STARCH: Sir. Your face. It's — it's all right. There's nobody here but a girl and the sea. Let it.
HACKLES: ...
HACKLES: Nothing. For once there is nothing coming. You can put your hands down.
BAROMETER: The pressure's rising. The Mild has passed over. Tonight it will freeze again — thin, clear, useless ice, good for nothing but singing low.
UNDERTOW: *The same motion, seen from two sides of the water.*
UNDERTOW: I was on the other side, Aurel. That's all. That's all it ever was.
* "Aino. He says you're better at the ice than he was. He says to tell you. He says he never did." -> a4_tell
* [Fold the letter and put it inside your coat, next to the Office seal.] -> a4_fold
* [Sit down on the shingle. Look at the water for a long time.] -> a4_sit

== a4_tell
AINO: She doesn't move for a moment. Then all of her face goes at once, the way the Glass went — not a crack, not a warning, just everything that was holding stopping holding.
> She cries the way a child cries, with her whole body, standing up at the edge of the water, and you do not know what to do, and then you do: you put your arm round her the way a hut leans on its neighbour in a wind, and she lets you.
AINO: When she can speak: "He never said. Not once. He said I held a drill like a *spoon*."
@set told_aino
@add aino 2
@add thaw 2
=> a4_rope_line

== a4_fold
> You fold it along its old creases, in thirds, and put it inside your coat, against your chest, next to the silver seal of the Inquest Office. It doesn't weigh anything. It weighs more than the seal.
AINO: "What did he say?"
* "He said you're better at the ice than he was. He said to tell you. He never did." -> a4_tell
* "He said it was the rope. Not you. The rope." -> a4_rope_line

== a4_sit
> You sit down on the wet stones, in your mended coat, and look at the water. The floes go out toward the Narrows with the dawn on them. The girl stands beside you. After a while, she sits too.
@add thaw 1
AINO: "What did he say?"
* "He said you're better at the ice than he was. He said to tell you. He never did." -> a4_tell
* "He said it was the rope. Not you. The rope." -> a4_rope_line

== a4_rope_line
@if !knows_rope
AINO: She wipes her face with the rolled sleeve. "The rope." A long breath. "I held it. At three o'clock. I held it and he—" And it comes out of her all at once, on the shore at dawn: the rope round her back, the heels against the stove, the sideways pull, the warm water, three tugs, the slack. "He cut it," she says. "He cut it because I wouldn't let go."
@set knows_rope
@endif
AINO: "It was the rope." She says it to the water, trying it on. "It was the rope."
TENDERNESS: She doesn't believe it. Not yet. It will take years. But she has the sentence now, and it's in his hand, and she can take it out and read it at three in the morning for the rest of her life.
=> a4_verdict_intro

// ---------------------------------------------------------------- the verdict
== a4_verdict_intro
@set moth_pays = moth >= 2
> They come down to the water's edge one by one, without being asked, the way people come to a graveside: the Deaconess with her tea; Brannock Kell with his blanket like a cowl; Pim with his list; Moth with his green book.
?{!odile_dead} > Odile Castellane, in her ruined silk.
?{f_quell || has_logbook} > Tobias Quell, from the engine hall, with his cardigan buttoned wrong.
> They stand in a loose half-circle on the shingle in the new light, and nobody speaks.
@if ilse_hurt
ILSE: She takes out the notebook with her left hand. She opens it on her knee. She holds the pencil in her left fist like a child, awkward, determined. "For the record, Examiner."
@else
ILSE: She takes out the notebook. She opens it to a clean page. She wets the pencil. "For the record, Examiner."
@endif
ILSE: "The Last Line."
ARCHIVE: Misadventure. Self-inflicted. Unlawful killing. Open. The four drawers of the Settlement. Every death in Aubade must go in one of them, so that everyone will know who pays.
?{thought("fifth")} UNDERTOW: And one more drawer. The one you built yourself tonight, on the outside of the cabinet, in your own hand.
=> a4_verdict

== a4_verdict
* "Ailo Sarre died by misadventure, in the course of his duties as Warden of the Glass." -> v_mis
* "Self-inflicted. He cut his own rope." -> v_self
* "Unlawful killing. By the negligence of the Aubade Cold and Light Company." -> v_unl
* "Open. The evidence does not permit a finding." -> v_open
* {thought("fifth") && !fifth_refused} "Ailo Sarre went under the ice to prove it rotten, and cut his own rope so that the child holding it would live. He died in the service of the Glass." -> v_fifth

== v_mis
OBJECTION: He went under on purpose. You know that. But he meant to come back up — the letter says it, the rope says it, the piece of rot in his fist says it. He did not intend to die. Misadventure is... defensible. Barely. It is the kind of true that is also a kindness.
@set verdict = "misadventure"
HESPER: She lets out a breath she seems to have been holding since Tuesday. "The Lantern-ground, then. With the fishermen."
?{!moth_pays} MOTH: He writes, in the green book, a single line. "The Mutual will pay three thousand nine hundred crowns to Aino Sarre, granddaughter." He closes the book. "Misadventure. Correct."
BRAN: "An old drunk who fell in." He says it without heat, to the water. "That's what they'll say." A pause. "He'd have liked that, maybe. Nobody making a fuss."
@set ilse_entered
ILSE: The pencil moves. She reads it back in the Last Line voice, the one that carries: "'...by misadventure, in the course of his duties as Warden of the Glass.'" She looks up. "Entered."
=> a4_after_verdict

== v_self
LEDGER: Literally true. The knife was his; the hand was his; the cut was his.
TENDERNESS: And a lie in every way that matters. He cut the rope so a sixteen-year-old would not be dragged into the Basin after him. *Self-inflicted* will be printed in the *Evening Lamp*, and in forty years that is all anyone will remember.
@set verdict = "self"
AINO: She turns and looks at you. It is the first time tonight she has looked at you like that — the way she looked at the door when you first opened it, with the chisel in her hands. "He cut it for *me*."
HESPER: Very quietly: "Outside the wall, then." She closes her eyes. "I'll dig it myself. On the dark side. I'll put a lamp there anyway, and they can defrock me."
?{moth_pays} MOTH: "The Mutual pays nothing on self-inflicted." He writes something, and crosses it out, and writes something else. "My clerical error stands, Examiner. The girl will be paid."
?{!moth_pays} MOTH: "The Mutual pays nothing on self-inflicted." He writes it in the green book and closes it. "Correct."
BRAN: He spits on the shingle and walks away up the shore without a word.
@set ilse_entered
ILSE: The pencil moves. She reads it back. Her voice doesn't change at all, which is how you know. "'...self-inflicted.'" She closes the book. "Entered."
@add aino -3
@add thaw -2
=> a4_after_verdict

== v_unl
@set verdict = "unlawful"
@if has_logbook
OBJECTION: You have it. The exercise book with the sailing ship on it: thirty-four degrees into a basin that should be at one, for six weeks, and a director who said *write fourteen*. The warm current that dragged him sideways under the ice was theirs. The rot he went down to prove was theirs. Without it, he would never have gone down. It is not the whole truth. It is a truth with teeth.
@else
OBJECTION: With what evidence? A dark stripe on the ice and a warm hand in the water and a cutter's hatred. No log. No figures. The Works' lawyers will have this voided by the end of the month, and your name with it.
@endif
BRAN: He takes off his cap. He doesn't say anything. He doesn't need to; his face is doing all of it.
?{f_quell || has_logbook} QUELL: He is white to the lips. "I'll testify," he says. "I'll bring the book." A breath. "Lotte, forgive me."
?{quell_witness} ARCHIVE: Section thirty. He's a witness, not a party. They can't touch his place until the line is entered — and after it's entered, the papers will have his name, and the papers are harder to dismiss than a night engineer.
MOTH: "The Mutual pays," he says, "and then goes looking, with very great patience, for whoever made it pay." He looks up the shore at the brick chimney. "We have a great deal of patience, Examiner."
@if has_logbook || ilse >= 3
@set ilse_entered
ILSE: The pencil moves. "'...unlawful killing, by the negligence of the Aubade Cold and Light Company.'" She looks up. "Entered."
@else
@set ilse_entered
ILSE: The pencil moves. Then it moves again — a second line, smaller, underneath. She reads them both, in the same flat voice: "'...unlawful killing, by the negligence of the Aubade Cold and Light Company.' Clerk's note: *no evidence entered in support.*"
ILSE: She closes the book. "I'm sorry, Examiner. That's the record."
@endif
=> a4_after_verdict

== v_open
@set verdict = "open"
LEDGER: Technically unimpeachable. Nothing is ever certain. Nobody can prove what a man meant under the ice.
KEEL: You're hiding. You know exactly what happened. You read it in his own hand an hour ago.
HESPER: "Open." She considers it. "Well. It isn't *self*. I can bury him." It isn't gratitude.
?{!moth_pays} MOTH: "Held pending," he says, and writes it. "Indefinitely, in practice. The girl gets nothing until someone reopens it. Nobody ever reopens it."
?{moth_pays} MOTH: "Held pending." He writes it, then adds a small note beside it. "Though there appears to have been a clerical error in the girl's favour."
BRAN: "You had him." Quietly. "You had all of it. And you wrote *nothing*."
@set ilse_entered
ILSE: The pencil moves. "'Open verdict.'" She doesn't look up. "Entered."
@add thaw -1
=> a4_after_verdict

== v_fifth
GRAVITAS: There is no such line. There is no such line in the Inquest Act, or the Settlement, or the Tables, or anywhere in Aubade.
OBJECTION: Exactly.
> The half-circle on the shingle is very quiet. The Deaconess has put down her tea.
@if ilse >= 3
ILSE: She looks at you for a long moment over the notebook. "There's no such line," she says.
ILSE: Then she bends her head and writes it. Every word, in her best hand — {?ilse_hurt|in her left hand, slowly, the letters large and crooked like a child's,|slowly,} the way she wrote your brother's name. When she has finished she reads it back in the Last Line voice, and it carries along the whole shore:
ILSE: "'Ailo Sarre, Warden of the Glass, went under the ice to prove it rotten, and cut his own rope so that the child holding it would live. He died in the service of the Glass.'"
ILSE: She closes the book. "There is now."
@set verdict = "service"
@set ilse_entered
HESPER: "Brightest of all," says the Deaconess, to nobody, and picks up her tea again with both hands.
BRAN: He takes off his cap and holds it against his chest, and does not put it back on.
AINO: She is standing very straight at the edge of the water. She doesn't say anything. She doesn't have to. She is the Warden of the Glass, and a Warden of the Glass is always the last to speak.
@if moth >= 2
MOTH: He opens the green book. Turns pages. Stops. "There's a line in the Tables," he says slowly, "for death in service. Firemen. Lifeboatmen. Soldiers, in the old days." He looks at you. "The Office will void your ruling, Examiner. It'll default to open, and the Mutual will hold it pending forever."
MOTH: "Unless someone in Claims and Valuations *misfiles* it. Under lifeboatmen." A thin smile. "The pension is considerably larger. I'm very good at clerical errors, when I want to be."
@set moth_service
@else
MOTH: "The Office will void it," he says, not unkindly. "It'll default to open. The Mutual will hold it pending." He writes something. "But the *Evening Lamp* will print it. I suspect they'll print it large."
@endif
=> a4_after_verdict
@else
ILSE: She doesn't write. She sits with the pencil above the page for a long moment. Then she shakes her head, very slightly.
ILSE: "I can't." Quietly. "There's no such line, Examiner. The Office will void it, and I'll be the one who typed it, and they'll void me with it." She looks at you. "Give me one of the four. Please."
@set fifth_refused
TENDERNESS: She wants to. She would, for someone she trusted. You haven't given her enough reason to be that someone.
=> a4_verdict
@endif

== a4_after_verdict
=> e_ilse
`);
