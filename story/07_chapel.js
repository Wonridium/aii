CANDLE.script(String.raw`
== cp_enter
@bg chapel
@music interior
@title CHAPEL OF SAINT ONDINE OF THE FLOE
@if seen("cp_enter") > 1
@time 20
=> cp_return
@endif
@time 30
> A great tent of oiled canvas, stitched in panels, stained by forty winters of smoke to the colour of strong tea. Inside, a thousand small flames: candles in tin cups, lamps in jars, tapers stuck in the ice itself, every one of them burning for somebody. The air is warm and smells of tallow and wet wool.
UNDERTOW: A thousand lanterns being carried across a dark water. Look how slowly they go.
ARCHIVE: The Lanternist rite. Each soul a flame, carried across the dark water to the Far Shore. The Glass keeps its chapel lit day and night through the winter, because the Rime-folk say that ice is where the dark water comes closest to the surface.
@if body_cut
> At the front, on two trestles before the little altar, a long shape lies under a white sheet. Near one end, the sheet rises to a point, like a tent-pole: the raised left hand.
@endif
> On a camp stool beside the altar sits a very small, very old woman in the grey habit of a deaconess, with a tin mug of tea in both hands and a face like a walnut that has decided to forgive you.
HESPER: "Ah. The Examiner." She doesn't get up. "Sit down, child, you're blocking about forty souls."
GRAVITAS: *Child.* You are fifty-six years old. You are the Examiner of the Third Bench.
HESPER: "Everyone's child in here. Even the Warden." She nods at the sheet — or, if there is no sheet, at the tent flap, toward where he lies. "Especially the Warden."
=> cp_talk

== cp_return
> The flames. The tallow smell. The Deaconess on her stool, a fresh mug of tea.
HESPER: "Back again. Sit, sit."
=> cp_talk

== cp_talk
+ {!seen("cp_sarre")} "You knew the Warden." -> cp_sarre
+ {!seen("cp_bury")} "Will you bury him in the Lantern-ground?" -> cp_bury
+ {!seen("cp_lantern")} "Tell me about the Lantern." -> cp_lantern
+ {!seen("cp_knock")} "The people here knock on the ice. Three times. Why?" -> cp_knock
+ {has_log && !knows_confession} "His log says he told you something he shouldn't have. And you told him something you shouldn't have." -> cp_conf
+ {body_cut && !seen("cp_body")} [Examine the body.] -> cp_body
+ {body_carpet && !seen("cp_fetch")} "He's still out there, under the carpet." -> cp_fetch
+ {knows_rescue && !lit_feliks} "Deaconess. Can a lantern be lit for someone forty-four years late?" -> cp_feliks
+ [Leave the chapel.] -> hub2

== cp_sarre
HESPER: "Twice a winter he came to service. First Sunday after the freeze, last Sunday before the thaw. He sang the hymns in Rime, very loudly and a little flat, and he always put a fish in the plate instead of a coin." She smiles into the mug. "I have never known what to do with a fish in the plate. I've been given forty-one of them."
HESPER: "He was a drunk and a liar and he took money for his word, and he was the best man on this ice. You can write all of that down, Clerk, it's all true at once."
ILSE: She does, in fact, write it down.
=> cp_talk

== cp_bury
HESPER: "That's up to you, isn't it." She says it without bitterness. "Misadventure, he goes in the Lantern-ground by the Customs House, with the fishermen. Unlawful killing, the same. Open — I can make an argument."
HESPER: "Self-inflicted, and he goes outside the wall. On the dark side. No flame at his head. It isn't my rule. It's older than me and stupider than me, but I took an oath to it, and I'm too old to be a heretic. It would take *years* to learn the paperwork."
@clue burial If the Warden's death is ruled self-inflicted, the Lantern church will bury him outside the wall, without a flame. Any other line, and he lies with the fishermen.
* "And what do you want me to write?" -> cp_bury_want
* "Rules like that should be broken." -> cp_bury_break
* "The rule is the rule. I can't write to suit a graveyard." -> cp_bury_rule

== cp_bury_want
HESPER: "I want you to write what happened." She blows on the tea. "And then I want what happened to be something I can bury properly. I'm aware those are two different prayers. I say them both anyway. The Saint can sort it out."
=> cp_talk

== cp_bury_break
@align unpriced 1
HESPER: "Oh, certainly. By somebody young, with good knees." She taps her own knee. "I'll hold their coat."
=> cp_talk

== cp_bury_rule
@align hearther 1
HESPER: "Spoken like a man who's never had to dig outside a wall in Thawmonth." She looks at you over the mug. "But you're right. You can't. That's why they gave the job to someone like you, and not to someone like me. I'd write 'misadventure' on a man who'd hanged himself in the bell rope, if his mother asked me nicely."
=> cp_talk

== cp_lantern
HESPER: "Every soul is a small flame, carried across dark water to the Far Shore. That's the whole of it, really. The rest is choir practice." She gestures at the thousand lights. "When you die, someone carries your flame for you. That's what these are. Somebody's carrying each one."
HESPER: "The drowned have their flames put out by the water. So we relight them — that's why the jars. Out on the Glass we relight a lot of drowned."
* "And the ones who put out their own?" -> cp_l_own
* "Do you believe it?" -> cp_l_believe

== cp_l_own
HESPER: "Dark. Forever. Outside the wall. No one carries them." A pause. "That's the doctrine."
TENDERNESS: She said *that's the doctrine* the way you'd say *that's the address* of a house you've never been able to walk past.
=> cp_l_believe

== cp_l_believe
HESPER: "I believe it on Sundays." She sets her mug down on the altar step. "The rest of the week I'm a nurse who's seen a great many people die, and none of them looked like they were going anywhere. They looked like they were stopping."
HESPER: "But I light the jars every night anyway, child. Because the dark's real, whether or not the Far Shore is. You carry a lamp *because* of the dark, not because you've got a map."
@thought lantern
@xp 10
* "That's a better answer than the Office would give." -> cp_l_office
* "Then what's the point of a lamp if you don't know where you're going?" -> cp_l_point

== cp_l_office
HESPER: "The Office gives four answers. I've read them. Misadventure, self-inflicted, unlawful, open." She counts them off on stubby fingers. "Not one of them has 'he was brave' in it. Not one has 'he was frightened and did it anyway'. You'd think somebody would have noticed."
@if !known("fifth")
UNDERTOW: Somebody has.
@thought fifth
@endif
@align hearther 1
=> cp_talk

== cp_l_point
HESPER: "So you can see your feet." She says it simply, as though explaining a spoon. "That's all a lamp is for. Not to see the Far Shore. To see the next bit of ice."
KEEL: The next bit of ice. That's all anyone has ever had. That's all *you* have ever had.
@align hearther 1
=> cp_talk

== cp_knock
HESPER: "The Knockers." She says it fondly, as if naming a family of noisy neighbours. "It's a Rime story the Glass stole, the way the Glass steals everything. The drowned knock on the underside of the ice for a year and a day, asking to be let into the light. So when you hear a knock under the ice — or think you do — you knock back. Three times. So they know somebody heard."
HESPER: "The Lantern disapproves, naturally. The Lantern says the dead can't knock. The Glass knocks anyway. Every child out here knocks three times on the ice before they go to bed." A pause. "So do I, if I'm honest."
UNDERTOW: So they know somebody heard.
UNDERTOW: Forty-four years. Nobody knocked back.
@set knows_knockers
@add thaw 1
=> cp_talk

== cp_conf
HESPER: The tea stops halfway to her mouth. She lowers it. "I can't tell you what a man says to me, Examiner. You know that. That's older than your Office."
@if hesper >= 1
=> cp_conf_yes
@endif
* [TENDERNESS 11] "Then don't tell me what he said. Tell me what you said." -> cp_conf_yes | cp_conf_no
* [OBJECTION 11] "Then tell me a hypothetical. The Lantern allows hypotheticals." -> cp_conf_yes | cp_conf_no
* "Then I won't ask." -> cp_conf_leave

== cp_conf_leave
@add hesper 1
HESPER: She looks at you with something like approval, and something like disappointment, in exactly equal measure. "You're a strange kind of Examiner."
=> cp_talk

== cp_conf_no
HESPER: "No." Gently, completely. "Ask me something else, child."
=> cp_talk

== cp_conf_yes
HESPER: She is quiet for a long time. The thousand flames move in a draught you can't feel.
HESPER: "Suppose," she says at last, "that a man came to me. A week ago. Suppose he asked me a question — a hypothetical. *If a man went into the water so that others would not have to, would his lantern go out? Or would it be lit?*"
HESPER: "And suppose I knew the doctrine, and I knew the answer the doctrine wanted, and I looked at his face and I said the other thing." She is looking at her own hands. "Suppose I said: *Lit, Ailo. Brightest of all.*"
HESPER: "And suppose a week later he went into the water."
HESPER: "I think I gave him permission." The mug is shaking very slightly. "That's what I told him that I shouldn't have. Permission."
@set knows_confession
@add hesper 1
@clue confession A week ago the Warden asked the Deaconess whether a man who goes into the water to save others puts out his lantern, or lights it. She told him: lit, brightest of all. She fears she gave him permission.
@xp 20
* "He wasn't asking permission to die. He was asking whether it would count." -> cp_conf_count
* "You told him the truth. Brightest of all." -> cp_conf_truth
* [Say nothing. Put your hand over hers.] -> cp_conf_hand

== cp_conf_count
@if knows_rope
HESPER: "Count." She turns the word over. "He didn't mean to die, did he. You know something." She searches your face. "He meant to come back up."
> You tell her about the rope — only what she needs: that he went down to bring something up, and that when it went wrong he cut himself loose so that the girl holding him would not be pulled in.
HESPER: She closes her eyes. Her lips move. It is not any prayer you know. "Brightest of all," she says. "The stupid, stubborn, *brave*—" She stops. "Thank you, child."
@add hesper 2
@morale 1
@else
HESPER: "Whether it would count." She considers that. "Yes. Yes, that sounds like him. He always wanted to know if things counted. He asked me once if fish in the plate counted."
@add hesper 1
@endif
=> cp_talk

== cp_conf_truth
HESPER: "The truth." She laughs a little, wetly. "I'm a deaconess, child. I haven't told the plain truth since the Fever Years. I tell the useful truth." She wipes her eyes with the heel of her hand. "But I think that one might have been both."
@add hesper 1
=> cp_talk

== cp_conf_hand
> Her hand is small and dry and very warm from the tea. She doesn't look at you. After a while she turns her hand over under yours and holds on.
@add hesper 2
@add thaw 1
=> cp_talk

// ---------------------------------------------------------------- the body
== cp_body
> You fold back the sheet.
> Under the candlelight he looks smaller than he did through the ice, as the dead always do when you can touch them. The water has drained from his clothes and frozen in the wool in fine white lace. His eyes have been closed — the Deaconess's doing. His left arm is still raised, rigid, the split knuckles pale.
> His right hand is a fist.
HESPER: "I tried to open it." She hasn't moved from her stool. "It won't. I didn't like to force it."
SCRUTINY: Froth at the nostrils: drowning, not cold. Wrinkled pads on the fingertips — hours in water. And at the waist, where the rope was tied, a deep bruise all down the left side, ridged, purple-black. The rope did not pull him *up*. It pulled him *sideways*, and hard.
?{pass("ARCHIVE", 10)} ARCHIVE(10): The fist: cadaveric spasm. It happens when a man dies in the middle of a great effort — gripping something he means not to let go of. It sets at the moment of death and does not relax. Whatever is in that hand, he was holding it on purpose.
@clue bruise The Warden drowned. A deep bruise at his waist shows the rope dragged him sideways, hard. His right fist is clenched in a death-grip around something.
@xp 10
* [SINEW 10] [Force the fingers open.] -> cp_fist_force | cp_fist_force_f
* [SLEIGHT 10] [Find the tendon at the wrist, and press.] -> cp_fist_sleight | cp_fist_sleight_f
* "Deaconess. Would you hold his hand? Warm it." -> cp_fist_warm
* [UNDERTOW 12] [Speak to him.] -> cp_speak | cp_speak_f

== cp_fist_force
> It takes more strength than it should. The fingers come open one at a time with small wooden sounds you will hear again tonight when you close your eyes.
HESPER: She makes a sound and turns her face away.
@add hesper -1
=> cp_fist_open

== cp_fist_force_f
> You pull. The fingers do not move. A dead man's fist is stronger than a living man's arm; you knew that. You pull harder, and something in your own hand gives instead, a hot bright twist in the thumb.
@health -1
=> cp_body_retry

== cp_fist_sleight
> Two fingers at the inside of the wrist. You find the cord of the tendon, press, and turn — a trick an old anatomist taught you in your first year on the Bench, for exactly this. The fist loosens like a knot that has been waiting for the right question.
=> cp_fist_open

== cp_fist_sleight_f
> You press where the tendon should be. It isn't there — or you're not where you think you are. Your fingers are cold. The fist stays shut.
=> cp_body_retry

== cp_body_retry
* "Deaconess. Would you hold his hand? Warm it." -> cp_fist_warm
* [SINEW 10] [Try again. Harder.] -> cp_fist_force | cp_fist_force_f

== cp_fist_warm
> She gets up off her stool, slowly, with a noise of old knees. She takes the dead man's fist between her two small hands, the way you would hold a bird, and holds it against the front of her habit, over her heart.
HESPER: She says something in Rime, badly. Then in plain speech: "Come on, Ailo. Let go now. You can let go now."
> It takes a long time. You don't hurry her. The thousand flames lean and straighten. And at last the fingers loosen, one by one, the way a hand lets go of a railing at the top of a long stair.
@add hesper 2
@add thaw 1
=> cp_fist_open

== cp_fist_open
> In his palm, pressed into the skin so hard it has left a mark: a clump of ice the size of a hen's egg.
> Not a lump. A *bundle*. Long clear needles standing side by side, like matches in a box, like the pipes of a tiny organ. As the warm air of the tent touches them they begin, very slowly, to lean apart.
BAROMETER: Candle ice. From *underneath*. He went down and broke off a piece of the rot, and he held on to it all the way to the end.
ILSE: She is already moving. Her handkerchief. A jam jar from the Deaconess's shelf. She packs it with clean snow from the tent's edge, lays the bundle of needles in it, seals it, and holds it out to you in both hands like something from an altar. "It'll keep, in the snow. For a while."
UNDERTOW: He got it. He got the piece. He was bringing it up to put on Odile's bar.
UNDERTOW: He is still bringing it up. You're carrying it now.
@set proof_fist
@set knows_candle
@clue proof A piece of candle ice from under the Glass, found in the Warden's death-grip. It falls apart in warm air. Proof of the rot.
@xp 30
=> cp_talk

== cp_speak
UNDERTOW: Lean close. Closer. The dead don't speak, of course. But you have been listening to things that don't speak for forty-four years, and some of them have a great deal to say.
> The candle flames go very still.
SARRE: *...Marrow boy.* The voice is the ice-hum under the Glass, the creak of a hut on runners, rope running out through a gloved hand. *You got tall.*
* "Warden." -> cp_speak_2
* "You're not real." -> cp_speak_real

== cp_speak_real
SARRE: *No. I'm the part of me you've got. Take it or leave it. It's cold in here.*
=> cp_speak_2

== cp_speak_2
SARRE: *Did I get it? The piece. I had it. I had it in my hand. Then the water turned round and walked off with me, like a dog with a boot.*
* "You got it. You're still holding it." -> cp_speak_3
* "Why didn't you let go of it? You could have swum back." -> cp_speak_why

== cp_speak_why
SARRE: *Couldn't find the hole. You can't, from underneath. Everything's the same colour. You go toward the light and it's the wrong light — it's Odile's chandelier.* A sound like a laugh, or ice shifting. *So I went toward Odile. Always did.*
=> cp_speak_3

== cp_speak_3
SARRE: *Tell the girl it was the rope's fault. She'll think it was hers. It wasn't. Tell her.*
SARRE: *And, Marrow boy—*
> The flames lean all together, as if something very large has breathed out.
SARRE: *—open the hand.*
UNDERTOW: And that's all. That's all there is of him. The rest went down the seam toward the Narrows with the warm water.
@set spoke_to_dead
@add thaw 1
@xp 15
* [Open the hand.] -> cp_fist_warm_self
* "Deaconess. Would you hold his hand? Warm it." -> cp_fist_warm

== cp_fist_warm_self
> You take the fist in both your hands and hold it, and you don't pull, and you don't press anything, and you don't say anything at all. After a while — longer than seems reasonable, not as long as you feared — the fingers open by themselves.
=> cp_fist_open

== cp_speak_f
UNDERTOW: Nothing. A dead man under a sheet, and a lot of candles, and you with your head bent close to his like a fool.
HESPER: Kindly: "They don't answer, child. I've asked."
=> cp_body_retry

// ---------------------------------------------------------------- the carpet
== cp_fetch
HESPER: "Under a *carpet*." She sets the mug down so hard the tea jumps. "I went out there. I knelt on it. Odile's boy came and asked me to kneel somewhere else because I was 'blocking the line'." She is trembling with rage, all four and a half feet of her. "I want him in here, Examiner. With a flame at his head. Not out there being walked round."
* [Send for the cutters. Have him brought in.] -> cp_fetch_yes
* "He's evidence where he is. I'm sorry." -> cp_fetch_no

== cp_fetch_yes
@time 20
@unset body_carpet
@set body_cut
@add hesper 2
@add bran 1
@add odile -1
> It takes twenty minutes. Brannock Kell comes himself, with four men and two saws. Odile does not come out, but a curtain moves in the gallery. They roll the crimson runner back like a tongue, cut him out — the saws singing on top and silent at the bottom — and carry him in with his hand still raised, and lay him on the trestles, and Hesper covers him with a sheet and sets a jar-lamp at his head.
@if !clue("soft_cut")
BRAN: On his way out, low: "Bottom of that cut went like cake, Examiner. Clean saw. Never had a clean saw in Deepwinter."
@clue soft_cut When the cutters sawed the Warden out, the bottom of the ice cut "like cake". Brannock Kell says the ice is rotten underneath.
@endif
HESPER: "There." She sits down again, suddenly very old. "There, now."
=> cp_talk

== cp_fetch_no
HESPER: "Evidence." She says it the way you'd say the name of a disease. "Well. You'd know." She picks up her tea. It is not an absolution.
@add hesper -1
=> cp_talk

// ---------------------------------------------------------------- Feliks
== cp_feliks
HESPER: She looks up at you for a long moment. Whatever she sees makes her put the mug down.
HESPER: "Child," she says. "That's the only kind we light."
> She takes a jar from the shelf — an ordinary jam jar, the label soaked off — and a stub of candle, and she hands them both to you, and a spill of paper, and she points at the brazier.
HESPER: "His name?"
* "Feliks. Feliks Marrow." -> cp_feliks_2
* [You can't say it. Hand her the spill instead.] -> cp_feliks_silent

== cp_feliks_2
> Saying it out loud in a church, even a church made of canvas on the ice, is different from saying it anywhere else. The name goes up into the smoke-dark roof of the tent and stays there.
=> cp_feliks_3

== cp_feliks_silent
HESPER: She takes the spill without comment and lights it from the brazier and hands it back. "The Saint knows his name," she says. "She was listening when you didn't say it."
=> cp_feliks_3

== cp_feliks_3
> You light the stub of candle. Your hand is not steady; it takes three tries. You set it in the jar, and she takes the jar from you and sets it among the thousand others, near the front, where the Warden's lamp is.
HESPER: "There. Now someone's carrying him." She sits back down. "Forty-four years is nothing, on the dark water. The dark water hasn't got clocks."
UNDERTOW: A flame among a thousand flames. You couldn't find it again if you tried. That is exactly right. That is exactly how it should be.
@set lit_feliks
@add thaw 2
@morale 1
@xp 15
=> cp_talk
`);
