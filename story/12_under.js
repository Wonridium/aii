CANDLE.script(String.raw`
== un_prep
@bg hut
@music interior
@title THE WARDEN'S HUT
@time 20
> The hut again. The square of new ice in the floor has gone grey and soft; meltwater stands on it in a shallow film that trembles every time the Basin sings.
@if a3_aino_no_flag || seen("a3_aino_no")
> The girl is gone. The chisel is gone. The bell rope hangs in the dark, unrung.
@set no_aino
@else
AINO: She is there, by the bell rope. She looks at you, and at the hole, and understands before you say anything. "No." Then: "...You want to see it. From underneath."
@endif
HACKLES: No. No no no no. Absolutely not. Forty-four years of walking the long way round the bay and you are going to *get in*? You are going to go *under*? We will not. We refuse. The body refuses. The body is *leaving*.
KEEL: Listen to it. It's right to be afraid. Being afraid is not the same as being wrong, and it is not the same as being right.
UNDERTOW: You've been under the ice every night for forty-four years. The only difference is that tonight you'd come back up with something in your hand.
* "Yes. I want to see it from underneath." -> un_prep_2
* "...No. I can't." -> un_cant

== un_cant
KEEL: That's allowed. You are allowed to not go into the water. Nobody who has been in it once owes it a second visit.
UNDERTOW: Of course. Of course. We'll wait. We're very good at waiting.
@add thaw -1
-> hub3

== un_prep_2
@if no_aino
@sfx chisel
> There is no one to open the hole. You find the Warden's second chisel in the rack by the flags, heavy as a crowbar, and go down on your knees on the wet planks.
* [SINEW 9] [Break the ice open.] -> un_hole_ok | un_hole_hard
@else
AINO: She takes the long chisel from the wall without another word, and kneels, and in six hard strokes breaks the grey skin of the hole. Black water wells up. It steams, very faintly, in the lamplight.
=> un_rope
@endif

== un_hole_ok
> Six strokes. Seven. The grey skin breaks, and black water wells up, steaming very faintly in the lamplight.
=> un_rope

== un_hole_hard
@sfx crack
> It takes twenty strokes, and your shoulders are screaming, and you split a knuckle on the ninth, and at the end of it the grey skin breaks and black water wells up, steaming very faintly in the lamplight.
@health -1
=> un_rope

== un_rope
@if ilse_stays
@if no_aino
@sfx door
> There is no one to hold the rope. You look at the coil by the stove. Then the door opens, and Brannock Kell ducks in out of the rain, soaked to the beard.
BRAN: "Heard the chisel." He looks at the hole, and at you, and picks up the rope without a word. "I've held a man before."
@set holder = "bran"
@else
AINO: She picks up the coil of rope. Her hands are shaking. "I'll hold it." A pause. "I held it before."
@set holder = "aino"
@endif
@else
ILSE: She has taken off her gloves. "I'll hold it."
@if !no_aino
AINO: "You?" The girl looks at the clerk — slight, bookish, spectacles fogging — with open contempt.
ILSE: "I've held on to worse." Ilse holds out her hands for the rope. "Show me how."
@sfx rope
> Aino looks at her a moment longer. Then she shows her: the rope round the back, under the arms; heels braced against the iron foot of the stove; how to take in slack hand over hand; the Warden's bowline, tied on you, with its slip-tuck.
@else
> Ilse ties the knot you tell her — a bowline, with a slip-tuck — twice, to be sure, and braces her heels against the foot of the stove, the rope round her back, the way you'd seen fishermen do.
@endif
@set holder = "ilse"
@endif
@if holder == "ilse"
ILSE: "Three tugs means pull." She says it the way she'd read back a statement. "If you don't tug in two minutes, I'm pulling anyway."
* "What if I'm not finished?" -> un_rope_fin
* "Two minutes." -> un_rope_go
@else
> The rope round your waist. The Warden's bowline, with its slip-tuck. The other end in hands that have held a rope over this hole before.
-> un_rope_go
@endif

== un_rope_fin
ILSE: "Then you'll be finished upstairs." She doesn't smile. "I've typed four thousand one hundred and six of your Last Lines, Examiner. I'm not typing the four thousand one hundred and seventh."
@add ilse 1
=> un_rope_go

== un_rope_go
@if !no_aino
AINO: She presses something into your hand. The Warden's second knife: a short broad blade, a horn handle worn to the shape of someone else's grip. "For the rope," she says. "In case it snags." She doesn't look at you. "In case."
@set has_knife
@endif
> You take off your coat. The air in the hut is warm and the water is warm and nothing about this is the way it should be. You sit on the edge of the hole with your boots in the black water, like a child on a jetty in summer.
> There is a lantern on a line — the Warden's, green glass, heavy — and you take it in your left hand.
STARCH: Collar — no. No collar. There is no collar for this.
SINEW: Big breath. As big as you've got. Then half again.
UNDERTOW: Knock knock.
> You go under.
=> un_under

== un_under
@bg under
@music under
@title UNDER THE GLASS
@weather none
@time 40
@set went_under
> The cold does not feel like cold. It feels like a verdict.
> It closes over your head and takes the breath out of your chest in one piece, like a hand removing a stopper, and for a long moment there is nothing — no up, no down, no you — only the enormous indifferent clarity of the water.
@if pass("SINEW", 12)
SINEW(12): *Hold.* Hold it. The body knows this. The body did this once before, at twelve, and lived. It can do it again at fifty-six. Hold.
@else
@health -1
> Your chest convulses. Water in your nose, your throat. The body fights, blindly, the way it fought on the Narrows forty-four years ago, and you let it fight, and after an eternity of three seconds it remembers how to hold.
@endif
THE COLD: hello again, little marrow.
THE COLD: you got so tall.
> Then your eyes clear, and you see it.
=> un_see

== un_see
> Above you, the Glass — from beneath.
> You thought it would be a ceiling. It is a cathedral. The underside of the ice hangs down in columns: thousands upon thousands of long clear needles, each standing separate from the next, each one lit from above, so that the whole roof of the world is a forest of hanging candles, gold at their roots and green at their tips, swaying very slightly in the current like the pipes of an organ breathing.
@if !f_odile
> Through them, faint and huge, you can see the Chandelier's light — and across it, moving, the shadows of the dancers. Six hundred pairs of feet turning, turning, one-two-three, on a floor over sugar.
@else
> Through them, faint and huge, the Chandelier's light burns on over an emptying floor. A few shadows still move across it, turning slowly.
@endif
BAROMETER: Warm. The water is warm here. It's pouring along the seam like a river under a road — from the Works, under the hut, under the Chandelier, toward the Narrows. You can feel it pulling at your shirt.
UNDERTOW: Oh, it's beautiful. He never said it was beautiful. He never said it would be the most beautiful thing you ever saw.
* [SLEIGHT 9] [Reach up and break off a piece of the candle ice.] -> un_piece | un_piece_f
* [SINEW 10] [Grab a column and wrench it free.] -> un_piece | un_piece_f

== un_piece
> You reach up into the forest of candles. Your fingers close on a cluster of needles — they're softer than you'd think, like touching a bundle of reeds — and you twist, and a piece the size of your fist comes away in your hand with a small crystalline *snap* you feel rather than hear.
> You hold it against your chest, under your arm, the way you'd carry something alive.
UNDERTOW: You have it. You have the piece. You're bringing it up.
@set proof_under
=> un_pull

== un_piece_f
> You reach up. The needles break at a touch and slide through your fingers, a glittering shower of them, sinking past your face, gone. You reach again. Again they break. Your hand is too cold and too clumsy, and every second the cold takes a little more of it.
@health -1
> On the fourth try, something stays in your fist — a small ragged cluster, half the size you wanted. It will have to do.
@set proof_under
=> un_pull

== un_pull
> And then something takes hold of you.
> Not a hand. Nothing so personal. The seam takes hold of you the way a crowd takes hold of you, gently and completely, and begins to walk you sideways — away from the hole, away from the rope's straight line, toward the Chandelier's light, toward the Narrows. The rope at your waist goes taut, and then tauter, and far above you, through the ice, you feel it: someone bracing. Someone holding.
HACKLES: This is what happened to him. This is exactly what happened to him. This is where he—
> Far off, under the ice, out toward the Narrows, where the light from above fades to green and then to nothing, there is another light. Small. Faint. The colour of a lantern seen through a bottle.
> And beside it, against the underside of the ice, a hand.
@sfx knock
> Small. Five fingers. Knocking.
@sfx knock
=> un_feliks

== un_feliks
UNDERTOW: There he is.
UNDERTOW: There you are.
FELIKS: *You came down.* The voice is Undertow's voice. It has always been Undertow's voice. You understand now that it has always been a boy's. *You never come down. You always wake up.*
* "Feliks." -> un_f_name
* "I'm sorry. I'm so sorry. It was my dare." -> un_f_sorry
* "Did you push me up? Or did I climb on you?" -> un_f_push
* "Come up. Please. Come up with me." -> un_f_come

== un_f_name
FELIKS: *Yes.* A sound like a laugh, like ice. *Say it again. Nobody says it. You write my name in the snow and then you let a man scuff it out.*
=> un_f_hub

== un_f_sorry
FELIKS: *I know.* Gently. *You've been saying it for forty-four years. Down here, everything you say sounds like the same word.*
FELIKS: *It was a stupid dare. I was stupid to take it. We were boys. Boys are stupid, and then some of them get old.*
=> un_f_hub

== un_f_push
FELIKS: *That's the question, isn't it. That's the one you always come down here to ask.*
FELIKS: *I don't know, Aurel. I was fourteen and the water was in my eyes. I remember your boots. I remember that I wanted you up. I don't remember whether I did it or you did.*
FELIKS: *Does it matter? If I pushed, you owe me. If you climbed, you owe me. You've made it come out the same either way.*
=> un_f_hub

== un_f_come
FELIKS: *I can't.* Not sad. Simply true. *I'm not here, Aurel. I'm not anywhere. I'm what you kept. You kept me so carefully — like a Last Line you never let anyone read.*
=> un_f_hub

== un_f_hub
THE COLD: or you could stay.
THE COLD: it's warm now. they made it warm, the works, just for you. no more knocking. no more listening at the floor at night. you could finally stop.
@sfx heartbeat
> The rope at your waist is so taut it hums. Above you, somewhere up in the gold, someone is holding on with everything they have.
FELIKS: *Somebody's holding the rope, Aurel.* The small hand, very far away, stops knocking. *Somebody's holding it this time.*
?{pass("KEEL", 10)} KEEL(10): Three tugs. That is all. Three tugs, and let them pull. You don't have to climb. You don't have to push. You only have to let yourself be *reached*.
* [Tug the rope three times.] -> un_up
* [Swim toward the hand.] -> un_swim
* {has_knife} [Take out the Warden's knife.] -> un_knife

== un_knife
> The knife is in your hand. The rope is taut against its edge. You could do what he did. You could make the same choice he made, for — for whom? Nobody is being pulled into the hole after you. There is no one on the other end of this rope who needs saving from you.
UNDERTOW: That's the difference. Do you see? That's the whole difference between you and him. He cut the rope so someone else could live.
FELIKS: *Don't be stupid, Aurel.* Very gently. *You've been stupid once already tonight. It was my turn.*
* [Put the knife away. Tug three times.] -> un_up
* [Cut the rope.] -> un_cut

== un_cut
> The rope parts under the blade like a held breath let go.
> For a moment nothing happens. Then the seam, which was holding you gently, holds you completely, and walks you away into the green.
=> un_stay

== un_swim
> You swim toward the hand. The rope pays out behind you — slowly, then less slowly — and then stops, and pulls, and you pull against it, toward the small lantern light and the small knocking hand, and the rope pulls back.
@if holder == "ilse" && ilse >= 3
@sfx rope
> And then it does not stop pulling. It pulls and pulls and pulls, not three tugs, not anything agreed, just *pulling*, steadily, stubbornly, hand over hand, like a clerk who has decided that some things will not be omitted from the record. You are going backward. Up. Away from the hand.
FELIKS: *There. You see?* The small light is going out, very far off, like a lantern carried round a corner. *Somebody's holding it.*
@set ilse_pulled
=> un_up
@elif holder == "aino" && aino >= 4
@sfx rope
> And then it does not stop pulling. It pulls and pulls — a girl with her heels braced on a stove and a rope round her back, who has done this before and lost, and will not lose twice. You are going backward. Up. Away from the hand.
FELIKS: *There. You see?* The small light is going out, very far off. *She's closer.*
@set aino_pulled
=> un_up
@elif holder == "bran" && bran >= 3
> And then it does not stop pulling. It pulls the way a cross-cut saw pulls, steady and unarguable, a man at the other end who does not push, ever. You are going backward. Up. Away from the hand.
FELIKS: *There. You see?* The small light is going out, very far off. *Pull, and let them pull.*
=> un_up
@else
> The pull slackens. Whoever is on the other end cannot hold both you and the seam, and you are not helping them. The rope goes long, and longer.
=> un_stay
@endif

== un_stay
@bg black
@music under
> You swim toward the hand, and the hand swims toward you, and the lantern light grows, and grows, and it is not green any more but gold, warm, the gold of a kitchen at dusk forty-four winters ago, with bread on the table and your mother at the window, calling two names across the ice.
@sfx knock
> The last thing you hear, very faint, from far above, is three knocks on the ice. Somebody up there, knocking back. So you'll know that someone heard.
THE COLD: there. there now. there.
@gameover "You Stayed" "The Examiner of the Third Bench went under the ice on the last night of winter and did not come up. The Glass lost its Examiner before it lost its ice."

== un_up
> You tug. Once. Twice. Three times.
> And you are *pulled*.
> Backward through the green, through the gold, against the seam's slow insistent walking, the rope biting your waist, the hole a square of lamplight rushing down toward you — and then air, and noise, and the hut, and hands, many hands, hauling you by your shirt and your arms and your hair out onto the wet planks, where you lie on your side coughing up the Basin while someone throws a coat over you, and someone else a blanket, and someone else — you are fairly sure — the Warden's rolled-up flags.
@bg hut
@music interior
@weather mild
@title THE WARDEN'S HUT
@if holder == "ilse"
ILSE: She is kneeling beside you. Her hands are raw and bleeding from the rope. She doesn't seem to have noticed. Her spectacles are gone. "Four minutes," she says. Her voice is doing something it has never done in six years. "You were under *four minutes*."
?{ilse_pulled} ILSE: "I said two. I lied." She wipes her face with the back of a bleeding hand. "Enter that."
?{!ilse_pulled} ILSE: "Three tugs. I counted." She wipes her face with the back of a bleeding hand. "I counted every one."
@elif holder == "aino"
AINO: She is kneeling beside you, rope-burned, soaked, shaking so hard her teeth are knocking. "I held it," she says. "I held it. I *held* it." Over and over, like the bell.
?{aino_pulled} AINO: "You tried to go. I felt you. I didn't let you." Fiercely: "I didn't let you."
@else
BRAN: He hauls you up to sitting like a sack of flour and thumps your back until the last of the Basin comes out. "Welcome back to the ice, Examiner." He grins through his beard, but his hands, you notice, are shaking. "Local Nine doesn't lose members on a Thursday."
@endif
@morale 1
@add thaw 2
@add ilse 1
@xp 40
> You open your hand. The piece of candle ice is still there, crushed against your palm, already shrinking in the warm air of the hut: a bundle of glass needles, leaning, sliding apart.
@if !no_aino
AINO: She takes it from you as gently as a bird, wraps it in a clean rag, and packs it in a tin with snow from the roof. "Proof," she says. "Like he wanted."
@else
> Someone wraps it in a rag and packs it in snow in a tin. Proof. Like he wanted.
@endif
UNDERTOW: He's still down there. He'll always be down there. But you came up, and he didn't mind. He *wanted* you to.
KEEL: You went under the ice and came back up. Forty-four years late, and not alone. Get dressed. You have people to move.
-> hub3
`);
