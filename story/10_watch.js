CANDLE.script(String.raw`
== wa_enter
@bg watch
@music interior
@title THE GLASS WATCH-HOUSE
@if seen("wa_enter") > 1
@time 15
=> wa_return
@endif
@time 25
> A hut the size of a large wardrobe, with a bell on the roof and a sign over the door — GLASS WATCH — painted by someone who ran out of room for the H and had to make it small. Inside: a cot, a stove, a desk, a rack with one truncheon in it, and on the wall, in a gilt frame, a portrait of the Hearth-King in his fur crown, gazing mildly into the middle distance.
> On the desk, face down and much-thumbed, lies a copy of *The Examiner's Handbook (Revised)*.
PIM: He is at the stove, making tea in a saucepan. He turns so fast he nearly throws it. "Sir! You came to the — sir! Sit, sir, there's only the cot, I'm sorry, sit on the cot—"
DECORUM: Sit on the cot. Accept the tea. Whatever it is, accept it.
@if pim_guilt
TENDERNESS: He's been sitting in here alone since you arrived, waiting for you to come and ask him where he was at three o'clock.
@endif
=> wa_talk

== wa_return
PIM: "Sir!" He is on his feet before you are through the door. "Is there anything — anything at all —"
=> wa_talk

== wa_talk
+ {!seen("wa_tea")} [Accept the tea.] -> wa_tea
+ {!seen("wa_book")} [Pick up the *Examiner's Handbook*.] -> wa_book
+ {!seen("wa_night")} "Where were you at three o'clock this morning, Constable?" -> wa_night
+ {!seen("wa_bell")} "The Warden told you to ring the bell. You said you needed a reason." -> wa_bell
+ {!seen("wa_king")} [Look at the portrait of the Hearth-King.] -> wa_king
+ {(has_log || knows_candle || proof_fist) && !pim_ready} "If the ice goes tonight, I'll need you." -> wa_need
+ {!seen("wa_quiz")} [Pim is holding the Handbook out to you, hopefully.] -> wa_quiz
+ [Leave the watch-house.] -> hub2

== wa_tea
> It is tea in the sense that it was once near some tea. It is also very sweet and very hot and served in a tin mug with GLASS WATCH painted on the side, and your hands close around it gratefully.
PIM: "I put four sugars in, sir. For the cold. The Handbook says an Examiner should maintain his *strength*."
APPETITE: Four sugars. He's a good boy. He's a very good boy.
@health 1
@add pim 1
=> wa_talk

== wa_book
> *The Examiner's Handbook (Revised)*. Someone has underlined whole paragraphs in pencil, and written in the margins in a round careful hand: *YES.* and *remember this!!* and, beside the section on the deportment of the Examiner at the scene of a death, *like Marrow at the bell tower.*
PIM: He has gone scarlet to the ears. "I'm studying for the Examiners' Board, sir. Next spring. I've failed it twice." A pause. "Three times. The third time I got the Inquest Act backwards. I mean I wrote it backwards. By accident. It's harder than it sounds."
* "Would you like me to sign it?" -> wa_book_sign
* "The Board is a formality. The work is what matters." -> wa_book_work
* "Maybe the Glass needs a constable more than the Bench needs another Examiner." -> wa_book_glass

== wa_book_sign
PIM: For a moment he can't speak at all. Then he fumbles a pencil into your hand. You sign it on the flyleaf: *To Constable Vandersloot, who stayed at his post. — A. Marrow, Third Bench.*
PIM: He reads it three times. "Who stayed at his post," he says, very quietly. And then his face does something that makes you understand you've written the one sentence he can't bear. "I didn't, sir. Not last night."
@add pim 1
=> wa_night

== wa_book_work
PIM: "The work." He looks at the Handbook, then at you, as if you'd told him a secret. "Yes, sir. The work."
@add pim 1
=> wa_talk

== wa_book_glass
PIM: He looks as though you've slapped him and kissed him at the same time. "The Glass doesn't need me, sir. The Glass needs the Warden. I'm just the boy who writes down who stole whose eels."
TENDERNESS: That hurt him. It was also, possibly, true. He'll be turning it over for years.
=> wa_talk

== wa_night
PIM: He sits down on the cot, abruptly, as if his strings had been cut. "Asleep, sir." He stares at the stove. "I'd been up three nights. The ice has been laughing, all week, sir, all night, and I couldn't sleep for listening to it, and the Deaconess gave me a sleeping draught."
PIM: "Tammas and the Dutchman came and knocked at ten past three. They saw a light under the ice. I didn't wake up. I found their note at seven." He reaches under the Handbook and holds out a scrap of paper, and his hand is shaking. "It says *LIGHT UNDER ICE — WARDEN'S WAY — COME.* I wrote it in the incident book at seven. Late."
@set knows_light
@clue light At 3:10 a.m. two cutters saw a light moving under the ice from the Warden's hut toward the Chandelier. They knocked at the watch-house; the constable, drugged asleep, did not answer.
PIM: "If I'd woken up—"
* "He was already dead by the time they knocked. You couldn't have saved him." -> wa_night_dead
* "Yes. You should have been awake." -> wa_night_cold
* [KEEL 10] "You'll be awake tonight. That's the only thing you can do about last night." -> wa_night_keel | wa_night_dead

== wa_night_dead
LEDGER: True, as far as it goes. Three-twelve into the water. Three-ten, a light moving. By the time anyone could have reached the Chandelier's steps with a pick, he would have been gone.
PIM: "Maybe." He doesn't believe you. He wants to, which is not the same. "Thank you, sir."
@add pim 1
=> wa_talk

== wa_night_cold
PIM: "Yes, sir." He takes it like a soldier takes a sentence. Then he stands up and puts the note in his breast pocket and buttons the pocket over it, very carefully. "I'll be awake tonight, sir."
@add pim -1
=> wa_talk

== wa_night_keel
KEEL: Say it plainly. Say it the way someone should have said it to you, at twelve, wrapped in a stranger's coat on the ice.
PIM: He looks up at you. Something in his face — some post he's been leaning against all day — takes his weight again. "Yes, sir." He stands. "Awake tonight."
@add pim 2
@set pim_steadied
=> wa_talk

== wa_bell
PIM: He goes very pale. "How do you—" Then: "The log. He kept a log." He puts his face in his hands. "Nine days ago. He came in here and he said, 'Ring the Break Bell, Pim.' That's *this* bell." He points at the ceiling. "Emergency. Everybody off the ice. It hasn't been rung in twenty years."
PIM: "And I said — I said, 'I need a reason, Warden. The Handbook says a constable can't ring the Break Bell without cause. Ringing it false is six months.' And he looked at me, and he said—"
PIM: "'I'll give you a reason.'"
> The stove ticks. Over your heads, the bell hangs in the dark, and does not move.
UNDERTOW: He gave him one.
@set knows_breakbell
@clue breakbell Nine days ago the Warden asked Pim to ring the watch-house Break Bell — emergency, everyone off the ice. Pim said he needed a reason. The Warden said: "I'll give you a reason."
@add thaw 1
=> wa_talk

== wa_king
> The Hearth-King: a folk-king of the old Rime and Littoral winters, before the Settlement, before the Mutual. The portrait is a cheap print, the kind sold at fairs. A mild bearded face under a crown of white fur. Someone has tucked a sprig of dried heather behind the frame.
PIM: "My grandmother's." He straightens the frame, though it was straight. "I know he's not — I know there isn't one. Not really. But the Hearth-King looked after his people. That's the story. Nobody had a number. You were just *his*."
* "That's a good story." -> wa_king_good
* "The Mutual looks after people too. With numbers." -> wa_king_mut
* "Nobody should belong to anybody, Constable. Not even to a king." -> wa_king_unp

== wa_king_good
@align hearther 1
@add pim 1
PIM: "It is, isn't it." He looks at the mild painted face. "I think about it when the ice laughs."
=> wa_talk

== wa_king_mut
@align mutualist 1
PIM: "Yes, sir." Dutifully. Then, less dutifully: "My aunt got fourteen hundred crowns for my uncle. She says she'd rather have had him." He shrugs. "But you can't have him. So."
=> wa_talk

== wa_king_unp
@align unpriced 1
PIM: He looks startled. "No, sir. I suppose not." He touches the heather. "But it's nice to think somebody's minding the whole thing. Isn't it? Even if nobody is."
=> wa_talk

== wa_need
PIM: "Need me?" It comes out as a squeak. He clears his throat. "Need me, sir. Yes, sir. For what, sir?"
> You tell him: the seam, the rot, the Ball. What might happen. What might have to be done.
PIM: He listens. He goes paler and paler. When you've finished he is quiet for a while. Then: "The safe way off. From the Chandelier to the shore. It isn't the straight way — the straight way crosses the seam. It's the blue flags. Round by the Warden's north line. He showed me. Every constable's supposed to know it and none of us ever do." He swallows. "I know it."
@if pim >= 3 || pim_steadied
PIM: "I'll walk it now. Twice. So I can do it in the dark with six hundred people behind me." He is already reaching for his lantern. "And the bell, sir. If you give me the word, I'll ring the bell. I don't need a reason anymore. He gave me one."
@set pim_ready
@clue pim_route Constable Vandersloot knows the safe route off the Glass — the Warden's blue-flag line, which avoids the seam. He will walk it tonight, and ring the Break Bell on your word.
@xp 20
@else
PIM: "But sir — ringing the Break Bell false is six months. And leading people off the wrong way — if I'm wrong—" He looks at the Handbook as though it might tell him. "I'm not the Warden, sir. I'm not *you*. I'll — I'll try."
@set pim_maybe
@endif
=> wa_talk
`);
