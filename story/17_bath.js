CANDLE.script(String.raw`
== ba_enter
@bg bath
@title SAARI'S STEAM — THE BATHHOUSE
@sfx door
@if seen("ba_enter") > 1
@time 15
=> ba_return
@endif
@time 30
> A long low building of black-tarred logs, half sunk into a bank of snow, with steam rolling out of a vent in its roof like the breath of something asleep. A painted board over the door: SAARI'S STEAM — HOT — COLD — HONEST.
> Inside the outer room it is warm enough to make your spectacles fog, if you wore spectacles. Pegs of coats. Boots in rows. A cold-plunge hole in the floor, cut square through the ice, with a ladder going down into the black. And behind a heavy felt curtain, voices — several, raised, in the particular tone of people who have been arguing about the same thing for years and intend to go on doing so until death.
> A very old Rime woman in a wet linen shift sits on a stool by the curtain with a birch whisk across her knees. She looks at your coat, your pin, your gloves, and your face, in that order, and is not impressed by any of them.
SAARI: "No coats in the steam. No coats, no boots, no pins, no Crown. Towel." She holds one out. "Or go home."
* [Take the towel.] -> ba_towel
* [STARCH 11] "I'll conduct my inquiry from the doorway, Madame, fully dressed." -> ba_door | ba_door_f
* "Is that really necessary?" -> ba_necessary

== ba_necessary
SAARI: "In forty years on this ice, I've had a bishop, two Mutual directors and the Hearth-King's great-great-grandnephew through that curtain. All in towels. It is the only honest room in Aubade." She doesn't lower the towel. "Towel."
* [Take the towel.] -> ba_towel
* [STARCH 11] "Then I'll ask my questions from here." -> ba_door | ba_door_f

== ba_door
STARCH: Collar. Coat. Pin. Every button fastened. You will not be undressed by a woman with a whisk, sir; there are *limits*.
SAARI: She looks at you for a long moment, and then, unexpectedly, cackles. "A stiff one. Fine. Stand in the door and sweat, then." She jerks her chin at the curtain and draws it back a hand's breadth.
@set ba_dressed
=> ba_inside

== ba_door_f
> You begin to say something dignified. The steam gets to your collar first. Within a minute it has gone limp, and so have you, and you are standing in a bathhouse in a greatcoat, sweating, with your pin fogged.
SAARI: "Towel," she says, gently now, as if to a child.
=> ba_towel

== ba_towel
> You undress in the outer room, folding each item with a precision that makes the old woman snort. Coat. Jacket. Waistcoat. Collar — the collar comes off last, and something in your neck unclenches that has not unclenched since the Academy.
> You stand in a towel, fifty-six years old and very pale and one metre ninety, holding your silver Last Line pin in your hand because you could not think where else to put it.
SLEIGHT: Pin it on the towel. Go on. It's the only place.
DECORUM: Oh no. Oh, no, no, no. Well. Carry it off. Everything can be carried off if you walk as though you meant it.
SAARI: She watches you pin the Office's silver bar to the corner of a bathhouse towel. "Now *that*," she says, "is a Crown I can respect." She draws back the curtain.
@set ba_towel_on
@add thaw 1
@add saari 1
=> ba_inside

== ba_inside
@sfx steam
> Heat hits you like a hand. A dim cedar room, stepped benches, a stove heaped with stones that hiss when a ladle of water goes on them, and through the steam — like figures in a bad dream about a senate — four people in towels, arguing.
> An old man with a conductor's moustache and a Mutual badge pinned — like yours — to his towel. A pink young man with a hangover and an actuary's ink-stained fingers. A gnarled giant with the Hearth-King's crown tattooed on his chest in blue gone green with age. And a woman of thirty or so with red paint on her forearms, sitting cross-legged on the top bench, who has plainly been winning.
@if ba_towel_on
DAGNY: She sees your towel. She sees the pin on it. She laughs so hard she has to hold the bench. "*Look.* Look, they've sent the Crown in its underclothes."
@else
DAGNY: She sees you in the doorway, coated and buttoned and steaming like a pudding. "Look. The Crown's come to watch us sweat. Come in, Examiner, we don't bite. Ib bites."
@endif
OSKAR: The old man with the moustache: "Sit, sit, Examiner. You've come about poor Sarre. We've been deciding your verdict for you. It'll save you a great deal of trouble."
=> ba_talk

== ba_return
@sfx steam
> The steam, the stones, the four of them in their towels, still arguing. It seems possible they have never stopped.
OSKAR: "Examiner! We've changed our minds. Twice."
=> ba_talk

== ba_talk
+ {!seen("ba_parl")} "Go on, then. What's my verdict?" -> ba_parl
+ {!seen("ba_saari")} [Talk to Ma Saari, by the stove.] -> ba_saari
+ {!seen("ba_ib")} [The old giant with the Hearth-King on his chest.] -> ba_ib
+ {!seen("ba_dagny")} [The woman with paint on her arms.] -> ba_dagny
+ {!seen("ba_plunge") && !ba_dressed} [The cold plunge. Grandfather Ib is looking at you and at it.] -> ba_plunge
+ [Leave the steam.] -> ba_leave

// ---------------------------------------------------------------- the parliament
== ba_parl
OSKAR: "Misadventure." The old conductor thumps the bench. "Obviously. A fine old man falls through bad ice doing his job. The Mutual pays his girl her three thousand nine hundred. Everyone is carried. That's what it's *for*. Forty years ago there was no Mutual, and do you know what a Warden's widow got? A ham."
FENWICK: The young actuary, weakly, from behind a wet flannel over his eyes: "Self-inflicted, surely. He *cut the rope*. Everyone knows he cut the rope. It's all over the Glass. You can't pay out on a cut rope, Oskar. Where would it end? People would be cutting ropes all over the city."
IB: The giant, in a voice like a coal-cellar: "Neither. The Lantern takes him. He was a Rime man and a Glass man and he went into the water for his town the old way, and it's not for any office to *price* him."
DAGNY: From the top bench, bored and fierce at once: "Unlawful killing. The Works murdered him with a pipe, and the Mutual held the knife, and all of you in your towels are arguing about which drawer to put him in while they pump hot water under your feet. Wake *up*."
> Four faces turn toward you through the steam, expectant.
* "Oskar's right. We carry each other. That's the whole point of the Mutual." -> ba_p_mut
* "Fenwick has a point. A rule is only a rule if it holds when it's unkind." -> ba_p_act
* "Ib's right. Some things shouldn't be priced." -> ba_p_hear
* "Dagny's right. Follow the heat back to where it comes from." -> ba_p_unp
* "You're all right. That's the problem." -> ba_p_all

== ba_p_mut
@align mutualist 1
OSKAR: "*Thank* you." He beams, and his moustache beams with him. "Forty years I drove the number nine tram, Examiner, from the Customs House to the Lamp Stairs. Every one of my passengers is on the Tables. When they fall, the city catches them. That's all I want on the old man's Line: *caught*."
DAGNY: "Caught and *priced*, Oskar."
OSKAR: "Better priced than dropped!"
@add oskar 1
=> ba_p_after

== ba_p_act
@align actuarian 1
FENWICK: He lifts the flannel from one eye, astonished. "Someone agrees with me? In *here*?" He sits up, then regrets it. "Rules are the only kindness that scales, Examiner. Everything else is favouritism in a nice hat."
IB: "Put your flannel back on, boy."
@thought price
=> ba_p_after

== ba_p_hear
@align hearther 1
IB: He nods, slowly, like a hillside. "Aye. The Hearth-King never priced a man. Never needed to. You were his, or you weren't." He taps the faded crown on his chest. "My grandfather saw the last one crowned. Mind you, he was a terrible king. Drank. But he never priced a man."
@thought lantern
=> ba_p_after

== ba_p_unp
@align unpriced 1
DAGNY: She looks at you with sudden, sharp interest, as if you had turned out to be a better wall than expected. "Well now. An Examiner who can smell smoke."
@thought saw
@add dagny 1
=> ba_p_after

== ba_p_all
OSKAR: "All of us?" He looks wounded. "That's not a verdict, that's a *coalition*."
FENWICK: "That's how the Settlement happened, you know. Everybody was right, so they wrote four drawers." He lies back. "Nobody's been happy since."
DAGNY: She is looking at you thoughtfully. "Or you write a fifth."
@if !known("fifth")
@thought fifth
@endif
=> ba_p_after

== ba_p_after
> The argument resumes at once, without you, at a higher temperature. Ma Saari throws another ladle on the stones. The steam swallows everyone's face.
@add thaw 1
@xp 10
=> ba_talk

// ---------------------------------------------------------------- Ma Saari
== ba_saari
SAARI: She is beating nothing in particular with the birch whisk, slowly, to keep her arm warm. "You want to know about Ailo."
SAARI: "Every morning at six, forty years. He came in with the night's drink still on him and sat on the top bench till he'd sweated it out, and went into the plunge, and came out a Warden. That was his church. The Deaconess had the Sundays. I had the rest."
SAARI: "Yesterday he didn't sit. He came in, and he gave me his towel, folded, and he said, 'Saari, if I don't come tomorrow, give this to the girl.'" She reaches under the stool and holds it out: a big coarse linen towel, grey with age, a Rime pattern woven into one end in faded blue — three short bars. "I thought he was drunk. He wasn't."
* "I'll take it to her." -> ba_saari_towel
* "Keep it. Give it to her yourself." -> ba_saari_keep

== ba_saari_towel
> You take the Warden's towel. It is heavier than it looks. It smells of cedar and smoke and, faintly, of him.
@set sarre_towel
@add saari 1
=> ba_saari_2

== ba_saari_keep
SAARI: "She won't come here. She won't come anywhere. She's sitting in his hut with a chisel." Ma Saari puts the towel back under her stool. "When the ice lets her out, I'll give it to her."
=> ba_saari_2

== ba_saari_2
SAARI: "And, Examiner. The plunge." She points the whisk at the square black hole in the floor, the ladder going down. "Forty years it's been cold enough to stop your heart. That's the point of it. This week it's warm. My customers go in and come out *pink* and complain. A cold plunge that's warm isn't a plunge. It's just a hole in the floor."
@clue plunge The bathhouse's cold-plunge hole has been warm all week. Ma Saari says the Warden gave her his towel yesterday: "If I don't come tomorrow, give this to the girl."
@xp 10
=> ba_talk

// ---------------------------------------------------------------- Ib
== ba_ib
IB: The old giant shifts along the bench to make room, which takes a while. "Ib Halvorsen. Forty years at sea, forty years in this steam. The sea was quicker." He studies you. "You're the Marrow."
@if knows_rescue
IB: "I was on the Narrows that night. Forty-four winters back. I was one of the five that held Ailo down on the ice when he wanted to go in a fourth time." He looks at his enormous hands. "He bit me. Here." A white crescent scar on the heel of his thumb. "I never held it against him. I'd have bitten me too."
@set knows_three
@add thaw 1
@else
IB: "Ailo pulled a Marrow out of the Basin, once. A long time ago." He watches your face. "Was it you? You've the look. People who've been in the water have a way of standing on ice. Like they're apologising to it."
* "It was me." -> ba_ib_me
* "I don't know what you mean." -> ba_ib_deny
@endif
=> ba_ib_end

== ba_ib_me
IB: He nods slowly. "I was one of the five that held him down. After. When he wanted to go back in for the other boy a fourth time." He shows you a white crescent scar on the heel of his thumb. "He bit me. I never held it against him."
@set knows_three
@add thaw 1
=> ba_ib_end

== ba_ib_deny
IB: "No. Of course not." He looks away, courteous as a mountain. "My mistake."
=> ba_ib_end

== ba_ib_end
IB: "The Hearth-King's crown, you're wondering about." He taps his chest. "Had it done in Port Sollen at nineteen, drunk, the year the last one died. The needle-man said it would bring luck at sea. It brought me forty years and a bad knee. That's luck, I suppose." A long exhale. "Ailo used to say the ice was the only king he ever served. It never lied to him. People did."
@xp 10
=> ba_talk

// ---------------------------------------------------------------- Dagny
== ba_dagny
DAGNY: She swings her legs down from the top bench. Red paint to the elbow — not blood, you check twice — and a cheerful scowl. "Dagny. I paint walls."
* "You paint UNPRICED on walls." -> ba_dag_unp
* "What sort of walls?" -> ba_dag_walls

== ba_dag_walls
DAGNY: "Ones that belong to people who'd rather I didn't." She grins. "The Cutters' Hall. The Mutual booth — twice this week, the little man in grey has to scrub it off himself, he's very neat about it. The Works' east wall, in letters two metres high, till the night watchman chased me with a lamp."
=> ba_dag_unp

== ba_dag_unp
DAGNY: "UNPRICED." She says it like a toast. "Because nobody is. Because the day they printed a number on the back of your papers, they told you what you were for. And a thing that knows what it's for can be *used up*."
DAGNY: "Your Warden was priced at three thousand nine hundred. The Works is priced at a hundred and forty thousand. Guess which one the Mutual listened to."
* "What would you have instead?" -> ba_dag_instead
* "Numbers feed widows, Dagny." -> ba_dag_widows
* "Would you paint something for me tonight?" -> ba_dag_paint

== ba_dag_instead
DAGNY: She opens her mouth to give the speech — you can see it, fully formed, polished by a hundred nights of this — and then closes it again. "...I don't know," she says, honestly. "Something where the question isn't *who pays*. I haven't got further than the wall."
@add dagny 1
@add thaw 1
=> ba_talk

== ba_dag_widows
DAGNY: "They do. Three thousand nine hundred crowns' worth." She shrugs. "I'm not saying it's nothing. I'm saying it's not *him*."
=> ba_talk

== ba_dag_paint
DAGNY: "Paint what?" Suspicious. Interested.
@if has_log || knows_seam || knows_candle
> You tell her: the seam, the rot, the blue flags that go the long way round. What might happen tonight. What the Glass might need to see, in the dark, if it has to walk.
DAGNY: She's quiet for a moment. Then she wipes her paint-red hands on her towel. "Arrows," she says. "Big ones. Red on white. Along the Warden's blue line, from the Chandelier to the shore, so a drunk could follow them with his eyes shut." She's already getting up. "I've got two buckets. It'll take me an hour."
@set f_paint
@add dagny 1
@clue paint Dagny the wall-painter will paint red arrows along the Warden's safe route off the ice.
@xp 20
@else
DAGNY: "Come back when you know what you want painted, Examiner. I don't do portraits."
@endif
=> ba_talk

// ---------------------------------------------------------------- the plunge
== ba_plunge
IB: He jerks his chin at the square of black water in the floor of the outer room. "It's the custom. A man sits in the steam, he takes the plunge. Even Examiners." A slow grin in the beard. "Especially Examiners."
HACKLES: No. Absolutely not. It's a *hole in the ice*. With *water* in it. You've been walking the long way round for forty-four years precisely to avoid—
* [KEEL 12] [Walk to the ladder. Go down.] -> ba_plunge_yes | ba_plunge_no
* "Not tonight." -> ba_plunge_refuse

== ba_plunge_refuse
IB: "Not tonight." He nods, unoffended. "Some other night, then." As if he knows exactly how many other nights there have been.
=> ba_talk

== ba_plunge_no
> You get as far as the ladder. You put one foot on the top rung. Then your body simply refuses — not a decision, a *refusal*, from somewhere lower than thought — and you step back onto the planks with your heart going like a drum.
IB: He doesn't laugh. He puts one enormous hand on your shoulder for a moment and takes it away. "That's all right," he says. "The water's patient."
@morale -1
=> ba_talk

== ba_plunge_yes
@sfx splash
> You go down the ladder. Three rungs. Four. The water closes over your feet, your knees, your chest, and you brace for the cold that stops the heart—
> —and it doesn't come.
> The water is *warm*. Warm as a bath. Warm as the inside of a mouth. You stand in the black square with the water to your chin and the whole of your body waiting to be afraid, and it isn't, and that is the most frightening thing that has happened to you all night.
BAROMETER: Warm. The Basin, under the Glass, in Deepwinter, is warm. You are standing in the proof.
UNDERTOW: You went in. You went into the water, Aurel. On purpose. And you're still here.
> You climb out. Ib hands you a towel without a word. Ma Saari, in the doorway, looks at you for a long moment and then nods once, as if you'd paid something.
@set did_plunge
@add thaw 2
@morale 1
@xp 20
=> ba_talk

== ba_leave
@if ba_towel_on
> You dress again in the outer room, item by item. The collar goes on last. It feels, for the first time in twenty-nine years, like something you are choosing to wear.
@endif
SAARI: As you go: "Examiner." She doesn't look up from the whisk. "If the Glass has to come off the ice tonight — the steam comes too. Tell them. Anyone who walks off my ice can sweat on the shore for free."
=> hub2
`);
