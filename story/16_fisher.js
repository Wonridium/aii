CANDLE.script(String.raw`
== fi_enter
@bg fisher
@title THE MAGISTRATE'S HOLE
@sfx footsteps
@if seen("fi_enter") > 1
@time 15
=> fi_return
@endif
@time 25
> Out past the last huts on the north side, where the lanterns thin to a single string and then to nothing, someone has built a windbreak of sailcloth on three poles. Inside it, on a folding stool, wrapped in what appears to be three separate overcoats, an old man sits over a round black hole in the ice with a short rod held between his knees.
> A sign is propped against the windbreak, painted with enormous care: PLEASE DO NOT DISTURB THE MAGISTRATE.
TOMASZ: Without looking up: "Shh. He's listening."
* "Who is?" -> fi_who
* [Sit down on the upturned bucket beside him. Say nothing.] -> fi_sit
* "Inquest Office. I'm the Examiner." -> fi_office

== fi_who
TOMASZ: "The Magistrate." A nod at the hole. "Sits below in judgment of all that passes above him. Has never once been moved by an argument." He finally looks up: a long, clever, ruined face, spectacles mended with fishing line. "You're very tall. Your shadow is on the water. Could you — thank you."
=> fi_talk

== fi_sit
> You sit on the bucket. It is very cold and not quite level. The old man glances at you sideways, then back at the hole, and for a while the two of you watch the black water together, not speaking, like two men at a very slow play.
TOMASZ: At last, approvingly: "You know how to sit still. That's rarer than you'd think. Most people who come out here talk. The fish can hear talking. So can I."
@add tomasz 2
=> fi_talk

== fi_office
TOMASZ: "Yes. I saw the sleigh." He doesn't look up. "The Magistrate doesn't recognise the Inquest Office, I'm afraid. He's a very old-fashioned jurist. He recognises patience and a live minnow."
=> fi_talk

== fi_return
TOMASZ: "The Examiner returns." He hasn't moved. You suspect he hasn't moved in hours. "The Magistrate is still in chambers."
=> fi_talk

== fi_talk
+ {!seen("fi_mag")} "Tell me about the Magistrate." -> fi_mag
+ {!seen("fi_fish")} [There are dead fish lying on the ice around the hole. Look at them.] -> fi_fish
+ {!seen("fi_warden")} "Did you know the Warden?" -> fi_warden
+ {!seen("fi_past")} "You don't talk like a fisherman." -> fi_past
+ {seen("fi_past") && !seen("fi_moth")} "Perrin Moth. Do you know him?" -> fi_moth
+ {seen("fi_fish") && !tomasz_moved && !seen("fi_move_no")} "Tomasz — your hole is on the seam. You need to move." -> fi_move
+ {seen("fi_fish") && !seen("fi_eat")} [He's offering you a perch, cooked.] -> fi_eat
+ [Leave him to the Magistrate.] -> fi_leave

== fi_mag
TOMASZ: "Eleven winters." He says it the way other men say the name of a woman. "A pike. One hundred and twenty centimeters, by my estimate, though estimates are my weakness — I've had him on the line four times and never once out of the water."
TOMASZ: "He has taken my hook. My lure. My second-best lure. And on one occasion, my spectacles, which I was holding over the hole to get a better look at him. He took them from my hand. Very gently. Like a clerk accepting a document."
TOMASZ: "I named him the Magistrate that night. Because he sits beneath us all, in the dark, and judges, and takes what he likes, and is never, ever moved."
UNDERTOW: A long green shape under the ice, very still, with an old man's spectacles somewhere in its belly. We like him already.
* "And if you catch him?" -> fi_mag_catch
* "Eleven years is a long time to wait for one fish." -> fi_mag_long

== fi_mag_catch
TOMASZ: "I'd put him back." Immediately. "Good heavens. What would I do with a Magistrate on the ice? Hang him in the Customs House? No. I'd look at him — once, properly, in the light — and say, *there you are*, and put him back."
TOMASZ: "It isn't about the catching, Examiner. It's about having something under the ice that's worth waiting for."
@thought magistrate
=> fi_talk

== fi_mag_long
TOMASZ: "Is it? You've been waiting longer for something, I'd guess." He doesn't look at you when he says it. "You have the posture. The fishing posture. Shoulders round the thing you're waiting for, so the wind doesn't take it."
KEEL: He's right. You've been sitting over a hole in the ice for forty-four years with a line down, very still.
@thought magistrate
=> fi_talk

== fi_fish
> Around the hole, laid out on the ice in a neat row as if for a fishmonger's slab, are fish. Perch. Roach. A bream the size of a hymnal. None of them caught — none of them have hook marks. Their eyes are milky. Their flesh is pale and slightly flaky at the gills, the way fish look when they have been gently poached.
TOMASZ: "They've been coming up all week. Belly first. I lay them out so the gulls can't have them. It seems only decent." He prods the bream with his boot. "Cooked, Examiner. The Basin is *cooking* them. Dip your hand in my hole."
> You take off a glove. The water in the fishing hole is warm — warmer than your hand.
BAROMETER: Along the seam. Of course. He's sitting on it. His little hole hasn't frozen over in a week, and he thinks that's good luck.
@set knows_fishkill
@clue fishkill Fish are floating up dead along the seam — "cooked," says Tomasz. The water in his fishing hole is warm to the touch.
@if !knows_seam
@set knows_seam
@clue seam A seam of warm water runs under the Glass. The ice above it is rotting.
@endif
@xp 15
=> fi_talk

== fi_warden
TOMASZ: "Ailo." He's quiet for a moment. "He came by three nights ago with his drill. Drilled a hole every twenty paces in a line, east to west, right past my windbreak. Looked at every core under his lantern like a man reading bad news in a letter."
TOMASZ: "He stopped here. He said, 'Tomasz, move your stool.' I said I'd been at this hole eleven years. He said, 'Then you've been lucky eleven years.'" A pause. "I didn't move. I thought he wanted my hole for himself. He's always envied the Magistrate."
TOMASZ: "He left me a flag." He points: tucked behind the windbreak, a small red flag on a stick. *Keep off.* "I've been using it to wave at the gulls."
@clue red_flag The Warden planted a red flag — keep off — at Tomasz's fishing hole three nights ago. It lies on the seam.
@xp 10
=> fi_talk

== fi_past
TOMASZ: "Don't I?" He seems pleased. "What do fishermen talk like?"
* "Less precisely." -> fi_past_2
* "Like men who don't use the word 'estimate'." -> fi_past_2

== fi_past_2
TOMASZ: "Ha." He adjusts the mended spectacles. "Thirty-one years in the Tables, Examiner. The Great Mutual, Third Floor, Senior Valuer. I valued forty thousand souls. Births, deaths, marriages, occupations, district, habits. Cycling, a small deduction. Prayer, neutral."
TOMASZ: "Then I valued my wife."
> The rod doesn't move. The wind moves the sailcloth.
TOMASZ: "It's permitted. Relatives may be valued if a second valuer signs. She was dying — slowly, the lungs — and there was a question of the pension, and I sat at my desk on a Tuesday and computed her. Four thousand two hundred crowns."
TOMASZ: "I didn't like the answer. So I computed her again. And again. Eleven times, Examiner, on eleven fresh sheets, with the good pen. Four thousand two hundred, every time. The Tables don't make mistakes. That's their great virtue."
TOMASZ: "I resigned the next morning and bought a stool and a rod and came out here to sit above something I couldn't value. The Magistrate is priceless. I've checked."
* "That's the saddest thing I've heard tonight." -> fi_past_sad
* "The Tables weren't wrong. They just weren't answering your question." -> fi_past_q
* "Do you regret it?" -> fi_past_regret

== fi_past_sad
TOMASZ: "Then you haven't been listening to the right people. This is a comedy, Examiner. An old man, three coats, a fish that stole his spectacles. The *Evening Lamp* would run it on the back page between the tide tables and the missing dogs."
@add tomasz 1
=> fi_past_end

== fi_past_q
TOMASZ: He turns and looks at you properly for the first time. "...No. They weren't. They were answering *who pays*. I was asking *what was she*." He nods slowly. "You'd have been a good valuer. You'd have hated it."
@add tomasz 2
@align unpriced 1
=> fi_past_end

== fi_past_regret
TOMASZ: "Every day. And not once." He shrugs inside his coats. "That's the answer to most questions worth asking, in my experience. The Tables can't handle it. It's why I left."
@add tomasz 1
=> fi_past_end

== fi_past_end
@add thaw 1
@xp 10
=> fi_talk

== fi_moth
TOMASZ: "Perrin?" His face softens into something almost fatherly. "My junior clerk. Nineteen years old, fresh from the Academy, with the best hand in the building. He could do a column of forty figures in his head and never smudge the ink."
TOMASZ: "He came to see me out here, once. My first winter. Stood exactly where you're standing and asked me why. I told him about the eleven sheets." A pause. "He went very quiet. Then he said, 'Mr. Wick, I think I'd have done it a twelfth time.' And went back to the Tables."
TOMASZ: "He's very good, now, I hear. I'm sorry for him. Tell him — no. Don't tell him anything. Tell him the Magistrate's well."
@set knows_tomasz_moth
@xp 5
=> fi_talk

== fi_move
TOMASZ: "Move." He looks at the hole. At the neat row of cooked fish. At the red flag, leaning against his windbreak. "Ailo said that."
* [LEDGER 9] "You were a valuer. What's the probability this ice fails under you tonight?" -> fi_move_yes | fi_move_no
* [TENDERNESS 10] "The Magistrate's already gone, Tomasz. Look at the fish. Nothing lives down there now." -> fi_move_yes | fi_move_no
* {tomasz >= 2} "Please." -> fi_move_yes

== fi_move_yes
TOMASZ: He's silent for a long time. Then he reels in, slowly, hand over hand, and the hook comes up bare and glistening out of the warm black water.
TOMASZ: "Seventy percent, if I had to put a number on it. I don't like the number." He folds his stool with great dignity. "Eleven years. Well. The Magistrate will have to hold court without me."
TOMASZ: "I'll be at the Customs House steps if anyone needs a valuation. Free of charge, tonight. The first one ever."
@set tomasz_moved
@add tomasz 1
@xp 15
=> fi_talk

== fi_move_no
TOMASZ: "No, I don't think so." Mildly, as though declining a biscuit. "Eleven years, Examiner. If the ice wants me it can come and get me. I'll be the one with the rod."
=> fi_talk

== fi_eat
> He picks up a perch from the row — a small one, very pale — and holds it out to you on a square of newspaper. It is still faintly warm.
TOMASZ: "Poached in the Basin. It's the only good thing to come out of all this. A little salt—" he produces a twist of it from one of the coats — "and it's really quite superb."
APPETITE: It's a dead fish. Cooked by a poisoned harbor. Found floating. Eat it. *Eat it.*
* [Eat the perch.] -> fi_eat_yes
* "I'll pass, thank you." -> fi_eat_no

== fi_eat_yes
> You eat the perch. With salt. Standing on the ice at the edge of the lanterns, with your gloves off, the old man watching you with great interest.
> It is — you are appalled to discover — superb.
@health 1
@add tomasz 1
TOMASZ: "You see?" Delighted. "Nobody believes me."
=> fi_talk

== fi_eat_no
TOMASZ: "Your loss." He eats it himself, delicately, bones and all.
=> fi_talk

== fi_leave
@if !tomasz_moved
TOMASZ: As you go, without turning round: "Examiner. If it goes — tonight — and I'm still here. Tell Perrin the answer was always four thousand two hundred." A pause. "He'll know what it means."
@else
TOMASZ: He's packing his three coats into a bundle. "Customs House steps. Free valuations." He almost smiles. "Tell the Magistrate I'll be back in the spring."
@endif
=> hub2
`);
