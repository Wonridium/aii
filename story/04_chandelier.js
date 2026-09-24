CANDLE.script(String.raw`
== ch_enter
@bg chandelier
@music glass
@title THE CHANDELIER
@if seen("ch_enter") > 1
@time 20
=> ch_return
@endif
@time 30
> Inside, the Chandelier is a cathedral built by people who had never been allowed into one. A long hall of varnished timber, red plush along the walls, a sprung dance floor laid over the ice on a thousand short stilts. Waiters in white jackets polish glasses. Garlands of paper roses go up on poles.
> And above it all, the chandelier: a haywain of crystal and brass, hundreds of candles, and hung among the drops of cut glass — so you have to look twice to be sure — real icicles, long as a forearm, catching the light and dripping, very slowly, onto the floor below.
BAROMETER: They are dripping. Icicles do not drip at this hour in Deepwinter. The room is too warm, and the ice under the floor is warmer than it has any right to be.
DECORUM: Oh, but it's *lovely*. The proportions. The sprung floor. You could waltz here without your feet touching anything at all.
> On a low stage, a band is rehearsing: a cellist, a drummer with brushes, a trumpet with a mute in it, and an old man with an accordion so large he seems to be wearing it.
@if body_carpet
> Through the open doors you can see the crimson runner laid across the ice outside. People step around the middle of it without seeming to know that they're doing so.
@endif
@if body_cordon
> Through the open doors you can see the ring of lanterns on the ice, and the waiters steering early guests the long way round, to the side door.
@endif
WAITER: "Madame is in the gallery, Examiner." He points upward with a polishing cloth. "She said you'd come. She said to say she's not in."
=> ch_floor

== ch_return
> The hall is filling. Early guests in their good coats stand in clumps along the walls, pretending not to wait for something. The icicles on the chandelier drip. The accordion practises the same four bars over and over, as if trying to get them to confess.
=> ch_floor

== ch_floor
+ [Go up to the gallery.] -> ch_odile_up
+ {!seen("ch_benny")} [The old man with the accordion.] -> ch_benny
+ {!seen("ch_bar")} [The bar. It smells of cloves and hot wine.] -> ch_bar
+ [Leave the Chandelier.] -> hub2

== ch_bar
> The bar is a long plank of mahogany with a copper urn at one end steaming like a small locomotive. Spiced wine. Beside it, on trays, stacks of little golden cakes, each glazed and then cracked across the top in a spiderweb pattern.
APPETITE: Thaw-cakes. Honey cakes glazed with burnt sugar and cracked like spring ice. They make them once a year, for tonight. *Once a year*, Aurel.
WAITER: "On the house for the Examiner." He is already ladling.
* [Drink the spiced wine.] -> ch_bar_wine
* [Eat a thaw-cake.] -> ch_bar_cake
* [Decline. You are on duty.] -> ch_bar_no

== ch_bar_wine
> It is hot, and sweet, and it has something in it stronger than wine. It goes down into the cold place under your ribs and sits there glowing like a coal in a grate.
APPETITE: *Yes.* See? The world is not entirely ice. It never was.
STARCH: One cup. One. Your collar is watching.
@morale 1
@set drank
=> ch_floor

== ch_bar_cake
> The burnt-sugar glaze breaks under your teeth exactly like thin ice, and underneath it is honey and something like cardamom, and you are, for the length of one mouthful, eleven years old, before everything.
APPETITE: Before *everything*. Remember that you were once a person who was given cake.
@health 1
@set ate_cake
=> ch_floor

== ch_bar_no
WAITER: "Duty." He nods gravely and eats the cake himself.
STARCH: Correct. Admirable. The waiter disagrees, but the waiter is not the Crown.
=> ch_floor

== ch_benny
BENNY: The accordion sighs shut. "Benny Twelvetrees. Squeezebox. Thirty winters at this Ball, man and boy, mostly man." He has the face of a walnut that has heard a great many jokes. "You're the Examiner. You've got the look. Like a man who's come to measure the room for a coffin and found it's the wrong shape."
* "You knew the Warden?" -> ch_benny_sarre
* "What are you playing tonight?" -> ch_benny_play
* "The room is warm, isn't it." -> ch_benny_warm

== ch_benny_sarre
BENNY: "Every Thaw Ball for thirty years, the Warden came in at midnight exactly. Had one glass — one — stood in the middle of the floor, stamped his boot, and said 'good ice'. And we'd start the second waltz." He runs a thumb along the keys without pressing them. "Tonight — who says 'good ice'? Who do I wait for?"
UNDERTOW: Nobody. That is the answer. He is asking you so that someone else will have to say it.
@set met_benny
=> ch_benny_more

== ch_benny_play
BENNY: "'The Candle Waltz' to open. Always. Then 'Herring Girls', then 'The Long Freeze', then the second waltz when the Warden says." He shrugs. "After that, whatever keeps them dancing. You keep them dancing, they don't notice they're cold, or poor, or standing on the sea."
@set met_benny
=> ch_benny_more

== ch_benny_warm
BENNY: "Warm?" He looks up at the dripping icicles. "It's been warm in here all week. Madame's pleased. Saves on coal." He holds your eye a moment longer than a musician needs to. "I don't like it. The floor's got a hum in it I don't know the key of."
@set met_benny
=> ch_benny_more

== ch_benny_more
BENNY: "If you need a tune played, Examiner — anything, any time — you come find old Benny. A band can move a crowd better than a sergeant." He opens the accordion again, and the four bars start over. "Better than a priest, anyhow."
@set benny_offer
=> ch_floor

// ---------------------------------------------------------------- Odile
== ch_odile_up
@if seen("ch_odile_up") > 1
=> ch_odile
@endif
> A narrow stair behind the stage leads up to a gallery that runs the length of the hall. At its end, a small office walled in red velvet: a desk, a ledger, a cold cup of coffee, a vase of paper roses. From here you can see the whole floor through a gauze curtain, like a stage manager.
> Odile Castellane is standing at the curtain with a cigarette in a long holder, watching her Ball assemble itself below.
ODILE: Without turning: "The waiter told you I wasn't in."
* "He did. I came up anyway." -> ch_odile_open
* [DECORUM 10] "Then I'll speak to the Madame who isn't in, and she can pass it on." -> ch_odile_charm | ch_odile_open

== ch_odile_charm
ODILE: A noise escapes her that, in a younger woman, would have been a laugh. "Oh, you're *that* kind of Examiner." She turns. "Sit, then. The Madame who isn't in will pour you a coffee that isn't hot."
@add odile 1
=> ch_odile

== ch_odile_open
ODILE: "Of course you did." She turns. "Sit down, Examiner. You're making the room look short."
=> ch_odile

== ch_odile
+ {!seen("ch_o_sarre")} "Tell me about Ailo Sarre." -> ch_o_sarre
+ {(clue("shouting") || has_log) && !seen("ch_o_paid")} "You paid him to certify the ice." -> ch_o_paid
+ {!seen("ch_o_last")} "When did you last see him?" -> ch_o_last
+ {odile_knew && !knows_odile_past} "You won't look at his face. Why?" -> ch_o_face
+ {!seen("ch_o_money")} "What happens if there's no Ball tonight?" -> ch_o_money
+ {!f_odile} "Cancel the Ball, Madame." -> ch_o_cancel
+ {!danced && !seen("ch_o_dance_f")} [DECORUM 11] "Madame. The band is playing. Would you do me the honour?" -> ch_o_dance | ch_o_dance_f
+ [Take your leave.] -> ch_floor

== ch_o_sarre
ODILE: "The Warden." She taps ash into the cold coffee. "He certified my ice. Forty winters. We had an arrangement, the Glass and I and him. It worked."
ODILE: "He was a drunk, Examiner, and a very good judge of ice, and in the last few years only one of those at a time."
?{pass("TENDERNESS", 11)} TENDERNESS(11): She says his name the way you'd touch an old burn — carefully, around the edges, never in the middle.
=> ch_odile

== ch_o_paid
ODILE: "Everyone paid the Warden." She does not even bother to be offended. "It's called a *fee*. He called it a fee. Forty crowns and he walked the line with his drill and his flags and said 'safe'. And for thirty years it *was* safe."
* [OBJECTION 10] "On the second of Thawmonth you paid him forty crowns and a bottle to go away." -> ch_o_paid_obj | ch_o_paid_f
* "And this year?" -> ch_o_paid_f

== ch_o_paid_obj
@if has_log
OBJECTION: You have it from his own ledger. You quote it back to her, word for word: *Told O.C. the seam will go. She gave me 40 and a bottle and said go and sleep it off.*
@else
OBJECTION: A guess — a good one. Every bribe has a twin: the one to say yes, and the one to stop saying no.
@endif
ODILE: The cigarette holder stops halfway to her mouth. For a moment she looks every one of her years.
ODILE: "He left the bottle on my doorstep. Unopened." She says it quietly, to the gauze curtain. "Do you know, in thirty-five years, I'd never known him leave a bottle unopened."
@set odile_admits
@add odile 1
@clue odile_bribe Odile paid the Warden to go away when he warned her the ice would fail. He left the bottle on her doorstep, unopened.
@xp 10
=> ch_odile

== ch_o_paid_f
ODILE: "This year he wanted more. Like every year." She draws on the cigarette. "Every spring, a week before the Ball: 'the ice is bad, Odile.' Every spring, forty crowns: 'the ice is good.' It was a dance. We'd done it so long we didn't need to count the steps."
=> ch_odile

== ch_o_last
ODILE: "Last night." Too quickly. "One o'clock. He came up the kitchen stair. *Sober*, which was the frightening part. He said, 'The seam will go, Odile. Cancel it.' I told him the price had gone up again, had it, and I gave him money to go away."
ODILE: "He threw it in the snow. All of it. Then he went down the stair, and I heard him say something to the cook, and the cook laughed, and then he was gone."
* "What did he say to the cook?" -> ch_o_cook
* "Two hours later he went under the ice." -> ch_o_twohours

== ch_o_cook
ODILE: "'Tell her I'll show her tomorrow.'" She says it perfectly flatly, the way you would repeat an address. "The cook thought it was funny. I thought it was funny. I laughed, up here, alone, with the money in the snow."
@clue odile_last The Warden came to Odile at 1 a.m., sober, and begged her to cancel. She paid him to leave. He said: "Tell her I'll show her tomorrow."
@add odile 1
=> ch_odile

== ch_o_twohours
ODILE: "I can do arithmetic, Examiner." The cigarette has gone out. She doesn't relight it. "I've been doing it all day."
TENDERNESS: She hasn't slept either. Look at the powder on her face — put on over powder from yesterday. She never went to bed.
@add odile 1
=> ch_odile

== ch_o_face
ODILE: "I won't look at his face because I know it." She turns back to the curtain. "Thirty-five years ago I was the first girl who ever danced on this floor. It was smaller then. Just a tent and a fiddler and a brazier. And one night a Rime boy came in off the ice with frost in his eyebrows and asked me if I knew that the ice under my feet was singing."
ODILE: "I didn't. He made me kneel down and put my ear to the boards." Almost a smile. "It was singing. Low. Like a cello in another room."
ODILE: "He sang to the ice and I danced on it. We thought that was the same thing." The smile goes. "Four winters. Then he wanted me to go north with him, to the lakes. And I wanted a dance hall." She gestures at the red velvet, the gauze, the whole shining machine below. "I got a dance hall."
@set knows_odile_past
@add odile 2
@clue odile_past Odile and the Warden were lovers, thirty-five years ago. He wanted her to go north with him; she chose the Chandelier.
@xp 15
=> ch_odile

== ch_o_money
ODILE: "If there's no Ball?" She laughs properly this time — a short, bitter bark. "I owe the Mutual eleven thousand crowns on a policy loan against this building. Tonight pays the note. Six hundred tickets at five crowns, and the bar, and the cloakroom."
ODILE: "No Ball, no note. No note, the Mutual takes the Chandelier on the first of spring, and forty people who work for me go home to the Glass with nothing in their pockets two weeks before the thaw." She looks at you. "Is that what you came up the stairs to hear?"
@if pass("ARCHIVE", 11)
ARCHIVE(11): Wait. The standard Mutual business policy — you have read a hundred of them in probate. Losses from voluntary cancellation: not covered. Losses from closure *by lawful order* — fire, fever, the Crown — covered in full.
ARCHIVE: If *she* cancels, she's ruined. If *you* close the ice, the Mutual pays.
@set knows_mutual_clause
@clue clause A Mutual business policy pays for closure "by lawful order" — but not for a voluntary cancellation. If the Examiner closes the ice, Odile is covered. If she cancels, she is ruined.
@xp 15
@elif ilse >= 2 && !knows_mutual_clause
ILSE: From the top of the stair, quietly: "Examiner. Schedule four." When you look at her: "I've typed two hundred probate files. Mutual business policies pay on closure *by lawful order*. Not on voluntary cancellation." She looks at Castellane. "If she cancels, she's ruined. If *you* close the ice, the Mutual pays."
@set knows_mutual_clause
@clue clause A Mutual business policy pays for closure "by lawful order" — but not for a voluntary cancellation. If the Examiner closes the ice, Odile is covered. If she cancels, she is ruined.
@add ilse 1
@endif
=> ch_odile

== ch_o_cancel
ODILE: "No."
?{!has_log && !knows_candle && !proof_fist && !clue("soft_cut")} ODILE: "On what grounds, Examiner? A drunk's word, which I've been buying for thirty years at forty crowns a word?"
* {knows_mutual_clause} "Don't cancel it. Let me close the ice by order. The Mutual pays you if it's my order." -> ch_o_clause
* {proof_fist} [Put the piece of rotten ice from his fist on her desk.] -> ch_o_proof
* {knows_odile_past} [TENDERNESS {12 - (has_log ? 2 : 0) - (knows_candle ? 1 : 0)}] "He came up your kitchen stair sober to tell you. He went under the ice to prove it to you. Madame — he died *for you to believe him*." -> ch_o_yes | ch_o_no
* [LEDGER {12 - (has_log ? 1 : 0) - (has_logbook ? 2 : 0)}] "Six hundred people on a floor above rotten ice. Do the arithmetic you've been doing all day." -> ch_o_yes | ch_o_no
* [GRAVITAS 13] "I am not asking." -> ch_o_yes | ch_o_no
* "Not yet, then." -> ch_odile

== ch_o_clause
ODILE: She looks at you for a long moment. "Closure by lawful order." She says it slowly, like a woman reading a door she's walked past for thirty years and never noticed had a handle. "You'd put it on the Crown. On your own name."
@if odile >= 1
ODILE: "...The Mutual would scream."
* "Let it scream. Move the Ball to the shore. Tonight." -> ch_o_yes_clause
@else
ODILE: "And why would an Examiner of the Crown do that for a woman who wanted to put a carpet over a dead man?" She shakes her head. "No. I don't take gifts I can't see the bottom of."
@set odile_clause_heard
=> ch_odile
@endif

== ch_o_yes_clause
@set odile_order_plan
=> ch_o_yes

== ch_o_proof
> You set it on the red blotter between you: a fist-sized cluster of ice from the dead man's hand, wrapped in Ilse's handkerchief. You unfold the cloth.
> It is not a block. It is a bundle of long clear needles, standing side by side like matches in a box. In the warmth of the office, as you both watch, they begin to slide apart. One falls over. Then three. Then the whole thing slumps with a tiny glassy sigh into a heap of wet splinters.
ODILE: She stares at it. She doesn't speak for a long time.
ODILE: "He always said you could argue with a man but you couldn't argue with sugar." Her voice is not quite steady. "That's from under my floor?"
=> ch_o_yes

== ch_o_yes
@set f_odile
@add odile 1
ODILE: She stubs out the cigarette on the blotter itself, grinding it through the leather. "At midnight I'll tell them the Ball is moving to the Customs warehouse on the shore. Free wine to anyone who walks. Benny can play them across."
ODILE: "Half of them won't go. They came to dance on the Glass. Nobody pays five crowns to dance on a *floor*." She looks at you. "And the Glass itself — eleven hundred people asleep in their huts over this — that isn't mine to move. That's yours."
@clue odile_yes Odile will move the Ball to the Customs warehouse on the shore at midnight.
@xp 25
=> ch_odile

== ch_o_no
ODILE: "No." She turns back to the curtain and the bright floor below. "Get out of my gallery, Examiner. I have a Ball to give."
@add odile -1
=> ch_floor

== ch_o_dance
@set danced
@thought waltz
> She looks at your offered hand as though it were a small, suspicious animal. Then — with the air of a woman taking up a dare she has refused for thirty years — she puts her cigarette holder down on the desk.
ODILE: "Benny!" Over the gallery rail. "'The Candle Waltz'. From the top. *Slowly*."
> Below, the old man looks up, sees who is standing at the rail, and grins like a boy.
> On the empty floor, under the dripping chandelier, the Examiner of the Third Bench waltzes with the owner of the Chandelier. The waiters stop polishing. The cellist forgets to be bored.
DECORUM: One-two-three. One-two-three. Don't lead — she's leading — let her lead. Your feet remember. Look: your feet *remember*.
BAROMETER: The floor rings under you — a sprung floor over a thousand stilts over sixty centimeters of ice over black water. It is like dancing on the skin of a drum.
ODILE: Close to your ear, not missing a step: "He danced like a bear. Like a bear who's been *told* about dancing. I loved it." A turn. "I never told him. I told him he danced like a bear."
ODILE: "The last time he came up my stair — last night — he stood right there, at the curtain, and he said, 'You'll be dancing on it, Odile. When it goes, you'll be dancing on it.'" Her hand tightens on your shoulder. "I told him that was the only way I'd want to go."
@set knows_odile_past
@add odile 2
@add thaw 1
> The waltz ends. She steps back and looks at you with an expression you can't read — something between gratitude and grief and irritation at being made to feel either.
ODILE: "You dance like a man filing a report." A pause. "Thank you."
=> ch_odile

== ch_o_dance_f
ODILE: "I don't dance with the Crown, Examiner." She doesn't even turn from the curtain. "The Crown has two left feet and a pension."
DECORUM: She's right. You offered your hand like a warrant.
=> ch_odile
`);
