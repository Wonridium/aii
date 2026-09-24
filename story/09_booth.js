CANDLE.script(String.raw`
== bo_enter
@bg booth
@music interior
@title THE GREAT MUTUAL — GLASS OFFICE (WINTER)
@if seen("bo_enter") > 1
@time 20
=> bo_return
@endif
@time 30
> A booth painted the green of a billiard table, no larger than a sentry box, with a brass plate on the door: THE GREAT MUTUAL ASSURANCE — CLAIMS & VALUATIONS — GLASS OFFICE (WINTER). Inside, a stove the size of a hatbox, a kettle, an adding machine with a brass handle, and shelf upon shelf of books bound in green cloth. The Tables.
> Pinned to the back wall: a long chart, ruled in violet ink. Names down one side. Numbers down the other. Eleven hundred and forty of them.
@if met_moth
MOTH: He is inside, of course, with a cup of something that steams. "Examiner. The booth's capacity is two. The Clerk may stand in the doorway, where she'll be warmer than she looks."
@else
MOTH: A thin man in a very good grey coat looks up from the adding machine. "Examiner Marrow. Perrin Moth, of the Great Mutual — claims and valuations. I was at the scene, but you didn't see me. People seldom do." He gestures at the other stool. "The booth's capacity is two. The Clerk may stand in the doorway."
@set met_moth
@endif
=> bo_talk

== bo_return
MOTH: "Examiner." The adding machine's handle comes down, *ka-chunk*. "You've brought me something, I hope. People only come back to the Mutual when they want to be paid or they want to argue."
=> bo_talk

== bo_talk
+ {!seen("bo_how")} "Explain the valuations to me. As though I were a child." -> bo_how
+ {!seen("bo_me")} "What am I worth, Mr. Moth?" -> bo_me
+ {!seen("bo_letters")} "The Warden wrote to you." -> bo_letters
+ {!seen("bo_glass")} "What is the Glass worth? All of it, tonight?" -> bo_glass
+ {!seen("bo_line")} "What Last Line does the Mutual want?" -> bo_line
+ {knows_mutual_clause && !seen("bo_clause")} "If I close the ice by lawful order, the Mutual pays the businesses." -> bo_clause
+ {!f_moth} "I want the Mutual to withdraw cover from anyone on the ice tonight." -> bo_withdraw
+ {!seen("bo_soft") && !seen("bo_soft_f")} [TENDERNESS 13] "You looked at him, at the scene. Once. Why?" -> bo_soft | bo_soft_f
+ [Leave the booth.] -> hub2

== bo_how
MOTH: He lights up like a lamp. "Every citizen of Aubade is valued at birth, revalued at twenty-one, and annually thereafter. Health. Trade. District. Parentage. Habits — drink is a deduction, marriage an addition, cycling a small deduction, prayer neutral. It's printed on the back of your papers."
MOTH: "When you die, the Mutual pays your valuation to whomever you've left. If you die by misadventure, in full. Unlawfully, in full, and then we collect from whoever did it. Self-inflicted, nothing. Open — we hold it, pending."
MOTH: "Before the Settlement, a man's death was worth whatever his employer's conscience said it was. Which was usually a ham." He smiles. "Now it's worth a number. Numbers don't feel anything, Examiner. That is their great mercy. A number cannot be disappointed in you."
@thought price
* "That's the most beautiful horrible thing I've ever heard." -> bo_how_bh
* "And a man who's worth nothing?" -> bo_how_nothing
* "It's fair. It's the only fair thing in the city." -> bo_how_fair

== bo_how_bh
MOTH: "Thank you." He seems genuinely touched. "Most people only manage one of those."
=> bo_talk

== bo_how_nothing
MOTH: "Nobody's worth nothing. The minimum valuation is four hundred crowns. The price of a burial and a month's rent." He sips. "We're not monsters. We're merely thorough."
@align unpriced 1
=> bo_talk

== bo_how_fair
@align actuarian 1
@add moth 1
MOTH: "It is." Quietly, as though you had agreed with him about a piece of music. "Nobody else will tell you so. They'll tell you it's cold. But cold things keep."
=> bo_talk

== bo_me
MOTH: He doesn't need to look it up. He does anyway, for the ceremony of it: a green volume, a finger down a column. "Marrow, Aurel Anselm. Examiner, Third Bench. Eleven thousand, four hundred crowns."
MOTH: "Reduced last autumn by nine hundred." He closes the book. "The Tables call it a psychological discount. I'm sorry. It isn't personal. That's rather the point."
STARCH: Nine hundred crowns. For four minutes of laughing and an hour in the snow. It's almost reasonable, which is the worst thing about it.
* "Who gets it? If I die tonight?" -> bo_me_who
* "Then I'll try not to cost you anything." -> bo_me_try
* "What are *you* worth, Moth?" -> bo_me_moth

== bo_me_who
MOTH: "Your file lists no dependants. No spouse — divorced, nine years. No children. No siblings." He pauses. "No siblings. In the absence of dependants the valuation reverts to the Mutual." A very small smile. "You'd be leaving it to us, Examiner. We'd be very grateful."
?{brother_entered} ILSE: From the doorway, not loudly: "His file lists a brother. As of tonight."
?{brother_entered} MOTH: He looks at her. Then at you. Then he opens the green book again, and after a moment writes something in the margin in pencil. "So it does."
@morale -1
=> bo_talk

== bo_me_try
MOTH: "Please do. Examiners are terribly expensive. You get so many letters."
=> bo_talk

== bo_me_moth
MOTH: "Nine thousand and eighty." Immediately. "I check every morning. Like weighing oneself." He turns the cup in his hands. "It rose forty last year. I've given up sugar."
=> bo_talk

== bo_letters
MOTH: "Three letters. In pencil, on fish paper." He takes them from an inside pocket — not from a file, you notice, but from an inside pocket. "He wanted the Mutual to value the ice. 'The ice is a policyholder,' he wrote. 'It carries more lives than any ship in the harbor and nobody has ever once valued it.'"
MOTH: "I wrote back asking for figures. He sent figures. Thickness at seven holes. I wrote back asking for *better* figures — loads, rates of decay, water temperature beneath the sheet. He wrote: *the ice does not do better figures.* I wrote: *the Mutual only does figures.*"
MOTH: He puts the letters back in his pocket. "I've read that exchange nine times today, Examiner. I'd like it noted that I don't usually read things nine times."
@set moth_letters
@clue moth_letters The Warden wrote to the Mutual three times, asking it to "value the ice". Moth asked for better figures. The Warden said the ice doesn't do better figures.
=> bo_talk

== bo_glass
MOTH: *Ka-chunk.* "Eleven hundred and forty policyholders resident on the Glass. Average valuation three thousand six hundred. Plus the Ball — six hundred more in one building at midnight, rather better valued, dancers are young." *Ka-chunk.* "Call it six and a half million crowns, standing on the Basin tonight."
MOTH: "Which is why I'm here, Examiner. Not for one Warden. For six and a half million crowns on a floor."
@set knows_glass_value
=> bo_talk

== bo_line
MOTH: "The Mutual wants the correct line." He folds his hands. "But since you ask me as a man: self-inflicted saves three thousand nine hundred crowns. It also tells the city the ice is sound, and a drunk jumped. Misadventure costs three thousand nine hundred, and tells the city the ice may not be sound."
MOTH: "And a city that believes the ice may not be sound makes claims. You see my difficulty. It isn't the Warden. It's what the Warden *means*."
OBJECTION: He wants the Glass to be safe on paper, because paper is where he lives. Whether it's safe under the paper is a separate department.
MOTH: "And of course, if the *Crown* were to close the ice — by lawful order — schedule four would oblige us to pay every business on the Glass for its lost night. Castellane included. Whereas if they close themselves..." He spreads his hands. "Nothing. Voluntary loss. It's a very old clause. Nobody reads it."
@if !knows_mutual_clause
@set knows_mutual_clause
@clue clause A Mutual business policy pays for closure "by lawful order" — but not for a voluntary cancellation. If the Examiner closes the ice, Odile is covered. If she cancels, she is ruined.
@endif
=> bo_talk

== bo_clause
MOTH: "Closure by lawful order. Business interruption, schedule four." He smiles, pleased you've read the small print. "Yes. If the Crown shuts the Glass, the Mutual pays Castellane her night, and the bathhouse its week, and the eel-woman her cones. Sixty thousand crowns, perhaps, in all."
MOTH: "Sixty thousand against six and a half million." He watches you. "Bring me a reason to believe the six and a half million is at risk, Examiner, and I'll carry your writ to the printer myself."
=> bo_talk

== bo_withdraw
MOTH: "Withdraw cover." He sets down the cup. "Do you know what that would mean? Every soul on the Glass would be walking about uninsured. They'd be off the ice in twenty minutes. Not for their lives — for their *numbers*." He almost laughs. "It's the most powerful sentence the Mutual can say. We say it perhaps once a decade."
MOTH: "I'll need figures."
* {has_logbook} [LEDGER {11 - (thought("price") ? 2 : 0) - (has_log ? 1 : 0) - (proof_fist ? 1 : 0)}] "Here are your better figures." [Give him Quell's private log.] -> bo_w_yes | bo_w_no
* {!has_logbook && (has_log || proof_fist)} [LEDGER {14 - (thought("price") ? 2 : 0) - (has_log ? 1 : 0) - (proof_fist ? 1 : 0)}] "Thickness means nothing. The ice is rotten from beneath — here's the Warden's own log." -> bo_w_yes | bo_w_no
* {thought("price")} "Six and a half million crowns on a floor made of sugar, Mr. Moth. Do the arithmetic." -> bo_w_price
* "Not yet." -> bo_talk

== bo_w_price
@if has_logbook || has_log || proof_fist
=> bo_w_yes
@endif
MOTH: "Beautifully put. I'll have it embroidered." He picks his cup back up. "Now bring me something with a *number* in it."
=> bo_talk

== bo_w_yes
@if has_logbook
> You lay the sailing-ship exercise book on the adding machine. He reads it the way other men read love letters: once quickly, once slowly, then again with a pencil.
MOTH: "Thirty-four degrees." Very softly. "Into the Basin. For six weeks." *Ka-chunk. Ka-chunk.* He is working the handle faster than you have seen anyone work anything.
@else
> You give him the Warden's measurements — the cores, the candling, the seam — and he takes them without his usual smile and bends over them with a pencil.
@endif
MOTH: "Rate of decay along the seam... under a moving load... six hundred at the Ball concentrated on a sprung floor over..." He stops. He looks up. For the first time since you met him, he looks like a man who has seen a ghost.
MOTH: "Thirty-eight percent that the seam fails before two o'clock. Seventy by dawn." He says it very quietly. "Seventy percent, Examiner. On six and a half million."
MOTH: "The Warden was right. He was right, and I asked him for better figures." He sits back. "The ice doesn't do better figures."
> He takes a sheet of the Mutual's heavy cream notepaper and writes on it in a clean, fast, beautiful hand, and signs it, and blots it, and hands it to you.
DOC: NOTICE. The Great Mutual Assurance withdraws all cover from any policyholder remaining on the ice of the Basin after one o'clock this morning. By order. — P. Moth, Claims & Valuations.
MOTH: "I'll have it posted at the gate and read out at the Chandelier. And Examiner—" He hesitates. "Tell the Warden's girl the Mutual will be honouring his valuation. Whatever you write. Put it down to a clerical error. I'm very good at clerical errors, when I want to be."
@set f_moth
@add moth 2
@clue moth_notice The Mutual will withdraw all cover from anyone still on the ice after 1 a.m. Moth will post and announce it.
@xp 30
=> bo_talk

== bo_w_no
MOTH: He considers your figures for a long time. Then he shakes his head. "Suggestive. Not conclusive. The Mutual doesn't withdraw cover from six and a half million crowns on *suggestive*, Examiner. I'd be dismissed by breakfast, and rightly."
MOTH: "Bring me temperatures. Loads. Something that isn't an old man's feeling. And I'll run it again."
=> bo_talk

== bo_soft
MOTH: He is quiet for a long time. The stove ticks. Ilse, in the doorway, has stopped writing.
MOTH: "I look at all of them, Examiner. Once. So that I know what the number was for." He turns his cup a quarter-turn on the table. "My mother was valued at nine hundred crowns. A laundress. When she died I asked the Tables to recompute her. I had reasons. I had *arguments*. They declined."
MOTH: "I've been asking them things ever since. It's why I'm very good at my job." He looks at you. "Please don't enter that, Clerk."
ILSE: "Not entered."
@add moth 2
@add thaw 1
@xp 15
=> bo_talk

== bo_soft_f
MOTH: "Did I?" He smiles thinly. "Then I must have been checking he was the right man. We do hate to pay the wrong estate."
=> bo_talk
`);
