CANDLE.script(String.raw`
// ---------------------------------------------------------------- the Narrows
// Act II, optional. The place where it happened, and the light somebody kept.
== na_enter
@bg narrows
@title THE NARROWS — THE EDGE OF THE POSTED ICE
@if seen("na_enter") > 1
@time 20
=> na_return
@endif
@time 35
@weather snow
> You walk out past the last lantern of the Glass, and then past the last footprints, and then past the place where the snow stops remembering anybody.
> It takes twenty minutes. The town shrinks behind you to a gold smudge with a dome in it. Ahead, the Basin narrows between two black shoulders of shore, and the sky comes down to meet the ice, and there is nothing in between but wind.
ILSE: Behind you, a little out of breath, the lantern swinging: "The Office would like it noted that the Examiner has walked off the edge of the map."
BAROMETER: Listen to it. The ice out here speaks in a different voice — thinner, higher, a wire pulled across a hollow. The Narrows never froze honest. Not then. Not now.
@if pass("HACKLES", 8)
HACKLES(8): Stop. *Stop.* Your legs know this place before your head does. They have been trying to turn round for the last hundred yards.
@endif
> Posts stand in the snow at intervals, leaning, each with a rag tied to its top. The rags were red once. They are the colour of old meat now. They mark the line past which the ice is posted.
ARCHIVE: Harbour Board regulation. Posted ice is marked with red cloth on ash poles at intervals of no more than twenty yards. The regulation dates from the winter after the Narrows drowning. The drowning of a boy of fourteen, name not recorded in the regulation.
UNDERTOW: You know whose regulation this is. You are standing in his footnote.
> And there, at the very edge of the posted line, where the ice turns grey and the posts stop — a light.
> Small. Low. The colour of a candle seen through a jar.
* [Go to the light.] -> na_cairn
* "Ilse. Wait here." -> na_wait
* [Turn back. You don't need to see whatever it is.] -> na_turnback

== na_wait
ILSE: "No." She says it before she has decided to, and then looks almost as surprised as you. She tries again, in the Office voice: "The clerk accompanies the Examiner at the scene."
* "This isn't a scene." -> na_wait_2
* [Let her come.] -> na_cairn

== na_wait_2
ILSE: She looks at the posts. She looks at the light. She looks at you. "Then I'm not a clerk," she says, "and I'm coming anyway."
@add ilse 1
=> na_cairn

== na_turnback
HACKLES: Good. *Good.* Back to the lanterns. Back to the music. There is nothing out here but a candle and some very bad ice.
UNDERTOW: Nothing but.
> You turn your back on it. You walk twenty paces toward the Glass. The light stays where it is, behind you, the way a light does: patiently, without insisting, as if it has been waiting a long time and can wait a little longer.
ILSE: She doesn't say anything. She only walks back beside you, with the lantern, and once — only once — looks over her shoulder.
-> hub2

// ---------------------------------------------------------------- the cairn
== na_cairn
@insert v_cairn
@if !na_cairn_seen
@set na_cairn_seen
> It is a cairn. A small one, knee-high, built of blocks of ice cut square and stacked with care, the way a mason builds when nobody is paying him to hurry. The blocks have been cut and re-cut; the lower ones are old, rounded, the colour of milk. The top ones are new.
> On the top, in a hollow cut to fit it, a jam jar with a stub of candle in it, burning very low. And propped against the base, half buried in the drift, a small plate of tin with two letters scratched into it with the point of a knife.
> *F.M.*
> You stand there. For a moment you are not an Examiner, or fifty-six, or anything at all. You are two letters on a piece of tin.
UNDERTOW: Knock knock.
@if knows_rescue
TENDERNESS: You know who built this. You know whose knife.
@else
LEDGER: Item: somebody has kept a light at the edge of the posted ice for a boy whose initials were F.M. Item: you know exactly one boy whose initials were F.M. Item: you have never told anybody on this ice his name.
@endif
@xp 15
@endif
+ {!seen("na_plate") && !seen("na_plate_f")} [SCRUTINY 9] [Kneel and look at the tin plate.] -> na_plate | na_plate_f
+ {!seen("na_custom") && !seen("na_custom_f")} [ARCHIVE 10] "A light at the edge of the posted ice. That's a Rime custom." -> na_custom | na_custom_f
+ {!seen("na_vision") && !seen("na_vision_f")} [CONJECTURE 11] [Imagine the first winter someone built this.] -> na_vision | na_vision_f
+ {!na_lit && !na_out} [The candle is guttering. It won't last another quarter-hour.] -> na_candle
+ {!seen("na_name") && !seen("na_name_f")} [KEEL 12 red] [Say his name. Out loud. Here.] -> na_name | na_name_f
+ {!seen("na_hand")} [Take off your glove. Put your hand flat on the ice.] -> na_hand
+ {!seen("na_seam") && !seen("na_seam_f")} [BAROMETER 10] "The seam ends out here. Doesn't it." -> na_seam | na_seam_f
+ {bought_lantern && !na_paper} [Take out the paper lantern the boy sold you.] -> na_paperlantern
+ {!seen("na_ilse")} [Ilse is standing a little way off, holding the lantern low, not looking at you on purpose.] -> na_ilse
+ [Leave the cairn.] -> na_leave

== na_plate
> You kneel. The snow is dry and squeaks under your knee. You work the plate loose from the drift with two fingers.
SCRUTINY: The letters on the front are old — rounded by forty years of being scraped clean of rime, filled with rust in the bottoms of the strokes. But turn it over.
> On the back, in rows, small vertical scratches. Tallies, the kind a prisoner makes, grouped in fives with a line through. You count them without meaning to, the way you count everything.
> Forty-four.
SCRUTINY: The last one is bright. Unrusted. Scratched this week — this *winter*. One for every Deepwinter since. One for tonight's.
@if knows_rescue
UNDERTOW: He was counting. All those years, he was counting. The same number you were counting, from the other side of the water.
@else
LEDGER: One scratch a winter. Forty-four winters. Whoever keeps this light has been keeping it since the winter you were twelve.
@task narrows Find out who kept a light for Feliks at the Narrows.
@endif
@clue tallies A cairn at the Narrows holds a tin plate marked F.M. Forty-four tallies on the back, one a winter; the newest is fresh.
@xp 10
-> na_cairn

== na_plate_f
> You kneel. The snow is dry and squeaks under your knee. You look at the two letters for a long time, and your eyes will not do the thing they do at scenes, the cold sorting and the sums. They only read the letters, again and again, like a child sounding out a word.
> *F.M. F.M. F.M.*
-> na_cairn

== na_custom
ARCHIVE: The Rime-folk do not bury the drowned; the drowned are not theirs to bury. They are the water's. But for one not found, the family keeps a light at the edge of the ice where he went in — renewed each dusk, all winter, every winter — so that if the water ever changes its mind and gives him back, he will know which way the shore is.
ARCHIVE: It is kept by the family. Or, the ethnographies note — one entry, a footnote, a folk-tale more than a fact — by whoever last had hold of him.
@if knows_rescue
UNDERTOW: Whoever last had hold of him. He never had hold of Feliks. He had hold of *you*. And he went back three times for the one he never touched, and then he kept a light for him for forty-four years, as if he had.
@else
UNDERTOW: Whoever last had hold of him. Who had hold of you, that night, before somebody wrapped you in a coat? You were twelve and blue. You never asked the name.
@endif
@add thaw 1
@xp 10
-> na_cairn

== na_custom_f
ARCHIVE: Something about the Rime-folk and lamps, and the drowned. There is an index card for it somewhere in the basement. The basement, tonight, is flooded.
-> na_cairn

== na_vision
CONJECTURE: See it. The first winter. The winter after.
> A young man of nineteen with three new chin-bars, walking out past the last lantern with a saw over his shoulder and a jar in his coat. He cuts four blocks from the clean ice by the posts — he knows exactly which ice is clean; he always will — and stacks them, and lights the jar, and kneels, and says something to the water in a language you do not speak.
> The next dusk he comes back and lights it again. And the next. The Glass notices, the way the Glass notices everything, and does not say anything, the way the Glass never says anything that matters.
CONJECTURE: And every winter after. Drunk, sober, paid, unpaid, famous, disgraced, forty-four Deepwinters of dusks. He never missed one. You know he never missed one, because the light is still here, and he has been dead since twelve minutes past three this afternoon.
UNDERTOW: He lit it this morning. Before he went under. It was the last thing he did on the ice that wasn't for the Glass.
@if !knows_rescue
LEDGER: A Rime ice-man of nineteen, forty-four winters ago. The Warden is sixty-two. Do the subtraction. You don't want to. Do it anyway.
@set suspects_rescue
@endif
@thought lightkept
@done narrows
@add thaw 1
@xp 15
-> na_cairn

== na_vision_f
CONJECTURE: You try to see who built it, and all you can see is a boy in a wet coat on the ice, looking back at you over his shoulder, telling you not to come this way. That isn't the right picture. That's the other one. It's always the other one.
@morale -1
-> na_cairn

// ---------------------------------------------------------------- the candle
== na_candle
> The flame is down to a blue bead on a curl of black wick, drowning in its own wax. The wind comes over the ice and lays it flat, and it stands up again, smaller.
HACKLES: Let it go out. It isn't yours. Nothing out here is yours, except the part of the ice you're standing on, and that isn't yours for long.
TENDERNESS: He lit it this morning. Somebody should light it tonight.
+ [SLEIGHT 10] [Shield it with your body and relight it with your own matches, in this wind.] -> na_lit_self | na_lit_self_f
+ {has_hesper_jar} [Set the Deaconess's new jar in the hollow, and light it from the old.] -> na_lit_hesper
+ "Ilse. The lantern." -> na_lit_ilse
+ [Let it go out.] -> na_out
+ [Not yet.] -> na_cairn

== na_lit_self
> You kneel with your back to the wind and your coat open around the jar like a tent, and your fingers, which have tied surgeon's knots in moving carriages, strike a match on the first try. You hold it to the wick. The wick takes. You take out the stub, and press a new one from your pocket — you always carry one; you have never asked yourself why — into the soft wax, and light it from the old.
> The new flame stands up in the jar, tall and yellow and ridiculous, lighting the blocks from inside so that the whole small cairn glows like a lantern made of milk.
@set na_lit
@add thaw 2
@morale 1
@xp 10
UNDERTOW: There. Somebody's keeping it.
=> na_lit_after

== na_lit_self_f
> Your fingers will not do it. The first match snaps. The second flares and the wind takes it before it touches anything. The third you drop in the snow, and you kneel there with the box in your hand, and your hands are shaking, and it is not the cold.
ILSE: Without a word, she kneels beside you, opens the little door of the lantern, and holds it close. You tip the jar. The flame goes from her lantern into his jar like a word passed between two people who don't need to say it aloud.
@set na_lit
@set na_lit_ilse
@add ilse 1
@add thaw 1
=> na_lit_after

== na_lit_hesper
> You take the old jar out of its hollow — it is warm, and sticky with forty-four winters of wax at the rim — and set the Deaconess's new one in its place. You tip the old flame into the new wick. It takes at once, tall and clean, as if it had been waiting for exactly this.
> You put the old jar in your coat. You don't decide to. Your hand does it.
UNDERTOW: Sunday's jar. He'd have come for it tomorrow.
@set na_lit
@set kept_old_jar
@add thaw 2
@morale 1
@xp 10
=> na_lit_after

== na_lit_ilse
ILSE: She understands at once. She kneels, opens the little door of the lantern, and holds it to the jar while you feed in a new stub from your pocket — you always carry one; you have never asked yourself why.
> The flame goes from her lantern into his jar like a word passed between two people who don't need to say it aloud. The cairn lights from inside, milk-white and gold.
ILSE: She stays kneeling a moment longer than she needs to, her bare fingertips held out to the little heat. "There," she says. Just that.
@set na_lit
@set na_lit_ilse
@add ilse 2
@add thaw 2
@morale 1
=> na_lit_after

== na_lit_after
@if knows_rescue
TENDERNESS: Forty-four winters, and the first dusk he couldn't come, somebody came.
@else
TENDERNESS: Whoever kept this, they couldn't come tonight. And somebody came.
@endif
-> na_cairn

== na_out
> You stand and watch it. It takes a long time, and no time at all. The blue bead shrinks, and flickers, and holds — and then there is a thread of smoke going sideways in the wind, and the jar is only a jar, and the cairn is only a heap of ice at the edge of the posted line.
HACKLES: There. It's done. It's over. It was over forty-four years ago.
UNDERTOW: It was never over. It was only lit.
@set na_out
@morale -1
@add thaw -1
-> na_cairn

// ---------------------------------------------------------------- the name
== na_name
> You open your mouth, and the wind comes into it, and you wait for the name to do what it has always done — stop behind your teeth like a stone in a drain.
> It doesn't.
YOU: "Feliks."
> It comes out quite ordinary. A name. Two syllables, said in the voice you use for asking a clerk the time. The wind takes it out over the grey ice toward the open water.
> Nothing answers. No knock. No hand. The ice makes its thin high wire-sound, and the candle leans, and the Glass goes on glittering behind you in the distance, not having heard.
KEEL: And you are still standing. Look down. Your feet are still on the ice. It held.
UNDERTOW: He heard. Not the way you wanted — not a voice, not a hand — but he heard. That's what a name is for. Not to bring anyone back. To say: *I know where you are.*
@set said_name
@add thaw 2
@morale 1
@xp 20
=> na_name_after

== na_name_f
> You open your mouth, and the wind comes into it, and the name stops behind your teeth like a stone in a drain. Forty-four years of practice. You are very good at it.
@morale -1
@if ilse_knows_name
ILSE: Beside you, very quietly, not looking at you, she says it for you. "Feliks." The way she reads a name into the record at the start of an inquest: clearly, without adornment, so that it can be heard at the back of the room.
> And the name goes out over the ice, in her voice, and it turns out that is almost as good. It turns out that is a different thing, and also good.
@add ilse 1
@add thaw 1
@else
UNDERTOW: Another winter, then. He's patient. He's had the practice.
@endif
=> na_name_after

== na_name_after
-> na_cairn

// ---------------------------------------------------------------- the hand
== na_hand
> You take off your glove. The cold goes into your palm like a nail. You put your hand flat on the ice beside the cairn, fingers spread, the way the Warden's is spread under the Chandelier's steps, the way yours was in the dream.
> And under your hand, from underneath —
@sfx knock
> Three knocks.
HACKLES: *Pressure cracks.* That's all. Stress in the sheet. The ice out here is thin and under strain and it pops, it pops all the time, it pops in *threes* because threes are what your ears want to hear—
BAROMETER: It's the seam. Warm water knocking the underside of the sheet as it comes out into the open lead. It's physics. It's a pipe in a wall.
UNDERTOW: It's all of those. It's also him. Things can be two things. You of all people know that. A brother pushes. A drowning boy climbs.
+ [Knock back. Three times.] -> na_knockback
+ [Take your hand away.] -> na_hand_away

== na_knockback
> You knock. Three times, with your bare knuckles, on the ice. It hurts. You do it anyway.
> Nothing knocks back. The ice goes quiet under your hand — not the thin wire-sound; a different quiet — and stays quiet for a long time.
> Then, very far off, out toward the black water, a single long low note, like a bow drawn once across the lowest string of something the size of a church.
BAROMETER: Good ice sings low.
UNDERTOW: That's the first time you've heard it. The first time since.
@set knocked_back
@add thaw 2
@morale 1
@xp 10
-> na_cairn

== na_hand_away
> You take your hand away. There is a print of it on the ice, faintly, in melted frost: five fingers, spread. It fills in with rime as you watch, from the edges inward, until it is gone.
-> na_cairn

// ---------------------------------------------------------------- the seam comes out
== na_seam
BAROMETER: Follow it. The seam runs from the Works' pipe, under the hut, under the Chandelier — and here. Here is where it comes up for air.
> Beyond the last posts, forty yards out, there is no ice at all. There is a lane of open black water, steaming faintly, as long as a street, with floes turning slowly in it like leaves in a gutter. It is the dead middle of Deepwinter. There should be two feet of ice here. There is a river.
BAROMETER: Warm water pouring out from under the Glass into the Narrows, day and night. It has been eating the ice from underneath all the way here. When the Mild comes, the Glass won't sink. It'll *drain* — down this road, out this door.
LEDGER: Item: the Warden's log says the seam runs toward the Narrows. Item: the Narrows are open in Deepwinter. There is no third item. There doesn't need to be.
@clue narrows_lead Where the seam comes out at the Narrows, the ice has opened into a lane of steaming black water — in the middle of Deepwinter.
@set saw_lead
@xp 15
-> na_cairn

== na_seam_f
BAROMETER: There is something wrong with the ice out past the posts. You can feel it in your teeth. But the wind is in your eyes, and the dark is very dark, and whatever is out there is keeping its own counsel.
-> na_cairn

// ---------------------------------------------------------------- a paper lantern
== na_paperlantern
> The boy's paper lantern is squashed flat in your pocket, a folded thing of red paper and wire. You open it out. It's crooked. You light it from the jar and set it on the snow beside the cairn, where it glows the colour of a cherry and leans a little in the wind, like a guest who has arrived at the wrong party and decided to stay.
UNDERTOW: For the one under the ice. That's what the boy said. He didn't say which one.
@set na_paper
@add thaw 1
@morale 1
-> na_cairn

// ---------------------------------------------------------------- Ilse at the Narrows
== na_ilse
ILSE: She comes a few steps closer when you look at her. The lantern makes a small room of light around the two of you on the enormous ice.
ILSE: "Is this where?" She doesn't finish. She doesn't need to.
* "Yes." -> na_ilse_yes
* "About forty yards that way. The ice has moved since." -> na_ilse_exact
* "I don't know what you mean, Clerk." -> na_ilse_no

== na_ilse_yes
ILSE: She nods. She looks out at the posts and the grey ice and the black water beyond them, and you watch her look at it the way she looks at a scene: all of it, once, carefully, so that she won't need to look again.
=> na_ilse_2

== na_ilse_exact
ILSE: "Forty yards." She looks. "You measured it."
* "Every night for forty-four years." -> na_ilse_2
* "It's a habit. Distances." -> na_ilse_2

== na_ilse_no
ILSE: "Of course, Examiner." She stands a little straighter. The lantern goes a little lower. "I'll wait by the posts."
TENDERNESS: She walked twenty minutes into the dark after you. She is standing at the edge of the posted ice in cut-off gloves. You just shut a door in her face that she had not even knocked on.
@add ilse -1
-> na_cairn

== na_ilse_2
ILSE: "My father cut ice. Before the Works." She says it to the water. "He went through once, out here, when I was six. They got him out. He lost three fingers to the cold, and then he went south, where the water stays water." A pause. "My mother says he went because of the fingers. I've always thought he went because of the water. He couldn't stand to look at it after, knowing it had wanted him."
ILSE: "I used to come out here, after. Eight years old. With a candle in a jar." She almost smiles. "I thought if I kept a light where he went in, he'd stop being frightened of it. He'd come home. He didn't. But there was always already a light here, when I came. Every time. Somebody else's."
> She looks at the cairn. You watch her understand it, all at once, the way you understand a scene when the last fact drops into place.
ILSE: "...Oh," she says. "It was this one."
@set ilse_narrows
@add ilse 1
@add thaw 1
@if !brother_entered
ILSE: She takes out the book — not the Office book. The small black one. Things Not Entered. She holds it, closed, and looks at you. "I could write it here," she says. "Or in the other book. The real one. It's your choice. It's always been your choice."
* "The real one. Enter it." -> na_ilse_enter
* "Things Not Entered." -> na_ilse_notentered
* "Neither. Just stand here a minute." -> na_ilse_stand
@else
ILSE: "He's entered now," she says. "It's in the record. I checked it twice." A beat. "I'll check it again when we get back."
@add ilse 1
-> na_cairn
@endif

== na_ilse_enter
@set brother_entered
@add thaw 2
@add ilse 1
@sfx pencil
> She puts the small black book away and takes out the Office book, and writes, standing, the page held flat against the lantern's glass so that the light comes through the paper and you can see the letters forming backwards.
ILSE: "'The Examiner's brother, Feliks Marrow, fourteen years of age, drowned at the Narrows forty-four winters ago in the course of the rescue of the Examiner. Body not recovered. A light kept.'" She looks up. "The last part isn't a formula."
* "Leave it in." -> na_ilse_leave
* "The Office will strike it." -> na_ilse_strike

== na_ilse_leave
ILSE: "It's in." She closes the book. "Let them strike it. They'll have to read it first."
@morale 1
-> na_cairn

== na_ilse_strike
ILSE: "Then they'll strike it." She closes the book. "It'll have been there."
-> na_cairn

== na_ilse_notentered
@sfx pencil
> She writes in the small black book, briefly, and closes it. She doesn't tell you what, and you don't ask, and that turns out to be exactly right.
@set na_notentered
@add ilse 1
-> na_cairn

== na_ilse_stand
> So you stand there. The Examiner and his clerk at the edge of the posted ice, with a lantern and a jar and forty yards of dark between them and a boy. It's very cold. Neither of you says so.
@add ilse 1
@add thaw 1
-> na_cairn

// ---------------------------------------------------------------- leaving
== na_leave
@if na_lit
> When you look back from the Glass's first lantern, the cairn is a single gold point at the edge of the dark — so small you could cover it with a fingernail, so steady you know it will still be there when you look again.
@elif na_out
> When you look back from the Glass's first lantern, there is nothing out there at all. Only the dark, and the wind, and the posts, and the place where a light was.
@else
> When you look back from the Glass's first lantern, the cairn is a faint blue bead at the edge of the dark, flickering, waiting to see what you'll do about it. You don't do anything about it. It waits anyway.
@endif
-> hub2

== na_return
> The walk out is shorter the second time. It always is, you've noticed; it's one of the few mercies of the profession.
@if na_lit
> The cairn is still burning. The flame in the jar stands up straight as you come, the way a dog stands up when it hears your step.
@elif na_out
> The cairn is dark. The jar has filled with a little fresh snow.
@else
> The cairn's light is almost gone.
@endif
=> na_cairn
`);
