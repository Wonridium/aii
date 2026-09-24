CANDLE.script(String.raw`
// Interlude between Act Two and Act Three. Aurel has not slept properly
// since October. For one minute, while the bells ring, he does.

== dr_start
@bg bench
@title A BENCH ON THE ICE
> You sit down — only for a moment, only to let the bells finish — on the old church pew at the edge of the lanterns. Ilse is somewhere behind you, talking to someone. The bells go on counting, cathedral, Customs House, the little parish bells arriving late.
> You have not slept properly since October. You close your eyes, just to rest them from the lamplight.
> You are asleep before the Customs House bell has finished.
@act "INTERLUDE" "A Kitchen at Dusk"
@bg kitchen
@title THE LAMP STAIRS, FORTY-FOUR WINTERS AGO
@clock 23:58
> A kitchen. Small, and warm, and brown the way old kitchens are brown: brown tiles, brown table, a brown enamel kettle ticking on the range. It smells of burnt honey. On the racks by the window, thaw-cakes are cooling in rows, their glaze cracked like spring ice.
> Everything is exactly the right size for a boy of twelve. You are fifty-six, and one metre ninety, and your head brushes the drying-rack on the ceiling, and your knees do not fit under the table.
> At the window, with her back to you, a woman stands looking out at the dusk. A grey dress. An apron. Her hair pinned up the way she pinned it for work at Petrosyan's. Beyond the glass, far off across the Basin, the lights of the Glass are coming on one by one.
UNDERTOW: Oh. Oh, we haven't been here in a long time.
KEEL: It's a dream. You know it's a dream. You can walk through it. You've walked through worse.
* [Say her name.] -> dr_name
* [Look at the table.] -> dr_table
* [Stay where you are, by the door.] -> dr_door

== dr_name
> "Mama." It comes out in your voice — your fifty-six-year-old voice, grey and careful — and it sounds absurd in this room, like a bishop in a nursery.
YOUR MOTHER: She doesn't turn round. "There you are. Where's your brother?"
=> dr_where

== dr_table
> On the table: two plates. Two cups. And a tangle of apron strings, white cotton, tied into knots — a bowline, a sheet bend, a clove hitch, a reef knot — as if someone had been practising, and gone out, and meant to come back to it.
SLEIGHT: Round the tree. Back down the hole. His knots. He left them on the table.
YOUR MOTHER: Without turning: "Don't touch those. Your brother will want them. Where is he?"
=> dr_where

== dr_door
> You stay by the door, with your hand on the frame, the way you stand at the door of every room where something has happened. You have stood at four thousand one hundred and six doors. You know how.
YOUR MOTHER: Without turning: "Don't hover, Aurel. Come in or go out. Where's your brother?"
=> dr_where

== dr_where
* "He's gone ahead. He's on the stairs." -> dr_stairs
* "He's on the ice, Mama." -> dr_ice
* "He's dead. He's been dead for forty-four years." -> dr_dead

== dr_stairs
YOUR MOTHER: "Then go with him. Be back before the lamps." She says it exactly the way she said it that evening — you have heard it on four hundred and some nights — and her hand goes to the window glass. "Be back before the lamps. Both of you."
UNDERTOW: That's the last thing she said to you before. *Be back before the lamps.* And you weren't. Neither of you was.
=> dr_turn

== dr_ice
YOUR MOTHER: Her hand is flat on the window glass. "I know." Very quietly. "I can see you. From here. I can see the two of you on the Narrows, little black shapes, and the ice is grey there. It's grey, Aurel. It's posted. Your father used to light the lamp at the end of it."
=> dr_turn

== dr_dead
YOUR MOTHER: A long silence. The kettle ticks. "Yes," she says at last. "I know. I've been dead twenty years myself. It's a dream, darling. Everybody's dead in it except you."
=> dr_turn

== dr_turn
> She turns round.
> She is younger than you are now. Much younger — thirty-eight, perhaps, with flour on her forearms and the burnt-honey smell in her hair. Her face is the face you have not let yourself see for forty-four years, and it is not angry. That's the first thing. You always thought it would be angry.
YOUR MOTHER: "You've got so tall." She looks at the grey in your beard, the pin on your coat. "And so *tired*. Sit down. Sit down before you fall down."
> You sit at the child's table, knees up, like a man at a doll's tea party. She puts a thaw-cake on the plate in front of you, and pushes the plate an inch closer, the way she always did.
* [Eat the thaw-cake.] -> dr_cake
* "I can't stay long. There's a town on the ice." -> dr_town
* "I'm sorry, Mama." -> dr_sorry

== dr_cake
> It breaks under your teeth like thin ice. Burnt honey, and cardamom, and the whole of being eleven. You eat it in two bites, sitting down, like a boy.
APPETITE: There. There. That's what it tasted of. That's what we've been refusing to taste for forty-four years.
YOUR MOTHER: She watches you eat with her arms folded, satisfied. "Good. You never ate enough. Your brother ate enough for three."
@add thaw 1
=> dr_sentence

== dr_town
YOUR MOTHER: "There's always a town on the ice." She glances at the window, at the far lights. "They build it every winter, and every spring it goes, and every winter they build it again. People are like that. Sit for a minute. The town can spare you a minute."
=> dr_sentence

== dr_sorry
YOUR MOTHER: "What for?" She looks genuinely puzzled. "For being late? You're always late. You're both always late."
=> dr_sentence

== dr_sentence
> She sits down across from you, in Feliks's chair, and looks at you for a long time. And then she begins to say the thing she always began to say. The thing she said once, at this table, a week after, and never finished. The thing you have finished for her every night since.
YOUR MOTHER: "Aurel. It should have been—"
> She stops. As she always stopped. The kettle ticks. Out on the Basin, the lights of the Glass flicker.
LEDGER: Here it comes. The sentence. You know how it ends. You've known for forty-four years. *It should have been you.* Instead of him. The wrong boy came home.
OBJECTION: *Objection.* Hearsay. She never said that. Not once. She stopped after *been*. Every word after that is yours.
* "It should have been me." -> dr_me
* "Finish it, Mama. Please. Just once." -> dr_finish
* [Wait. Let her finish it, for once, without help.] -> dr_wait

== dr_me
> You say it for her. You always have. *It should have been me.* The words fall onto the brown table between the plates like something dropped from a height.
YOUR MOTHER: She stares at you. And then something happens to her face that you have never, in forty-four years of this dream, let it do. It *breaks*.
YOUR MOTHER: "Is that what you — all this time — is *that* what you thought I—" She reaches across the table and takes your face in both her floury hands, hard, the way she held Feliks the night he came home from lighting the Narrows. "*No.* Oh, my darling. No. No."
=> dr_real

== dr_finish
YOUR MOTHER: "Finish it." She looks down at her hands. "I never could, could I. I started it every day for a year and I never once got past *been*."
=> dr_real

== dr_wait
> You wait. You don't finish it for her. You sit at the child's table with your big hands flat on the brown wood and you let the silence go on, for the first time in forty-four years, without filling it.
YOUR MOTHER: She looks at you, surprised, as if you had done something much harder than it seemed. "You waited," she says. "You never used to wait."
@add thaw 1
=> dr_real

== dr_real
YOUR MOTHER: "It should have been dark earlier." She says it to the window. "It should have been *dark* earlier, and you'd both have been home, because I'd have had the lamps lit and you'd have seen them and come running. It should have been a colder winter. It should have been me at that window five minutes sooner."
YOUR MOTHER: "I let you go. *Be back before the lamps.* I said it and I went back to the cakes. I was burning a tray of cakes when the Glass started shouting." Her hands are shaking. "It should have been me, Aurel. That's how it ends. That's how it always ended. *It should have been me who watched.*"
> The kitchen is very quiet. The lights of the Glass flicker far off on the Basin.
TENDERNESS: Forty-four years. She was finishing it the whole time. She was finishing it with *her own* name.
UNDERTOW: Everybody on the ice thinks it was their weight that broke it.
YOUR MOTHER: "It was the *ice*, Aurel." Fierce now, the way she was fierce with the baker when he short-changed her. "It was grey. It was posted. It would have gone under a cat. Not you. Not your dare. Not your brother. Not my window. The *ice*."
* "I've been carrying it all this time." -> dr_carry
* "Then whose fault was it?" -> dr_whose
* [Put your hand over hers.] -> dr_hand

== dr_carry
YOUR MOTHER: "I know. So have I." A small wet laugh. "So has half this city. That Rime boy with the boat-hook. The woman who was frying fish on the Glass and didn't look up. The lamplighter who took your father's route and was late that night, by ten minutes, because his daughter was sick." She shakes her head. "Everybody on the ice thinks it was their weight that broke it. Nobody is heavy enough to break the ice alone."
=> dr_end

== dr_whose
YOUR MOTHER: "Fault." She says the word as if tasting it and finding it gone off. "You sound like your Office. Four drawers. Who pays." She squeezes your hands. "Nobody *pays* for a boy, Aurel. Nobody can. That's why it hurts so much. If somebody could pay, we'd all have paid it, every one of us, and been glad."
=> dr_end

== dr_hand
> Her hand is warm and floury and very small under yours. You had forgotten it was small. In your memory she was enormous.
YOUR MOTHER: She turns her hand over and holds on. "There," she says. "There."
@add thaw 1
=> dr_end

== dr_end
@thought kitchen
> Outside the window, down on the Narrows, a light goes on. Then another. Then another, one after another along the whole curve of the harbor front — thirty-one lamps, from the Customs House to the Narrows — lit by a small figure with a ladder and a long brass pole, moving steadily along the ice-edge in the dusk.
YOUR MOTHER: She is at the window again. "Look," she says softly. "Your brother's doing the lamps."
UNDERTOW: Seven years old. The night Papa fell. He took the pole and the ladder and did all thirty-one.
YOUR MOTHER: "Go on, then." She doesn't turn round this time. "They're waiting for you. Be back before the lamps."
> And the bells —
=> dr_wake

== dr_wake
@bg glass
@title THE GLASS
> — are still ringing. The Customs House bell is only just finishing its twelfth stroke. You have been asleep for less than a minute.
ILSE: She is standing over you, a hand half-raised as if she had been about to touch your shoulder and had thought better of it. "Examiner." A pause. "You were talking again."
* "What did I say?" -> dr_ilse_what
* "I was dreaming. About my mother." -> dr_ilse_mother
* [Get up.] -> dr_ilse_up

== dr_ilse_what
ILSE: "'Be back before the lamps.'" She looks at you. "Not entered."
=> a3_start

== dr_ilse_mother
ILSE: She is quiet for a moment. Then she sits down beside you on the pew — just for a moment; the bells are finishing — close enough that your shoulders touch. "Mine's on Needle Row," she says. "I'm told I should visit more."
@add ilse 1
@add thaw 1
=> a3_start

== dr_ilse_up
> You get up. Your knees are stiff and your face is wet and it is midnight, and on the air, for the first time, there is something that is not cold.
=> a3_start
`);
