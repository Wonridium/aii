CANDLE.script(String.raw`
// ---------------------------------------------------------------- the lantern boy
== st_boy
@time 10
> He has been following you for three stalls: a Rime boy of nine or ten in a coat made out of another coat, with a pole over his shoulder and a dozen paper lanterns hanging from it like a bunch of cherries — red, and one yellow, and one that was blue before it got wet.
BOY: When you stop, he stops. When you look at him, he looks at the lanterns. "Two for a penny," he says to them. "For the one under the ice."
* "Which one under the ice?" -> st_boy_which
* "I'm not buying anything, son." -> st_boy_no
* [HACKLES 8] [He's standing on grey ice. Look where his boots are.] -> st_boy_seam | st_boy_which

== st_boy_which
BOY: He looks at you as though you've asked which way is up. "*The Warden.* Everybody's buying one for the Warden. You put it on the ice where he is, by the steps. My gran says the drowned can't see in the dark. So you make it less dark."
> Down the lane, at the Chandelier's steps, you can see them: a scatter of small coloured lights on the ice where the body was, more of them than you'd think, red and yellow and green, set down by people who didn't want to be seen setting them down.
UNDERTOW: The Glass doesn't say anything that matters. It only does it.
=> st_boy_talk

== st_boy_no
BOY: "Everyone's buying one," he informs you, not moving. "Even the Mutual man bought one. He paid a whole penny for one and didn't take the other." A pause, to let this sink in. "He's very sad, the Mutual man."
=> st_boy_talk

== st_boy_seam
HACKLES: His boots are on grey ice. Wet grey ice, with a sheen on it, a yard from a line of snow that has melted in a stripe as straight as a ruler. He is standing on the seam as if it were a pavement.
* "Son. Step over here, would you. Onto the white." -> st_boy_step
* [Say nothing. Buy a lantern.] -> st_boy_buy

== st_boy_step
BOY: He steps over, puzzled, without argument, the way Rime children do what grown-ups say about ice. Then he looks back at where he was standing, and something passes over his face — the same thing, you think, that passed over Aino's.
BOY: "It's laughing there," he says. "The Warden said. He said if it laughs, you don't stand on it." He looks up at you. "I forgot."
TENDERNESS: He'll remember now. He'll remember a tall man in a mended coat telling him to step onto the white, and he'll remember it for sixty years.
@add thaw 1
@xp 5
=> st_boy_talk

== st_boy_talk
+ {!bought_lantern} [Buy two lanterns. A penny.] -> st_boy_buy
+ {!seen("st_boy_warden")} "Did you know the Warden?" -> st_boy_warden
+ {!seen("st_boy_ashore")} "Where do you sleep tonight?" -> st_boy_ashore
+ [Let him go on his way.] -> st_boy_bye

== st_boy_buy
> You give him a penny. He gives you two lanterns and, after a moment's hard thought, the wet blue one as well, for nothing. "That one's a bit broken," he says. "It still works. Mostly."
@set bought_lantern
@add thaw 1
BOY: "You put one on the ice for the Warden," he explains, in case you're from the city and don't know. "And you keep one." He considers you. "For whoever you've got."
UNDERTOW: For whoever you've got.
=> st_boy_talk

== st_boy_warden
BOY: "He gave me a job." Immense pride. "Bailing his measuring hole. With a tin. So it doesn't skin over. A ha'penny a day." His face falls. "He owes me for Tuesday." Then, because this seems ungenerous even to him: "He said I had good ears. He said I could hear the ice better than his granddaughter could, and she's the best." A pause. "He said not to tell her he said that."
TENDERNESS: Aino should hear that. Not the ha'penny. The ears.
@set boy_ears
=> st_boy_talk

== st_boy_ashore
BOY: "In Gran's hut. On Tar Lane." He jerks his head at a row of dark huts leaning together over a stretch of grey ice. "Gran won't go ashore till the bell. Nobody will. That's what the bell's for."
HACKLES: Tar Lane. On the seam. Every hut in it.
@set knows_tarlane
@clue tarlane The lantern boy's grandmother sleeps on Tar Lane — a row of huts standing straight on the seam — and won't go ashore until the Thaw Bell rings.
=> st_boy_talk

== st_boy_bye
BOY: He hitches the pole higher on his shoulder and goes off down the lane, bobbing, calling *two for a penny, two for a penny, for the one under the ice*, and the lanterns swing on his pole like a small procession going somewhere it has been before.
-> hub2

// ---------------------------------------------------------------- the dancers
== st_dance
@time 10
> Behind a hut on Salt Row, on a patch of black ice swept clean with a broom, two young people are practising the waltz by the light of a lantern hung on a nail. She's in a borrowed dress with her coat over it. He's a cutter, from the size of his shoulders — the kind of young man who could lift you and a small horse, and who is currently being defeated by the number three.
DANCER: "One-two-three, *one*-two-three. No, *Anders*, the *other* foot. You're not sawing me."
> He treads on her. She yelps and laughs. He apologises to her, and to the ice, and — noticing you — to you.
* [DECORUM 10] "May I? Hold her here, not here. And let the floor do the turning." -> st_dance_teach | st_dance_teach_f
* "The ice here isn't safe. The ice all over the Glass isn't safe." -> st_dance_warn
* [Watch for a moment, and go on.] -> st_dance_watch

== st_dance_teach
DECORUM: There. There it is. The frame of the arms, the rise on the two, the long step that isn't a step but a lean. You learned this for Clara, twenty-two years ago, badly. Your body kept it anyway, the way a coat keeps the shape of the one who wore it.
> You show him. You don't dance — heavens, no — but you stand behind him and move his elbow an inch, and his hand an inch, and tell him to stop looking at his feet and look at her, because she is the only part of the waltz that matters. And on the fourth try the two of them go round, once, whole, on the black ice under the lantern, and she gasps as though somebody had lifted her.
DANCER: "*Anders!*"
> They go round again. They've forgotten you. It's the best review you've had in years.
@if !known("waltz")
@thought waltz
@endif
@morale 1
@add thaw 1
@xp 10
=> st_dance_after

== st_dance_teach_f
> You mean to show him. You move his elbow, and his hand, and something in your own back goes *click* with the quiet decisiveness of a door locking, and you stand there, bent, holding a young cutter's elbow, unable to straighten.
DANCER: "Oh — are you — Anders, get him a *crate*—"
> It takes a minute, and a crate, and a great deal of kindness from two people who are late for a ball. When you leave, Anders is dancing better out of pure sympathy.
@health -1
=> st_dance_after

== st_dance_warn
DANCER: She stops. He stops. They look at each other, and then at you, and something in their faces makes you think of every young couple who have ever been told by an old man that the world was dangerous.
DANCER: "We know," she says. "Everybody's saying. The Warden was saying all week." She lifts her chin. "We're going to dance anyway. We've been practising for a month. And if it goes—" she looks at Anders — "he's a cutter. He can swim."
=> st_dance_after

== st_dance_watch
> You stand at the corner of the hut and watch them go round, badly, laughing, under the lantern. It is very cold. Somewhere behind you, the Chandelier's band starts the Candle Waltz for real, muffled through the walls, and the two of them stop and look at each other, and then go round in time to it, and it is — suddenly, not by any skill of theirs — beautiful.
TENDERNESS: It doesn't matter whether they're good. It matters that they're going.
@add thaw 1
=> st_dance_after

== st_dance_after
-> hub2

// ---------------------------------------------------------------- Ilse, more
== il_wren
ILSE: She is silent for long enough that you think she won't answer. Then: "We started at the Office the same week. Nineteen. Two girls from the Glass in a building full of men in cuffs. We shared a desk for a year." A breath. "She was a better stenographer than me. Faster. She could take down a man lying and you could *hear* it in the shorthand."
ILSE: "Then there was a hanging. The Coldharbour poisoner. I took the last statement, the morning of. He talked to his dog. The warder had let him have it in the cell. He told it where he'd buried its bone. That was all. Four minutes."
TENDERNESS: What a man told his dog on the morning of his hanging. It's in the book. The first entry, maybe. The one that started it.
ILSE: "I typed it up and put it in the file and couldn't stop thinking about it, so I showed it to Wren. The next week it was in the *Lamp*. 'Poisoner's Last Words to Faithful Hound.' Page one." Her mouth goes thin. "She was dismissed. I was not. She never said I'd shown it to her."
* "She never told them it came from you." -> il_wren_2
* "Which of you do you think was worse?" -> il_wren_2

== il_wren_2
ILSE: "I've never been sure." She says it simply. "She sold it. I wrote it. I think about it every time I take the book out." She touches her coat, where the small black one lives. "That's when I started the other book. So that there'd be somewhere for those things to go that wasn't a file, or a newspaper."
@set knows_ilse_wren
@add ilse 1
@add thaw 1
-> il_talk

== il_narrows
ILSE: She doesn't pretend not to know what you mean. "It was already lit," she says. "Every time I went out there, when I was eight. I thought it was God." A small, dry sound that is nearly a laugh. "It was the Warden. Which, on the Glass, is close."
ILSE: "Thank you for taking me." A pause. "I mean — for letting me come. I know it wasn't a scene."
* "It was the only scene that mattered tonight." -> il_narrows_2
* "You'd have come anyway." -> il_narrows_3

== il_narrows_2
ILSE: She looks at you, and then away, quickly, at nothing, the way people look at nothing when they need somewhere to put their face for a moment.
@add ilse 1
-> il_talk

== il_narrows_3
ILSE: "Yes," she says. "I would." And that, apparently, is that.
@add ilse 1
-> il_talk

== il_after
ILSE: "After tonight." She says it as if trying out a foreign phrase. "The Office will want the Line by Thursday. Then the transcript. Then the Superintendent will want to know whether you're mad." A beat. "I'll have to write that you aren't. I'll need to decide whether it's true."
@if (ilse || 0) >= 4
ILSE: She walks a few paces. "My mother wants me home for the summer. To help with the stall." Another few paces. "I think I might write something. Not a record. Not a file." She keeps her eyes on the rain. "Don't tell anyone. It's not entered."
* "What would you write?" -> il_after_write
* "Not entered." -> il_after_ne
@else
ILSE: "Then another inquest, and another Examiner." She adjusts her glove. "That's what clerks have after. More of the same, typed neatly."
-> il_talk
@endif

== il_after_write
ILSE: "Things people say that aren't evidence," she says. "Somebody should." And then, before you can answer: "The Examiner's coat is soaked. The Office recommends he stand under something."
@add ilse 1
@set ilse_will_write
-> il_talk

== il_after_ne
ILSE: A very small smile, gone before it's finished. "Not entered," she agrees.
@add ilse 1
@set ilse_will_write
-> il_talk

// ---------------------------------------------------------------- Act III: Tar Lane
== a3_tarlane
@bg glass
@title TAR LANE
@time 30
> Tar Lane is eleven huts leaning together over a stripe of grey ice, so close their eaves touch, so old their runners have frozen into the Glass and been thawed out and frozen in again for thirty winters. There's water standing in the lane now, ankle-deep, black, with the lantern-light lying in it in pieces.
> Every window is lit. Nobody is packing.
@if f_bell
> From the dark edge of the Glass the Thaw Bell is ringing, slow and patient, and as you come into the lane the doors are already opening. Old men with bundles. Old women with cats in baskets. A cradle carried between two grandfathers like a sedan chair. They don't hurry. They don't argue. They go.
BOY: The lantern boy is at the end of the lane with his pole, directing traffic, enormously important. "*Not* that way, Gran, that way's laughing—"
@set f_tarlane
@add thaw 1
@xp 10
-> hub3
@endif
> The lantern boy is sitting on the step of the last hut with his pole across his knees, looking at the water. When he sees you he jumps up.
BOY: "Gran won't come," he says at once, as if you'd asked. "None of them will. Not till the bell. I told them it's laughing. Gran says I'm a child and the Warden's dead and when he's dead his bell rings itself." His voice wobbles and recovers. "It *doesn't*, does it."
> The door behind him opens. A woman of eighty stands in it, four feet ten, in a coat of reindeer hide worn to the colour of tea. On her chin, faded almost to nothing, three blue bars.
ARCHIVE: Three chin-bars. An ice-reader. There were perhaps a dozen left in the Basin. There are now, possibly, two.
TUULA: She looks you up and down — the city coat, the Office pin, the wet boots — and says something in Rime that makes the boy go red.
BOY: "She says, is this the one who writes the lines for the dead." A pause. "She says it more rude than that."
@set met_tuula
* "Tell her yes. Tell her I've come to write one for Tar Lane if she stays." -> a3_tl_blunt
* [TENDERNESS 11] "Tell her the Warden's granddaughter is on the ice, and she's frightened, and she can't ring the bell alone." -> a3_tl_aino | a3_tl_no
* [ARCHIVE 12] [Answer her yourself, in the six words of Rime you learned from a dictionary forty years ago.] -> a3_tl_rime | a3_tl_rime_f
* {boy_ears} "Tell her the Warden said her grandson has the best ears on the Glass." -> a3_tl_ears
* "I'll come back." -> hub3

== a3_tl_blunt
TUULA: The boy translates. She listens without expression. Then she laughs — a dry creak, like a runner freeing itself from the ice — and answers at length.
BOY: "She says the city has been writing lines for Tar Lane for a hundred years. Fishing licences. Harbour dues. Valuations. She says one more won't kill her." He swallows. "She says the ice will, maybe, but that's between her and the ice."
@set tuula_refused
-> hub3

== a3_tl_aino
TENDERNESS: Not the city. Not the Office. The girl. Every old woman on the Glass has held that girl on her knee.
> The boy translates, slowly, finding the words. The old woman's face does not move at all, and then it does: something round the eyes, very small, like a crack going through clear ice.
TUULA: She says a single word in Rime, and goes back inside, and you hear her talking — sharp, fast, carrying — and a door opens across the lane, and another.
BOY: "She said *Aino*," he tells you, wide-eyed. "She said it like the bell."
> In ten minutes the lane is moving: bundles, baskets, the cradle between two grandfathers. The old woman comes last, with a lamp and a cat, and stops in front of you, and says something that the boy doesn't translate. When you look at him, he shrugs, embarrassed. "It's a blessing," he says. "Sort of. It's the one you say to a dog that's done well."
@set f_tarlane
@add thaw 2
@xp 25
-> hub3

== a3_tl_no
TUULA: She hears the boy out. Then she shakes her head once and shuts the door — not hard; the way you close a book you've already read.
BOY: "She says Aino's a big girl," he reports miserably. "She says the bell rings or it doesn't."
@set tuula_refused
-> hub3

== a3_tl_rime
ARCHIVE: *The ice laughs. The Warden is under it. Come.* Six words. Wrong grammar, a city accent you could cut with a saw, and one of the words is the one for *uncle* rather than *warden*, because the dictionary was a bad one.
> The old woman stares at you as if a dog had recited the Inquest Act. Then she puts back her head and laughs until she has to hold the doorpost, and when she stops she is wiping her eyes, and she answers you — slowly, in Rime, as to a child.
BOY: "She says you said *my uncle is under the ice*," he tells you. "She says that's close enough. She says he was everybody's uncle." He grins suddenly. "She says come in and have tea while they pack. She says you're too thin."
> They pack. You have tea — black, salted, with a lump of fat melting in it — in a hut that smells of smoke and fish and eighty winters, while the old woman tells you, through the boy, how the Warden learned to read ice from her mother on this very lane when he was six, and cried when he fell through the first time, and went back out the next morning. It takes twenty minutes. It is the best twenty minutes of your night.
@set f_tarlane
@add thaw 2
@health 1
@xp 25
-> hub3

== a3_tl_rime_f
ARCHIVE: The six words arrive in the wrong order, with the wrong endings, in an accent you could cut with a saw.
TUULA: The old woman listens, head on one side. Then she says something to the boy, and closes the door.
BOY: He is trying very hard not to laugh. "She says thank you for the fish," he says. "She says she doesn't want any more fish."
@set tuula_refused
-> hub3

== a3_tl_ears
> The boy stares at you. Then, scarlet to the ears in question, he translates it — you can tell he translates it exactly, because he stumbles on *best*.
TUULA: The old woman looks at her grandson for a long moment. Then she puts her hand on his head, the whole small weight of it, and says something short in Rime.
BOY: "She says," he whispers, "if the ice-reader says the child can hear it, the child can hear it." He looks up at her. "*Gran.*"
TUULA: She raises her voice to the lane — one sentence, sharp as a gull — and the doors begin to open.
@set f_tarlane
@add thaw 2
@xp 25
-> hub3
`);