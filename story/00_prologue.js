CANDLE.script(String.raw`
== start
@music dream
@bg dream
@title SOMEWHERE UNDER
@clock 19:38
@weather none
@act "PROLOGUE" "Knock Knock"
> There is a surface above you. You cannot see it, but you know it the way you know the roof of your own mouth: it has always been there, and it has always been closed.
> Nothing moves. The dark is not the warm kind. It is the other kind — the kind with a lid.
UNDERTOW: Knock knock.
* "Who's there?" -> pr_who
* [Say nothing.] -> pr_nothing
* "No. Not tonight." -> pr_not

== pr_who
UNDERTOW: You know who. You always know who. That is what makes it a joke — the knowing, and the pretending not to.
UNDERTOW: Listen.
=> pr_knock

== pr_nothing
UNDERTOW: The silent treatment. Forty-four winters of it. You have become very good. They should teach it at the Academy: one lecture, and the lecture is just you, at the lectern, not saying anything for an hour.
UNDERTOW: It doesn't matter. The joke tells itself. Listen.
=> pr_knock

== pr_not
UNDERTOW: "Not tonight." As though there were another night. As though nights came in colours and you could choose one from a drawer.
UNDERTOW: There is only the one night, and it is tonight, and it has been tonight for a very long time. Listen.
=> pr_knock

== pr_knock
@sfx knock
> Knuckles on glass. Three soft knocks — patient, almost polite.
> They come from *underneath* you.
UNDERTOW: There is a hand on the other side. It is small. It has been waiting a long time for someone to open.
KEEL: This is the dream. You know this dream. You have had it on four hundred and some nights, and on every one of them you have woken up. Wake up, Aurel.
* [Put your hand flat against the surface.] -> pr_hand
* "Who is it? Say the name." -> pr_name
* [Wake up.] -> pr_wake

== pr_hand
> You press your palm to it. It isn't glass. It is ice — clear, black, thick as a ledger.
> And it is *warm*.
BAROMETER: That is the wrong part. Of everything here, that is the part that is wrong. Ice should never be warm. Ice that is warm is ice that is thinking about leaving.
> On the other side, very slowly, a small hand rises to meet yours. Five fingers. The tips are white.
THE COLD: hello again, little marrow.
@set pr_touched
KEEL: *Up.* Now.
=> pr_wake

== pr_name
UNDERTOW: If I say it, you'll wake up. You always wake up when someone says it. That is how you have managed — nobody has said it out loud in thirty years.
UNDERTOW: A hint, then. Your mother used to shout it across the harbor at dusk, and it would come back off the ice twice — once for each of you.
KEEL: Enough. Wake.
=> pr_wake

== pr_wake
@sfx jingle
> You wake with the taste of iron in your mouth and a sleigh-bell in your ear.
@thought knock
=> pr_sleigh

== pr_sleigh
@bg crossing
@music wind
@weather snow
@title THE BASIN, AUBADE HARBOR
@clock 19:41
> A hired sleigh, badly sprung. A sky the colour of a bruise that has decided not to heal. Behind you the city of Aubade climbs its hill in tiers of wet lamplight; ahead, across a mile of frozen harbor, a smudge of gold sits on the ice like a coin someone dropped and could not reach.
> Beneath the runners the ice makes a sound you had forgotten you knew: a long, taut hum, like a wire under strain.
BAROMETER: The Basin has been frozen for sixty-one days. The pressure is high and holding. The wind is from the north, as it should be. All is as it should be. (It is not.)
HACKLES: You are on the ice. You are *on the ice*. Forty-four years of walking the long way round the bay, and here you are, sitting on it in a wooden box pulled by a horse with opinions.
@sfx pencil
> Beside you sits a woman who has not moved in twenty minutes. Clerk's gloves with the fingertips cut away for writing. Dark hair pinned with the Office's regulation severity. A leather notebook shut in her lap like a small sealed room.
ILSE: "Examiner. You were talking."
* "What did I say?" -> pr_s_what
* "I was not talking. I was dictating." -> pr_s_dict
* "Where are we?" -> pr_s_where

== pr_s_what
ILSE: "'Who's there.' Twice. Then something about your hand." She taps the closed notebook with one bare fingertip. "Not entered."
TENDERNESS: She could have entered it. Everything the Examiner says in transit is, technically, on the record. She chose not to. She chooses a great many things, quietly, that nobody ever sees her choose.
=> pr_s_common

== pr_s_dict
ILSE: "Dictating." She considers this with the whole of her face, which is to say barely at all. "Your dictation was 'who's there', twice, and then 'it's warm'."
ILSE: A pause exactly one breath long. "Not entered."
STARCH: Excellent. Now she thinks you are mad *and* a liar. Collar up, sir. Chin down. Look at the horse. Everyone trusts a man who looks at a horse.
=> pr_s_common

== pr_s_where
ILSE: "Halfway across the Basin." She does not point; she tilts her head a single degree toward the gold smudge. "That's the Glass."
=> pr_s_common

== pr_s_common
ARCHIVE: The Glass: Aubade's winter quarter. Every year, when the Basin freezes past a hand's depth, the city's poor, its fishermen, its dancers and its hopeful drag their houses out onto the ice on runners and build a town there. Bathhouses. A chapel in a tent. A dance hall with a chandelier the size of a haywain. When the Warden of the Glass rings the Thaw Bell in spring, they drag it all back again.
ARCHIVE: Population this winter: eleven hundred and some. First raised in the winter of the Long Freeze, by herring-wives who were tired of walking round.
UNDERTOW: A city that exists only for as long as the water agrees to be a floor.
ILSE: "Before we arrive, the Office requires the docket read aloud. Preamble, particulars, commendation." She opens the notebook. "It's a formality. You can stop me."
* "Read it." -> pr_docket
* "Must you?" -> pr_docket_must

== pr_docket_must
ILSE: "Protocol nine. If an Examiner dies at the scene, the docket establishes that he was the right one."
LEDGER: That is not what protocol nine says. Protocol nine concerns the labelling of jars.
HACKLES: *If an Examiner dies at the scene.* Why would she say that. Why would anyone say that, on the ice, at night.
ILSE: "That was a joke." She turns a page. "The Office discourages them. I find they help with the cold."
@set ilse_joked
=> pr_docket

== pr_docket
ILSE: "Docket four-four-one-seven. Summons of the Inquest Office of Aubade to the Examiner of the Third Bench, Aurel Anselm Marrow—"
> The horse snorts. Somewhere under you the ice ticks like a cooling stove.
ILSE: "—fifty-six years of age, twenty-nine years in service. Four thousand one hundred and six Last Lines entered." She glances up. "That's the most on the Bench."
GRAVITAS: It is the most on *any* bench. There are Examiners in the southern provinces who will die having written half as many. Four thousand one hundred and six deaths, each given its correct form. You are a cathedral of correct forms.
ILSE: "For the preamble I read one commendation from your file. The Office leaves the choice to the Examiner." A pause. "There are several."
* "The Tallow Street poisonings." -> pr_c_reason
* "The widows of the *Brisk*." -> pr_c_soul
* "The Sturmhaven collapse." -> pr_c_flesh
* "The bell-tower inquest." -> pr_c_nerve

== pr_c_reason
@attr REASON 2
@set c1 = "REASON"
ILSE: "'...for reasoning of a clarity the Bench has rarely seen, in establishing that the eleven deaths on Tallow Street, previously ascribed to the winter fever, were in fact the work of a single baker and his arsenical glaze.'" She looks up. "You were thirty-one."
LEDGER: The glaze was on the *outside* of the buns, where the children licked first. Nobody else noticed that the dead were all children and the mothers who ate the leftover crusts were only ill. It was the simplest arithmetic in the world. It is always the simplest arithmetic in the world.
=> pr_second

== pr_c_soul
@attr SOUL 2
@set c1 = "SOUL"
ILSE: "'...for a manner with the bereaved that made the unbearable briefly bearable, when the trawler *Brisk* went down with thirty-two hands and the Examiner sat with each widow in turn, through the night, until each had been told her husband's Last Line in a form she could carry.'"
TENDERNESS: You remember the ninth widow best. She asked whether he had been afraid at the end. You told her no. It was a lie — they are always afraid at the end — and it is the only lie you have ever told on the record, and you have never once regretted it.
=> pr_second

== pr_c_flesh
@attr FLESH 2
@set c1 = "FLESH"
ILSE: "'...for a constitution that shamed younger men, when at the Sturmhaven tenement collapse the Examiner remained in the rubble thirty-one hours without rest, identifying the dead by hand, so that none should be buried under a wrong name.'"
SINEW: Thirty-one hours. You carried a door down four flights on your back with a woman lying on it. You were forty. You had shoulders. You still have them — you just keep them folded, like a letter you do not intend to send.
=> pr_second

== pr_c_nerve
@attr NERVE 2
@set c1 = "NERVE"
ILSE: "'...for a composure that did not waver when, at the bell-tower inquest, the widower produced a pistol, and the Examiner, without rising, completed the reading of the Last Line and then asked him whether he intended to fire before or after the Office's closing formula, as the formula was short.'"
STARCH: He fired after. Into the ceiling. You finished the formula. It was the proudest moment of your life, and your collar has never been the same.
=> pr_second

== pr_second
ILSE: "The docket allows one further note of merit."
* {c1 != "REASON"} "An exceptional memory for statute." -> pr_n_reason
* {c1 != "SOUL"} "Patience with witnesses." -> pr_n_soul
* {c1 != "FLESH"} "An ability to work without food, heat or sleep." -> pr_n_flesh
* {c1 != "NERVE"} "A steady hand at the post-mortem table." -> pr_n_nerve

== pr_n_reason
@attr REASON 1
@set c2 = "REASON"
ILSE: "Noted." The pencil moves. "The Superintendent once said you could recite the Inquest Act backwards. I assumed he meant it as a compliment."
=> pr_reprimand

== pr_n_soul
@attr SOUL 1
@set c2 = "SOUL"
ILSE: "Noted." The pencil moves. "You once waited four hours for a ferryman to finish crying before he'd say his name. I was there. I ran out of ink."
=> pr_reprimand

== pr_n_flesh
@attr FLESH 1
@set c2 = "FLESH"
ILSE: "Noted." The pencil moves. "I have never seen you eat. I've assumed it happens in private, like prayer."
=> pr_reprimand

== pr_n_nerve
@attr NERVE 1
@set c2 = "NERVE"
ILSE: "Noted." The pencil moves. "Doctor Hask says you close a wound more neatly than he does. He says it resentfully, which is how I know it's true."
=> pr_reprimand

== pr_reprimand
ILSE: "And one reprimand. The docket requires one. If you don't choose, I'm obliged to use the most recent."
* {c1 != "REASON" && c2 != "REASON"} "The weathervane." -> pr_r_reason
* {c1 != "SOUL" && c2 != "SOUL"} "The complaint from the Harrowgate family." -> pr_r_soul
* {c1 != "FLESH" && c2 != "FLESH"} "The Grayling exhumation." -> pr_r_flesh
* {c1 != "NERVE" && c2 != "NERVE"} "The seal. And the grave." -> pr_r_nerve

== pr_r_reason
@attr REASON -1
ILSE: "'...for eccentric leaps of inference, including the naming of a weathervane as a material witness.'"
CONJECTURE: It *was* a material witness. It had been turned to point at the killer's window. You were right about everything except that weathervanes cannot testify.
=> pr_fennimore

== pr_r_soul
@attr SOUL -1
ILSE: "'...for a coldness toward the families of the deceased that has occasioned formal complaint.' The Harrowgate son said you looked at his mother 'as though she were a column of figures'."
KEEL: She was screaming. You did not know what to do with your face, so you did nothing with it. That is not coldness. But it looks exactly like coldness, from the outside, and the outside is where everyone else lives.
=> pr_fennimore

== pr_r_flesh
@attr FLESH -1
ILSE: "'...for fainting at the Grayling exhumation.' Twice, it says. Then, in a different hand: 'The second time into the grave.'"
SINEW: It had been raining for a week. The ground was soft. You would like it entered that the ground was *very* soft.
=> pr_fennimore

== pr_r_nerve
@attr NERVE -1
ILSE: "'...for dropping the Office seal into an open grave during the committal, and for the manner of its retrieval.'"
SLEIGHT: The manner of its retrieval was *excellent*. One hand, one knee, no witnesses who were not already weeping. It's the dropping that let you down.
=> pr_fennimore

== pr_fennimore
ILSE: "There is one more entry. Dated this autumn." She does not read it yet. Her thumb rests on the page. "The Fennimore note."
STARCH: Do nothing with your face. Your face is a closed office. There is a card in the window. The card says CLOSED.
* "Read it. It's the record." -> pr_fen_read
* "Skip it." -> pr_fen_skip

== pr_fen_read
ILSE: She reads it exactly as she read the others, which is a kindness of a kind. "'Examiner Marrow is returned to the Bench at the Superintendent's discretion, following a period of rest occasioned by an incident at the Fennimore inquest, the details of which are not entered.'"
ILSE: She closes the book. "That's all it says."
OBJECTION: A strange phrase for an official record. "Not entered." Records do not usually confess that they are missing something. Somebody *chose* to leave it out.
@add ilse 1
@set fen_read
=> pr_sig

== pr_fen_skip
ILSE: "Skipped." She turns the page with her thumb, and something in her jaw settles, the way a boat settles when a man sits down in it. "It doesn't say much anyway."
TENDERNESS: She was relieved. Not for her sake. For yours.
@add thaw -1
=> pr_sig

== pr_sig
ILSE: "Last item. 'Distinguishing practice of the Examiner, for identification at the scene.' Most write a pipe, or a limp." She waits, pencil ready. "What do they call you, in the Office?"
* {c1 == "REASON" || c2 == "REASON"} "The Abacus." -> sig_LEDGER
* {c1 == "REASON" || c2 == "REASON"} "The Footnote." -> sig_ARCHIVE
* {c1 == "REASON" || c2 == "REASON"} "The Magistrate's Knife." -> sig_OBJECTION
* {c1 == "REASON" || c2 == "REASON"} "The Novelist." -> sig_CONJECTURE
* {c1 == "SOUL" || c2 == "SOUL"} "The Sleepwalker." -> sig_UNDERTOW
* {c1 == "SOUL" || c2 == "SOUL"} "The Confessor." -> sig_TENDERNESS
* {c1 == "SOUL" || c2 == "SOUL"} "The Lighthouse." -> sig_KEEL
* {c1 == "SOUL" || c2 == "SOUL"} "The Bishop." -> sig_GRAVITAS
* {c1 == "FLESH" || c2 == "FLESH"} "The Gourmand." -> sig_APPETITE
* {c1 == "FLESH" || c2 == "FLESH"} "The Nervous Horse." -> sig_HACKLES
* {c1 == "FLESH" || c2 == "FLESH"} "The Weathervane." -> sig_BAROMETER
* {c1 == "FLESH" || c2 == "FLESH"} "The Ox." -> sig_SINEW
* {c1 == "NERVE" || c2 == "NERVE"} "The Loupe." -> sig_SCRUTINY
* {c1 == "NERVE" || c2 == "NERVE"} "The Collar." -> sig_STARCH
* {c1 == "NERVE" || c2 == "NERVE"} "The Dancing Master." -> sig_DECORUM
* {c1 == "NERVE" || c2 == "NERVE"} "The Conjuror." -> sig_SLEIGHT

== sig_LEDGER
@sig LEDGER
LEDGER: Because you once corrected the Office's quarterly accounts during a funeral. The sums were wrong. The funeral was not yours to correct.
=> pr_sig_done
== sig_ARCHIVE
@sig ARCHIVE
ARCHIVE: Because every ruling you write has a footnote, and three of them have footnotes to their footnotes, and one — the Bellweather case — has a footnote that is longer than the ruling. It is a very good footnote.
=> pr_sig_done
== sig_OBJECTION
@sig OBJECTION
OBJECTION: Because at the Carrow inquest you let a witness talk for forty minutes and then asked him one question, and he sat down and did not stand up again for some time.
=> pr_sig_done
== sig_CONJECTURE
@sig CONJECTURE
CONJECTURE: Because your reconstructions read like chapters. "The candle had burned to the height of a thumb when she opened the door." You were right about the candle. The Bench asked you to stop describing her dress.
=> pr_sig_done
== sig_UNDERTOW
@sig UNDERTOW
UNDERTOW: Because you walk the scene with your eyes half closed, and you stop in places for no reason, and the places are always where it happened. They find this unsettling. So do you.
=> pr_sig_done
== sig_TENDERNESS
@sig TENDERNESS
TENDERNESS: Because people tell you things. They don't mean to. They sit down in front of the tall grey man with the silver pin and they hear themselves saying the thing they came in determined not to say.
=> pr_sig_done
== sig_KEEL
@sig KEEL
KEEL: Because in twenty-nine years you have never once failed to arrive. Storm, strike, fever, fire. The Examiner comes. Whatever else you are, you are a man who comes.
=> pr_sig_done
== sig_GRAVITAS
@sig GRAVITAS
GRAVITAS: Because when you enter a room, conversations lower themselves respectfully to the floor. Because you once silenced a brass band by clearing your throat. Because it is correct.
=> pr_sig_done
== sig_APPETITE
@sig APPETITE
APPETITE: Because there is always something in your coat pocket wrapped in greaseproof paper, and because you once identified a poisoner by the smell of the almond cake he'd been eating, which you then finished.
=> pr_sig_done
== sig_HACKLES
@sig HACKLES
HACKLES: Because you flinch at doors. Because you sit facing the exit. Because you have been right, three times now, about the man with his hand in his coat.
=> pr_sig_done
== sig_BAROMETER
@sig BAROMETER
BAROMETER: Because you know when it will rain. Because you once postponed an exhumation by a day and the next morning the cemetery slid into the river. Because your knees are wiser than the Office's almanac.
=> pr_sig_done
== sig_SINEW
@sig SINEW
SINEW: Because you once carried a coffin alone, up a hill, because the bearers were drunk and the widow was watching. It was not a small coffin. It was not a small hill.
=> pr_sig_done
== sig_SCRUTINY
@sig SCRUTINY
SCRUTINY: Because you notice the button. Always the button. The missing one, the wrong one, the one sewn on in a different thread. Eleven convictions, by buttons.
=> pr_sig_done
== sig_STARCH
@sig STARCH
STARCH: Because your collar has never once been seen to wilt, not at the fever pits, not at the Sturmhaven rubble, not at the bell-tower. Because you are the only Examiner who irons his handkerchiefs *at the scene*.
=> pr_sig_done
== sig_DECORUM
@sig DECORUM
DECORUM: Because you bow to the bereaved at precisely the right depth, and remove your hat at precisely the right moment, and because a duchess once said you delivered her husband's Last Line "like a man asking her to dance".
=> pr_sig_done
== sig_SLEIGHT
@sig SLEIGHT
SLEIGHT: Because the evidence is in your pocket before anyone sees you pick it up. Because you can tie a surgeon's knot in a moving carriage. Because of the business with the Superintendent's watch, which was *returned*.
=> pr_sig_done

== pr_sig_done
@resethp
ILSE: She writes it down without comment, closes the notebook, and fastens its strap. "Docket read."
> YOUR FILE is complete. You can open it at any time to see the Examiner's skills — the sixteen voices that will speak up tonight, whether you want them to or not.
=> pr_approach

== pr_approach
> The gold smudge has become a town. Roofs of tarred canvas and salvaged tin. Stovepipes breathing into the dark. Strings of paper lanterns slung between masts. At its centre a great pavilion glows like the inside of a seashell, and through its glazed roof you can see a chandelier so large it seems to be the thing holding the building up.
BAROMETER: Eleven hundred people, and every one of them trusting sixty centimeters of frozen water with their sleep.
ILSE: "The Superintendent asked me to tell you something before we arrive." She says it the way you would read a label on a bottle. "'One clean inquest, Marrow. One. Then we'll talk about your pension.'"
* "Noted." -> pr_clean_a
* "And if it isn't clean?" -> pr_clean_b
* "Did he say anything else?" -> pr_clean_c

== pr_clean_a
ILSE: "Noted," she agrees.
=> pr_clean_end

== pr_clean_b
ILSE: "He didn't say." She considers it. "I imagine we'd talk about your pension anyway, but in a different tone of voice."
=> pr_clean_end

== pr_clean_c
ILSE: "He said the sea air would be good for you." She looks out at a mile of ice without a single wave on it. "I didn't correct him."
=> pr_clean_end

== pr_clean_end
@thought clean
ILSE: "There's also an irregularity in the docket." She puts the notebook away inside her coat, close to her body, the way you would carry something alive. "I'll show you after the scene. You should see him first."
HACKLES: *Him.* The dead man. You are going to look at a man under the ice. You knew this. You have known it since the wire came this morning. Your hands knew it before you did; they have not been warm since.
=> a1_start
`);
