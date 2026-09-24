CANDLE.script(String.raw`
== e_ilse
@bg dawn
@music dawn
@title THE BASIN, AT DAWN
@clock 06:52
> The half-circle breaks up the way such things do — a hand on a shoulder, a word, people drifting back toward the fires and the engine hall and the rest of their lives. Aino goes last. At the top of the shingle she turns round and looks at the open water for a long time, the way a Warden looks at ice.
> Ilse is still sitting on the upturned boat, the notebook closed on her knee. The Office notebook, with the Last Line in it.
> After a while she puts it away inside her coat. And takes out the other one. The small black one, soft at the corners.
@if ilse >= 4
=> e_nb_full
@elif ilse >= 2
=> e_nb_part
@else
=> e_nb_none
@endif

== e_nb_full
ILSE: "You asked whether there was anything in it about you." She opens it near the back. Her hand {?ilse_hurt|— the left one, clumsy with the unfamiliar work — |}turns the pages carefully. "I said yes. I'm going to read it to you. Once. Then it goes back where it lives."
ILSE: "'Aurel Marrow. Examiner. The Fennimore inquest. Fourteenth of October.'"
DOC: Laughed for four minutes at the reading of the Line. It was not disrespect. It was the sound of a man hearing the whole of his own life read out in one sentence by somebody else, and finding it was a comedy. Went out and sat in the snow and wrote a name with his finger. Nobody asked him whose. I should have.
ILSE: She turns a page. "And this morning. I wrote it on the shore, while they were counting."
DOC: *Eighteenth of Thawmonth. The Glass.*
?{went_under && holder == "ilse"} DOC: Went under the ice. Came back up. Four minutes. I held the rope. I lied about the two minutes. I would do it again.
?{went_under && holder != "ilse"} DOC: Went under the ice, the thing he has been afraid of for forty-four years, and came back up with a piece of it in his hand.
?{speech == "keel" && speech_ok} DOC: Said *please* to a room of six hundred people. They went.
?{speech == "decorum" && speech_ok} DOC: Asked a band for the second waltz and walked a town off the ice with it.
?{speech == "tenderness" && speech_ok} DOC: Told a room full of strangers that he had once been pulled out of the water. They listened.
?{speech == "undertow" && speech_ok} DOC: Told them the ice was beautiful, and made them leave it.
?{speech == "gravitas" && speech_ok} DOC: Told them the Crown was sorry about the Ball.
?{speech == "ledger" && speech_ok} DOC: Did arithmetic at them until they walked.
?{!speech_ok} DOC: Stood up in front of all of them and could not make it come out right. Stood there anyway.
?{brother_entered} DOC: Entered his brother into the record. Feliks Marrow, fourteen. Now he's somewhere.
?{danced} DOC: Danced with Odile Castellane. Badly. She was delighted.
?{knelt} DOC: Knelt on the ice at the scene, over the dead man's hand. Nobody said anything. I didn't enter it.
?{told_aino} DOC: Told the Warden's girl the thing the Warden never did.
DOC: He is not a column of figures. He never was. He is a man who was reached, and who has, tonight, begun to reach back.
> She closes the book.
ILSE: "Aurel."
> It's the first time. In six years. She says it the way she read your brother's name back to you — carefully, as though it might break — and then she looks faintly astonished at herself, and then she doesn't.
@set ilse_named
* "Thank you, Ilse." -> e_nb_thanks
* "Enter it." -> e_nb_enter
* [Say nothing. Sit down next to her on the boat.] -> e_nb_sit

== e_nb_thanks
ILSE: "Ilse." She tries it, in your voice, the way Aino tried *Miss Sarre*. "You've never—" She stops. "No. You never have." A pause. "It's fine. It's very fine."
=> e_dawn

== e_nb_enter
ILSE: "No." She puts the black book away inside her coat, close to her body, the way you would carry something alive. "Some things are better not entered. That's what the book is *for*."
=> e_dawn

== e_nb_sit
> The boat creaks. It is cold and wet and the sun is on your faces. Neither of you says anything for a long time. Along the shore, somewhere near the fires, an accordion — or a fiddle, or someone whistling — starts an old slow tune, and stops, and starts again.
=> e_dawn

== e_nb_part
ILSE: "You asked whether there was anything in it about you." She doesn't open it. She holds it closed on her knee, both hands flat on the cover. "There is. From October. I'm not going to read it to you."
ILSE: "It isn't bad." A pause. "It's only — it's only mine. For now." She puts it away. "Ask me again next winter, Examiner."
* "I will." -> e_dawn
* [Nod.] -> e_dawn

== e_nb_none
ILSE: She holds it for a moment. Then she puts it back inside her coat without opening it.
ILSE: "I'm going to ask the Superintendent for a transfer, Examiner." Evenly, the way she reads a docket. "To the Harrowgate bench. It's nothing you did. It's — it's everything you didn't."
ILSE: "Not entered." She stands, and brushes the wet from her coat. "I'll have the Line typed by Monday."
=> e_dawn

// ---------------------------------------------------------------- the knock
== e_dawn
@bg dawn
@music dawn
> The sun is fully up now, low and enormous over the Narrows, laying a road of gold across the open water. The Basin is open for the first time in sixty-one days. Floes drift in it, white and blue and turning, carrying the last lanterns of the Glass out toward the sea, where they will go out one by one, and nobody will need to relight them.
> At your feet, in a sheltered crook of the breakwater where the Mild never reached, a single pane of old ice has survived the night: black, clear, about the size of a door.
BAROMETER: Listen.
> And from under it — very faintly — low. Low and round. Like a cello in another room.
BAROMETER: Good ice sings low.
UNDERTOW: Knock knock.
* "Who's there?" -> e_who
* "Come in." -> e_come
* [Kneel on the stones. Knock back, three times, on the ice.] -> e_knockback
* [Say nothing.] -> e_nothing

== e_who
@set final = "who"
UNDERTOW: *Just me.* A small sound like a laugh, like water. *Just the morning. It's only the morning, Aurel.*
UNDERTOW: *You can stop asking now. You always knew who.*
@add thaw 1
=> e_epilogue

== e_come
@set final = "come"
UNDERTOW: A pause. Then, very softly, as though it had not expected this in forty-four years of asking:
UNDERTOW: *...Oh.*
FELIKS: *Finally.*
FELIKS: *You don't have to keep me under there, you know. I can just be — here. A little to the left of you. Like a brother at a funeral, making faces.* The voice is going quiet — not away; just quiet, the way a voice goes quiet when it has finished saying something it has been trying to say for a very long time. *Go and get some breakfast, Aurel. You're allowed.*
KEEL: For the first time in forty-four years you stand on the shore of the Basin and do not listen for anything underneath it.
@add thaw 2
=> e_epilogue

== e_knockback
@set final = "knock"
@sfx knock
> You kneel on the wet stones — your knees have opinions; you overrule them — and take off your glove, and knock on the black ice with your bare knuckles. Once. Twice. Three times.
> So they know somebody heard.
@sfx sing
> Nothing knocks back. The ice sings its low round note under your hand, and the sun comes along the water and lies on the back of your wrist like a palm.
UNDERTOW: *Nothing knocks back.* Gently. *Nothing needs to. That was always the point, wasn't it. Not that they answer. That somebody knocks.*
@add thaw 2
=> e_epilogue

== e_nothing
@set final = "nothing"
> You say nothing. You stand on the shore with your hands in the pockets of your mended coat and look at the pane of old ice, and after a while the knocking — if it was knocking — stops.
UNDERTOW: *...All right.* No reproach in it. Only patience, forty-four years of it, and more where that came from. *Tomorrow, then. We'll try again tomorrow.*
=> e_epilogue

// ---------------------------------------------------------------- epilogue
== e_epilogue
@bg dawn
@title AFTERWARD
@music dawn
> *Afterward.*
@if evac == 3
> *The Glass.* The night the Glass went down, not one soul was lost. The *Evening Lamp* called it the Miracle of the Basin, which annoyed everyone who had been there, because it had not been a miracle; it had been a great many people doing a great many difficult things in the rain. The Glass was raised again the following winter, a little smaller, a little farther from the Works' shore.
@elif evac == 2
> *The Glass.* The night the Glass went down, {=dead} people were lost. Their names are cut into a stone on the shore below the Customs House, in the Lantern style, each with a small hollow for a candle. On the anniversary, the Glass fills every hollow. The Glass was raised again the following winter, smaller, and more careful, and a long way from the Works' shore.
@else
> *The Glass.* The night the Glass went down, {=dead} people were lost. It was the worst night on the Basin in a century. There was an inquiry, and then another inquiry, and a monument, and a song. The Glass was not raised again the following winter. Or the winter after. People say it will be, one day. People say a great many things on the shore.
@endif
@if verdict == "service"
> *The Warden.* The Office voided the Line within the week; there is no such category. But the *Evening Lamp* printed it on its front page in type an inch high, and by spring someone had painted it on the wall of the Cutters' Hall, under UNPRICED: HE DIED IN THE SERVICE OF THE GLASS. Nobody has painted over it.
?{moth_service} > The Mutual, through a clerical error that was never corrected, pays Aino Sarre a lifeboatman's pension to this day.
@elif verdict == "misadventure"
> *The Warden.* Ailo Sarre's Line reads *misadventure, in the course of his duties*. It is true, in the way that the kindest truths are true: carefully, and not all the way to the bottom. The Mutual paid his granddaughter three thousand nine hundred crowns.
@elif verdict == "self"
> *The Warden.* Ailo Sarre's Line reads *self-inflicted*. In forty years, that is all anyone in the city will remember of him — except on the Glass, where they remember everything, and where nobody has ever once said it aloud.
?{moth_pays} > The Mutual pays nothing on a self-inflicted death. Aino Sarre was paid anyway, owing to a clerical error in Claims and Valuations that nobody has ever been able to find.
@elif verdict == "unlawful"
> *The Warden.* Ailo Sarre's Line reads *unlawful killing, by the negligence of the Aubade Cold and Light Company*.
?{has_logbook} > With the sailing-ship exercise book in evidence, it held. The Works paid; the Mutual collected, with great patience; the outfall pipe was moved a mile down the coast, and the Basin freezes clean again every Deepwinter.
?{!has_logbook} > Without evidence to support it, the Works' lawyers had it set aside by the end of Thawmonth. The pipe still runs. The clerk's note beneath the Line — *no evidence entered in support* — is quoted in law schools as an example of what happens when an Examiner rules with his heart.
@else
> *The Warden.* Ailo Sarre's Line reads *open*. The Mutual holds it pending. It is still pending.
?{moth_pays} > Aino Sarre was paid her grandfather's valuation all the same, owing to a clerical error in Claims and Valuations that nobody has ever been able to find.
@endif
@if body_lost
> His body was never found. The Deaconess keeps a lamp for him on the shore below the Customs House, beside another, older one, for a boy called Feliks. They are the only two lamps on the shore with nobody under them.
@elif verdict == "self"
> He was buried outside the wall, on the dark side. The Deaconess dug the first spadeful herself and put a lamp at his head anyway. The Lantern suspended her for a year. She says it was the best year of her ministry.
@else
> He was buried in the Lantern-ground by the Customs House, with the fishermen, with a lamp at his head. Six cutters carried him. Somebody put a fish in the plate.
@endif
> *Aino Sarre* became the youngest Warden in the Glass's history. The following winter she declared the season open three weeks late, and nobody argued. She keeps his ledger. She holds a drill, people say, nothing at all like a spoon.
@if odile_dead
> *Odile Castellane* went down with her Chandelier. Benny's band played "The Candle Waltz" at the memorial, slowly, and nobody danced, and then — because she would have been furious — everybody did.
@elif f_odile
> *Odile Castellane* took the Mutual's money and built a new dance hall on the shore, on stone, with a sprung floor and a chandelier of plain glass and not a single icicle. She called it *The Warden*. She says it's the ugliest name in Aubade and she won't hear a word against it.
@else
> *Odile Castellane* walked out of her Chandelier with nothing but a wet silk dress. The Mutual declined to pay a voluntary loss. She runs the bar at the Customs warehouse now, and on Thursdays, if you ask her nicely, she will teach you to waltz.
@endif
@if benny_dead
> *Benny Twelvetrees* was not found. On the Glass, the second waltz is never played now until someone has stamped a boot on the floor and said *good ice*.
@else
> *Benny Twelvetrees* played the second waltz at every Thaw Ball for another eleven years, and always, before he began, stamped his boot on the floor and said *good ice*.
@endif
@if !(seen("wo_in") || seen("a3_quell"))
@elif verdict == "unlawful" && has_logbook
> *Tobias Quell* testified. He lost his place by summer, as he knew he would; by autumn the papers had made him briefly famous, and the Harbour Board had made him Inspector of Outfalls. Lotte still waltzes on the kitchen table.
@elif has_logbook
> *Tobias Quell* showed the director the exercise book with the sailing ship on it, and then showed the papers. He lost his place. He found another. Lotte still waltzes on the kitchen table.
@elif f_quell
> *Tobias Quell* kept his place, and his silence, and the engine hall's doors open every winter night after that, for anyone who needs somewhere warm. He never did say what the real temperatures were.
@else
> *Tobias Quell* kept his place and his silence. The pipe still runs. He still writes *fourteen*, and then goes home and writes the real number in an exercise book, for his own conscience, which does not need a book, and gets one anyway.
@endif
> *Brannock Kell* and Local Nine {?f_bran|were on the ice when it went, all forty of them, and are the reason the count was not worse|watched from the shore, and have never forgiven themselves, and never will}. There are thirty-eight of them now. They still sing the Song of the Saw. There is a new verse.
> *Perrin Moth* {?f_moth|was reprimanded by the Great Mutual for withdrawing cover from six and a half million crowns without a board resolution, and promoted the following month for having saved it|went on asking the Tables things}. He made one more clerical error that year, and then no more.
> *Pim Vandersloot* failed the Examiners' Board again in spring. {?f_pim|He was made Constable of the Glass for life instead, which was what he had wanted all along without knowing it. The Break Bell hangs in the watch-house, polished, and has not needed to ring again.|He is still a constable on the Glass. He sleeps very lightly now.}
@if seen("gu_enter")
> *Gull* became the first apprentice to the new Warden of the Glass. He is eleven now. He can hear the ice laughing. He says he could always hear it, and was only being polite.
@endif
@if seen("fi_enter") && tomasz_moved
> *Tomasz Wick* cut a new hole the following winter, a long way from any seam, with a Warden's blue flag beside it. He has not yet caught anything. He has never been happier. Perrin Moth visits him on Sundays and they sit, not speaking, like two men at a very slow play.
@elif seen("fi_enter")
> *Tomasz Wick* was brought in on a floe at a quarter past five, still on his stool, still holding his rod, with the line snapped clean. He maintains to this day that the Magistrate bit at the very end, and swam out to sea, and is free. Nobody has the heart to argue. Perrin Moth visits him on Sundays.
@endif
@if seen("ba_enter")
> *Saari's Steam* was rebuilt on the shore below the Customs House, and the Parliament of the Steam sits there still, in towels, and has not yet reached a verdict.
?{f_paint} > *Dagny* painted her red arrows along the Warden's blue line again the next winter, and the winter after, by request. The Mutual pays her for it. She has not yet decided how she feels about that.
@endif
> *Deaconess Hesper* is still on the Glass, on her stool, with her tea. She has been given forty-two fish.
@if !(met_marta || knows_ilse_mother)
@elif ilse_hurt
> *Marta Varga* mends coats on the shore now, in the Works' engine hall in winter, where it's warm. Her daughter's right hand healed crooked. Ilse writes left-handed. She says it has improved her character.
@elif marta_safe
> *Marta Varga* mends coats on the shore now, in the Works' engine hall in winter, where it's warm. Officially.
@else
> *Marta Varga* still mends coats on Needle Row every winter, and still says she'll leave when the bell rings.
@endif
@if ilse >= 4
> *Ilse Varga* remained the clerk of the Third Bench. That spring she began, in the evenings, to write something that was not a record. She has not said what. It is not entered.
?{ilse_card} > She opened one of her father's cards. One. What it said is not entered either.
@elif ilse >= 2
> *Ilse Varga* remained the clerk of the Third Bench. She types your Last Lines. Once, in autumn, she left a thaw-cake on your desk, wrapped in greaseproof paper, and neither of you mentioned it.
@else
> *Ilse Varga* transferred to the Harrowgate bench in spring. You read her name, sometimes, at the bottom of other Examiners' Lines, and it is always spelled correctly.
@endif
@if verdict == "service"
> *Aurel Marrow* was retired from the Third Bench on a reduced pension for entering a Line that does not exist. The Superintendent said it was the least clean inquest in the history of the Office. He said it with a certain amount of pride, when he thought nobody was listening.
@elif thought("clean")
> *Aurel Marrow* returned to the Third Bench. The Superintendent called it the cleanest inquest he had ever read. It was. You felt almost nothing, writing it. That was the price, and you had decided it was fair.
@else
> *Aurel Marrow* returned to the Third Bench. The Superintendent called it a clean inquest. It was not. It was a great deal better than that.
@endif
@if knows_teapot && thaw >= 3
> On the first Monday after, he went down to the lost-property cupboard on the third floor of the Office, signed for docket twenty-one-oh-six, and carried a brown teapot with a chipped spout home under his arm through the upper town. That evening he wrote a letter three lines long. It is not entered to whom.
@endif
@if thaw >= 5
> He gave up the very clean apartment in the upper town and took two rooms over a chandler's on the harbor front, with a window on the Basin. In Deepwinter, when the Warden says the ice is good, he walks across it — slowly, the straight way, listening. It sings low.
@elif thaw >= 2
> He still lives in the upper town. But in Deepwinter, some evenings, he walks down to the harbor front and stands at the rail above the Basin for a while, listening, before he goes home.
@else
> He still walks the long way round the bay.
@endif
> *Feliks Marrow*, fourteen, is somewhere now. {?brother_entered|He is in the record, in a clerk's best hand.|}{?lit_feliks| He has a lamp on the shore.|} He pushed, or he was climbed upon. It is the same motion, seen from two sides of the water.
-> e_final

== e_final
@bg dawn
> Good ice sings low.
> Listen for it.
@end

// ---------------------------------------------------------------- game over
== go_health
@bg black
@music silence
@title
> Your body, which has been very patient with you for fifty-six years, decides that it has been patient enough. The ice comes up to meet you — not unkindly — and lies against your cheek, and from very close you hear it laughing its high thin laugh.
SINEW: Sorry. Sorry. We tried. You never let us eat.
@gameover "The Body Gives Out" "The Examiner of the Third Bench collapsed on the ice of the Glass, and the night went on without him."

== go_morale
@bg black
@music silence
@title
> You sit down on the ice. It is not a decision. It is simply that there is no longer any reason, that you can find, to be standing up.
> You sit there in your good coat with your hands in your lap while the Glass goes on around you, and the ice sings, and you listen to it, and you do not get up.
KEEL: Aurel. Aurel. Get up.
KEEL: ...
UNDERTOW: Shh. Let him sit. He's tired. He's been tired for forty-four years.
@gameover "You Sat Down on the Ice" "Some nights are too long, and some men have been cold too long. The inquest into Ailo Sarre was completed by another Examiner, the following week."
`);
