CANDLE.script(String.raw`
// ---------------------------------------------------------------- the Evening Lamp
// Act II, optional: the newspaper's winter sledge by the gate, and the woman
// who printed the story that sent the Examiner on leave.
== lp_enter
@bg press
@title THE EVENING LAMP — WINTER OFFICE
@if seen("lp_enter") > 1
@time 10
=> lp_return
@endif
@time 20
@sfx door
> The *Evening Lamp* keeps a winter office on the Glass: a long sledge-house on iron runners parked by the gate, its stovepipe smoking, its one window pasted over with yesterday's sheet so that the lamplight inside comes through the print, backwards, like a thought you can't quite read.
> Inside it smells of ink and hot metal and paraffin and wet wool. A hand press the size of a small cow stands in the middle of the floor with its great iron wheel. Proofs hang drying on strings across the ceiling like washing. There is a stove, a kettle, a cot, a case of type, and a woman.
WREN: She is standing at the type case in shirtsleeves and an ink-black apron, a green celluloid eyeshade pushed up into a nest of red hair, setting letters into a steel stick with a speed that looks like knitting. She doesn't turn round. "Door. Wind. Please."
> You shut the door. She finishes a line, taps it level with a fingernail, and only then looks up. Her eyes go to your coat, and your face, and your hands, in that order, and something happens behind them that you recognise: the small hard click of a person filing you.
WREN: "Well." A slow smile, not friendly. "The Laughing Examiner. On the Glass. On *tonight* of all nights." She sets down the stick. "Wren Aske. The *Lamp*. We've met, though you won't remember. I was in the third row at the Fennimore inquest. I had a very good view."
ILSE: From the doorway, flat as a ruler: "Miss Aske."
WREN: "*Varga.*" Genuine delight. "Still typing other people's sentences?"
ILSE: "Still selling them?"
UNDERTOW: They know each other. There's a whole Last Line between them nobody's entered.
@set met_wren
* "You wrote the Fennimore story." -> lp_fennimore
* "I'm here about the Warden." -> lp_talk
* [Say nothing. Look at what she's setting.] -> lp_look

== lp_look
@insert v_broadsheet
> The steel stick in her hand holds a line of type, backwards, the way type always is — the world as a mirror sees it. On the stone beside it, a page is half made up: a masthead, a rule, and three words in the biggest type she owns.
> *WARDEN DROWNS IN DRINK.*
WREN: She follows your eyes and doesn't hide it. "Tomorrow's special. Four hundred copies. Already paid for." She says it the way a fisherman says *already sold*.
@set saw_headline
=> lp_talk

// ---------------------------------------------------------------- talk
== lp_talk
+ {!seen("lp_fennimore")} "You wrote the Fennimore story." -> lp_fennimore
+ {!saw_headline} "What are you printing tomorrow?" -> lp_look
+ {saw_headline && !seen("lp_drink") && !seen("lp_drink_f")} [OBJECTION 10] "'In drink.' Who told you he was drunk?" -> lp_drink | lp_drink_f
+ {!seen("lp_came")} "Did the Warden ever come to you?" -> lp_came
+ {seen("lp_came") && !seen("lp_notice") && !seen("lp_notice_f")} [TENDERNESS 10] "You still have it. Whatever he brought you." -> lp_notice | lp_notice_f
+ {seen("lp_fennimore") && !seen("lp_why") && !seen("lp_why_skip")} "Ask me, then. What you came to the third row to ask." -> lp_why
+ {!seen("lp_stick") && !seen("lp_stick_f")} [SLEIGHT 11] [Read the other stick on the stone — the one she turned face down when you came in.] -> lp_stick | lp_stick_f
+ {!seen("lp_coffee")} [APPETITE: The kettle. There is coffee in it. You can smell it from here.] -> lp_coffee
+ {seen("lp_drink") && !wren_holds && !seen("lp_hold_f")} [DECORUM 11] "Hold the page, Miss Aske. One night. I'll give you a better one." -> lp_hold | lp_hold_f
+ {seen("lp_drink") && !wren_holds && !seen("lp_hold2")} [GRAVITAS 12] "By the authority of the Inquest Office, the death of Ailo Sarre is sub judice. Print that headline and I'll see you in the dock." -> lp_hold2 | lp_hold2_f
+ [Leave.] -> lp_bye

// ---------------------------------------------------------------- Fennimore
== lp_fennimore
WREN: "I did." No hesitation. No apology. "Page three. Two columns. 'EXAMINER LAUGHS AT DROWNED BOY'S INQUEST.'" She wipes her fingers on the apron; it makes no difference to either. "The subs wanted it on the front. I talked them down to page three. You're welcome."
WREN: "I was the only paper in the room. Your clerk here told the family the stenograph had frozen." A glance at Ilse. "Very enterprising. Nobody believes a stenograph. Everybody believes the *Lamp*."
ILSE: She says nothing. Her knuckles are white on the notebook.
STARCH: Collar. Chin. She wants you to flinch. She is a professional; she's waiting for the flinch the way a photographer waits for the smile.
* [STARCH 10] "It was accurate. I did laugh." -> lp_fen_accurate | lp_fen_flinch
* "You ended a twenty-nine-year career with two columns on page three." -> lp_fen_career
* "Why are you telling me this?" -> lp_fen_why

== lp_fen_accurate
WREN: That stops her for a second — only a second, but you see it. "Most people say *out of context*," she says. "Most people say *grief takes strange forms* or *I had not slept*." She tilts her head. "You're the first one who's ever just said *accurate.*"
@add wren 1
@set wren_respect
=> lp_talk

== lp_fen_flinch
> You mean to say it evenly. It comes out a little too loud, and a little too fast, and at the end of it your voice does a thing you did not authorise.
WREN: She watches it happen with professional interest, and — you notice, because you notice things — writes nothing down. "There it is," she says, not unkindly. "That's what I heard in the third row."
@morale -1
=> lp_talk

== lp_fen_career
WREN: "No." Flatly. "You ended it. Laughing. I wrote it down." She picks the stick up again. "That's the job, Examiner. Same as yours. You write the line and the family lives with it. I write the line and you live with it. Neither of us gets to make it kinder than it was."
OBJECTION: A decent argument. She has made it before — to herself, late, more than once. The seams show.
=> lp_talk

== lp_fen_why
WREN: "Because you walked into my office on the night the Glass is going to find out whether its Warden was a drunk or a saint." She shrugs. "And because I've wondered for four months what you were laughing at. A reporter doesn't get many second chances at the same man."
=> lp_talk

== lp_why
WREN: She puts the stick down properly this time. Wipes her hands. Pulls a stool round with her foot and sits on it, leaning forward, elbows on knees, and for the first time she looks less like a reporter than like somebody who has been waiting a long time for a tram.
WREN: "All right. Why did you laugh?"
* "Because the boy's Line said 'misadventure, in the course of the rescue of—' and there's no ending to that sentence that isn't a joke." -> lp_why_joke
* "Because it was the first time in forty-four years I'd heard my own story read out loud, and it had somebody else's name in it." -> lp_why_truth
* "I don't know. That's the honest answer. I still don't know." -> lp_why_dunno
* "That's not yours to have, Miss Aske." -> lp_why_skip

== lp_why_joke
WREN: She considers it. "That's clever," she says. "That's the answer you've been giving yourself." She doesn't write it down. "It isn't the true one. I've heard a lot of true ones. They're never clever."
@add wren 1
=> lp_talk

== lp_why_truth
> You say it, and it is out in the ink-smelling warmth of the sledge before you can call it back: the whole thing, very short. A canal. A boy of twelve who went in after his little brother. A Line with a hole in it the exact shape of your own.
WREN: She's quiet for a long moment. Then: "Your brother." Not a question. "The *Lamp* has a morgue. I looked you up after Fennimore — I thought there'd be drink, or a woman. There was a clipping from forty-four winters ago instead. 'Boy pulled from Basin; brother lost.'" She rubs her thumb over an ink stain on her wrist. "I nearly ran it. I had it set. A follow-up. 'The Laughing Examiner's Secret Grief.' Page one."
* "Why didn't you?" -> lp_why_didnt
* "Run it. It's true." -> lp_why_runit

== lp_why_didnt
WREN: "I don't know." She laughs, short, at herself. "Isn't that funny. There's your answer back." She stands, kicks the stool away. "I had it set and I looked at it on the stone and it looked — *mean*. It's not the first mean thing I've set. It's the first one I couldn't lock in the chase." She shrugs. "I distributed the type. Every letter back in its box. First time in nine years."
TENDERNESS: She has never told anybody that. Not the editor. Not herself, out loud.
@add wren 2
@add thaw 1
@set wren_knows_feliks
=> lp_talk

== lp_why_runit
WREN: She stares at you. "You'd let me."
* "It's true. True things should be somewhere." -> lp_why_runit2
* "No. I wanted to see what you'd say." -> lp_why_didnt

== lp_why_runit2
WREN: "Somewhere." She turns the word over like a coin of a currency she doesn't use. "Not in the *Lamp*, Examiner. Not like that." She shakes her head, almost angry. "Put it in your own record. Get Varga to type it. It'll mean something there." A glance at the doorway. "It'd only sell papers here."
ILSE: From the doorway, very quietly, for the first time without a blade in it: "Thank you, Wren."
@add wren 2
@set wren_knows_feliks
@add thaw 1
=> lp_talk

== lp_why_dunno
WREN: "No," she agrees. "Nobody ever does. That's why I keep asking." She stands. "It's a better answer than most."
@add wren 1
=> lp_talk

== lp_why_skip
WREN: "No," she agrees, after a moment. "I suppose it isn't." She turns back to the case. The small hard click goes on behind her eyes, but slower.
=> lp_talk

// ---------------------------------------------------------------- the headline
== lp_drink
OBJECTION: Nobody sets four hundred copies of *in drink* on the strength of a rumour. Somebody sold her the drink.
WREN: She holds your eye a moment longer than is comfortable, then sighs. "A young man from the Works came by at six. Very clean collar. Very new boots. He paid for the paper in advance — four hundred sheets and the ink — and he mentioned, in passing, that the Warden had been seen at the Chandelier's back door at noon, sodden."
* "And you didn't check." -> lp_drink_check
* "The Works bought the headline." -> lp_drink_bought

== lp_drink_check
WREN: "Check with whom? The Warden?" A thin smile. "He was *always* at the Chandelier's back door at noon. He was *always* sodden. That's the joy of a drunk, Examiner. You never have to check."
LEDGER: Except that the Chandelier's back door at noon is where he went to tell Odile Castellane her ballroom was sitting on sugar. You have that from Odile. Not drunk. Warning.
=> lp_drink_bought

== lp_drink_bought
LEDGER: Item: a drunk Warden is a misadventure — or worse, a self-inflicted — and either way nobody asks about warm water. Item: a warm-water Warden is an unlawful killing by the Aubade Cold and Light Company. Item: the Company has just bought four hundred copies of the first kind.
WREN: She hears it arrive in your face. "Yes," she says. "I can do arithmetic too. I'm a printer; I count letters for a living." She taps the headline on the stone. "It's still a good headline. It's short. It sells."
@clue lamp_bought The Works paid in advance for tomorrow's special sheet of the Evening Lamp: WARDEN DROWNS IN DRINK.
@xp 15
=> lp_talk

== lp_drink_f
WREN: "Everybody told me. That's how drunks work." She goes back to the case. "You're very welcome to prove me wrong, Examiner. You'll have to be quick. I lock the forme at two."
=> lp_talk

== lp_hold
DECORUM: Not a threat. A courtesy. She's a professional; offer her the thing professionals want, which is to be treated as one.
> You tell her, in the voice you used to use on newly appointed magistrates, that you are not asking her to print nothing. You are asking her to print the truth, tomorrow, and to be the only paper in Aubade that has it. You tell her the Examiner of the Third Bench is about to rule on this death, and that the ruling will be the story of the winter, and that nobody will want a sheet that says *drink* when every other sheet in the city says what really happened under the ice.
WREN: She listens with her head tilted, the way a printer listens to a press for the wrong note. Then she reaches out and, without taking her eyes off you, tips the headline out of the chase with one finger. The type spills onto the stone with a sound like dropped teeth.
WREN: "One night. If you're lying to me, I'll set *LAUGHING EXAMINER LIES TO PRESS* in seventy-two point and I'll enjoy every letter."
@set wren_holds
@add wren 1
@xp 20
=> lp_talk

== lp_hold_f
WREN: "That's very smooth." She doesn't stop setting. "Magistrates must love you. I'm not a magistrate. I've got four hundred sheets paid for and a boy coming at five to run them." She glances up. "Give me something better than *better*."
=> lp_talk

== lp_hold2
GRAVITAS: Say it in the Office voice. The one they use to stop a room.
> The sledge goes very quiet. Even the stove seems to hold its breath.
WREN: She looks at you for a long moment. Then she laughs — a real one, surprised out of her. "*Sub judice.* On the Glass." She tips the headline out of the chase. "All right, Examiner. You've earned one night. I've never been threatened with the dock by a man in a mended coat before. It's refreshing."
@set wren_holds
@add wren -1
@xp 15
=> lp_talk

== lp_hold2_f
WREN: "Oh, please." She doesn't even look up. "You're on leave, the Office thinks you're mad, and there's no Line entered yet. Sub judice my aunt." A pause. "Nice voice, though. You should do the wireless."
@add wren -1
=> lp_talk

// ---------------------------------------------------------------- the Warden came
== lp_came
WREN: Something moves across her face and is put away. "Six days ago. He came in out of the snow with his hat in his hand, which I'd never seen, and put three crowns on the stone, which I'd never seen either, and asked me to print a notice."
WREN: "I said no."
* "Why?" -> lp_came_why
* [Wait.] -> lp_came_why

== lp_came_why
WREN: "Because he was Ailo Sarre." She says it as if that were the whole sentence. "Because everybody on the Glass knew he took money to say *safe*, so when he came in saying *unsafe*, everybody assumed he wanted more. Because the Works buys my back page and the Mutual buys my front one. Because I didn't believe him." She sets a letter. Sets another. "Pick one. I've been picking one every night for six days."
TENDERNESS: She's been picking one every night for six days.
=> lp_talk

== lp_notice
TENDERNESS: She's kept it. Of course she's kept it. People like Wren Aske keep everything. It's how they don't have to feel it.
> She doesn't answer. She reaches up to a steel spike on the wall where the rejected copy goes — a foot of paper skewered through the middle, a year of other people's hopes — and works her fingers down through the stack without looking, as if she knows exactly how deep it is. She pulls out a half-sheet of grey fish-paper and puts it on the stone in front of you.
@insert v_letter
@sfx paper
DOC: NOTICE TO ALL ON THE GLASS. The ice will go at the Thaw Ball. It is rotten underneath along a line from the Works to the Chandelier and on to the Narrows. Do not go to the Ball. Do not sleep on the ice after the Mild. Go ashore when the bell rings. I am not drunk. — A. Sarre, Warden.
> *I am not drunk* has been underlined twice, hard enough to tear the paper.
WREN: "He wrote that last bit at the stone," she says. "In front of me. Because I'd said it. Because I'd said *you're drunk, Ailo, go home*." She looks at the tear in the paper for a long time. "He wasn't. He wasn't, was he."
* "No." -> lp_notice_no
* "He was a little. He was always a little. It didn't make him wrong." -> lp_notice_little

== lp_notice_no
WREN: She nods. She doesn't cry; she isn't the type. She folds the notice once, very precisely, along an old crease, and gives it to you. "Evidence," she says. "Put it somewhere it'll mean something."
@clue sarre_notice Six days before he died, the Warden tried to have a warning printed in the Evening Lamp: THE ICE WILL GO AT THE THAW BALL. The Lamp refused.
@set has_notice
@add wren 2
@add thaw 1
@xp 20
=> lp_talk

== lp_notice_little
WREN: A surprised huff that is almost a laugh. "Yes. He was." She folds the notice precisely along an old crease and gives it to you. "That's the first true thing anybody's said about him all week. Take it. Evidence."
@clue sarre_notice Six days before he died, the Warden tried to have a warning printed in the Evening Lamp: THE ICE WILL GO AT THE THAW BALL. The Lamp refused.
@set has_notice
@add wren 2
@add thaw 1
@xp 20
=> lp_talk

== lp_notice_f
WREN: "Whatever he brought me went on the spike with everything else." She jerks her chin at a foot of skewered paper on the wall. "That's where the rejected copy goes. It's a very democratic spike."
=> lp_talk

// ---------------------------------------------------------------- the face-down stick
== lp_stick
SLEIGHT: Upside down and backwards is only a knot you haven't untied yet. You read type the way you read a pocket: without seeming to look.
> The second stick lies face-down on the stone. When she turns to the kettle you tip it with one finger, read it, and let it fall back before the kettle has stopped pouring.
> *EXAMINER RETURNS TO BASIN WHERE BROTHER DROWNED.*
@if wren_knows_feliks
WREN: She's watching you in the dark window, where the lamp makes a mirror of the glass. "I set that one before you came in," she says quietly. "I'm going to distribute it. I just hadn't got round to it." She puts a cup of coffee by your hand. "Honestly."
@add wren 1
@else
WREN: She's watching you in the dark window, where the lamp makes a mirror of the glass. She doesn't pretend. "It's a good story," she says. "It's the best story on the Glass tonight, after the drunk. It's true, isn't it?"
* "It's true. It's not yours." -> lp_stick_mine
* "Print it if you like. I'm tired of it being a secret." -> lp_stick_print
@endif
?{wren_knows_feliks} => lp_talk

== lp_stick_mine
WREN: She holds your eye. Then — slowly, deliberately, as if showing you a card trick — she picks up the stick, turns it over, and tips the line back into the case letter by letter, each one into its own box. It takes a full minute. She doesn't hurry.
WREN: "There," she says. "Now it's nobody's."
@add wren 1
@set wren_knows_feliks
=> lp_talk

== lp_stick_print
WREN: "Tired of it." She repeats it as if checking the spelling. "No. I don't think I will, Examiner. Tired people say things in print they don't mean in the morning." She lays the stick aside. "Ask me again tomorrow."
@add wren 1
@set wren_knows_feliks
=> lp_talk

== lp_stick_f
> You try to read it, but upside-down and backwards and face-down is one inversion too many, and by the time you have it half untangled she has turned from the kettle and put her ink-black hand flat on the stick.
WREN: "Manners," she says pleasantly.
=> lp_talk

// ---------------------------------------------------------------- coffee
== lp_coffee
APPETITE: Coffee. Actual coffee, black and bitter and boiled twice, the colour of a fact. You haven't had a cup since the ferry.
WREN: She sees you looking and pours without asking, into a cup with the *Lamp*'s masthead printed on it and half the handle gone. "Occupational," she says. "Everybody who comes in here is either cold or lying. Usually both. Coffee helps with one."
> It's terrible. It's wonderful. The heat goes down into you like a rope going down a hole.
@health 1
@add wren 1
=> lp_talk

// ---------------------------------------------------------------- leaving
== lp_bye
@if wren_holds
WREN: "Tomorrow, Examiner. A better page." She's already resetting the stone. "If there's a Glass to deliver it to."
@elif has_notice
WREN: She doesn't look up. "Put it somewhere it'll mean something," she says again, to the type.
@else
WREN: "Door," she says. "Wind." And then, as you go: "It was a very good view, from the third row. You looked like a man who'd just been told a joke he'd been waiting his whole life to hear."
@endif
-> hub2

== lp_return
WREN: "Examiner." The eyeshade goes up. "Back for the coffee or the abuse?"
=> lp_talk

// ---------------------------------------------------------------- Act III: the special sheet
== a3_press
@bg press
@title THE EVENING LAMP — WINTER OFFICE
@time 30
> The sledge is rocking gently on its runners. There's a quarter-inch of water on the floor now, and the stove hisses every time the door opens. Wren has the press going already — the big wheel turning, the platen kissing the forme with a sound like a slow heartbeat — but the stone beside it is empty.
WREN: "Examiner." She doesn't stop pulling. "I'm printing the tide tables. It's what we print when we haven't got anything. Nobody's going to need tide tables tonight." She looks at the water on the floor. "Or they're going to need them very badly."
@if wren_holds || has_notice || wren >= 3
WREN: She stops the wheel. "Well?" she says. "You promised me a better page."
* "THE ICE WILL GO TONIGHT. Walk ashore now. By order of the Examiner." -> a3_pr_order
* {has_notice} "His notice. Print his notice. Word for word. Six days late." -> a3_pr_notice
* [LEDGER 9] "Print the arithmetic. Eleven hundred souls. Four million crowns. Sixty centimeters of sugar." -> a3_pr_sums | a3_pr_sums_f
* "Not yet. I'm not ready." -> hub3
@else
* [OBJECTION 11] "The Works bought your headline, Miss Aske. Sell them a better one." -> a3_pr_persuade | a3_pr_no
* [TENDERNESS 12] "Six days ago a man came in here with his hat in his hand. You've been picking a reason every night since. Pick a different one." -> a3_pr_persuade | a3_pr_no
* "I'll come back." -> hub3
@endif

== a3_pr_persuade
WREN: She stands very still with her hand on the wheel. Then she swears — a long, inventive, compositor's oath involving the Great Mutual's grandmother — and sweeps the tide tables off the stone with her forearm. "Fine. Fine. What am I setting?"
@set wren_holds
* "THE ICE WILL GO TONIGHT. Walk ashore now. By order of the Examiner." -> a3_pr_order
* {has_notice} "His notice. Print his notice. Word for word. Six days late." -> a3_pr_notice

== a3_pr_no
WREN: "No." She starts the wheel again. "I've been wrong once this week. I'd like to be wrong about something else next time, for variety." She doesn't look at you. "Go and stand on a bandstand, Examiner. That's your press."
@set wren_refused
-> hub3

== a3_pr_order
> She sets it herself, fast, in the big wooden type they keep for fires and elections: *THE ICE WILL GO TONIGHT.* And under it, smaller: *The Examiner of the Third Bench orders the Glass cleared. Walk ashore now. Do not wait for morning. Do not wait for the bell.*
=> a3_pr_print

== a3_pr_notice
> She takes the grey half-sheet from you, smooths it flat on the stone, and sets it word for word, exactly as he wrote it, down to the double underline — which she does with two rules of brass, hard, so they'll bite into the paper the way his pencil did.
> *I am not drunk. — A. Sarre, Warden.*
WREN: Under it, in small type, she adds a line of her own: *The Lamp declined to print this notice six days ago. The Lamp was wrong.* She looks at it for a long moment. "That's going to cost me my back page," she says. "Good."
@set pressed_notice
=> a3_pr_print

== a3_pr_sums
LEDGER: Give them numbers. Numbers are the only thing on the Glass that everybody believes, because nobody likes them.
> She sets it as a table, like a column of fish prices: *Souls on the ice: 1,140. Average valuation: 3,600 crowns. Sum at risk: 4,104,000 crowns. Thickness of the ice: 60 centimetres. Thickness of the ice that will hold you: 0.* And under it: *The Mutual has done this sum. Have you?*
WREN: "That's horrible," she says admiringly. "It'll sell out."
=> a3_pr_print

== a3_pr_sums_f
LEDGER: The numbers won't line up. You have the souls and the crowns and the centimetres, and every way you set them down they come out sounding like an advertisement for the Mutual.
WREN: "Examiner." Gently, for her. "Just tell them to walk."
=> a3_pr_order

== a3_pr_print
@sfx paper
> Then the wheel turns, and turns, and the sheets come off the platen one after another, wet and black and smelling of hot oil, and Wren is feeding and pulling and swearing, and Ilse — without being asked — has her coat off and is laying the sheets out to dry along the cot, the stove, the floor, every surface in the sledge.
@if seen("gu_enter")
> At the door, Gull is already there with four other boys you've never seen, bags over their shoulders, hopping from foot to foot in the wet. "Every hut," Gull says. "Every hut in an hour. I know where they all are." He does. He always has.
@else
> At the door, a gang of Wren's delivery boys are hopping from foot to foot in the wet, bags open. "Every hut," Wren tells them. "Every hut, every tent, every bar. Wake them up. Shove it under the door if you have to. Go."
@endif
@set f_press
@insert v_broadsheet
> The first one she hands you is still warm. The ink comes off on your fingers.
WREN: "Special sheet," she says. "Free of charge." She looks tired and pleased and very young suddenly. "First one ever."
@xp 25
-> hub3
`);
